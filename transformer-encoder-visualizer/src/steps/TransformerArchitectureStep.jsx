import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { pipeline, env } from "@xenova/transformers";

env.useBrowserCache = true;
env.allowLocalModels = false;

let generatorInstance = null;
let generatorLoading = false;
const waiters = [];

async function getGenerator(onProgress) {
  if (generatorInstance) return generatorInstance;
  if (generatorLoading) {
    return new Promise((resolve) => waiters.push(resolve));
  }
  generatorLoading = true;
  generatorInstance = await pipeline(
    "text-generation",
    "Xenova/distilgpt2",
    {
      progress_callback: (data) => {
        if (data.status === "progress" && onProgress) {
          onProgress(Math.round(data.progress));
        }
      },
    }
  );
  generatorLoading = false;
  waiters.forEach((fn) => fn(generatorInstance));
  waiters.length = 0;
  return generatorInstance;
}

function bez(x1, y1, x2, y2, b1 = 0, b2 = 0) {
  const dx = (x2 - x1) * 0.38;
  return `M${x1},${y1} C${x1 + dx},${y1 + b1} ${x2 - dx},${y2 + b2} ${x2},${y2}`;
}

const PAL = {
  dark: {
    embed: "#22d3ee",
    selfAttn: "#a78bfa",
    ffn: "#fbbf24",
    crossAttn: "#4ade80",
    output: "#f472b6",
    dim: "#334155",
    text: "#e2e8f0",
    sub: "#64748b",
    pill: "#0f172a",
    res: "#f97316",
  },
  light: {
    embed: "#0891b2",
    selfAttn: "#7c3aed",
    ffn: "#d97706",
    crossAttn: "#16a34a",
    output: "#db2777",
    dim: "#cbd5e1",
    text: "#1e293b",
    sub: "#94a3b8",
    pill: "#f8fafc",
    res: "#ea580c",
  },
};

const STAGES = [
  { key: "embed", x: 140, c: "embed", l: "Embed" },
  { key: "selfAttn", x: 270, c: "selfAttn", l: "Self-Attention" },
  { key: "encFFN", x: 390, c: "ffn", l: "Feed-Forward" },
  { key: "crossAttn", x: 560, c: "crossAttn", l: "Cross-Attention" },
  { key: "decFFN", x: 690, c: "ffn", l: "Feed-Forward" },
  { key: "outProj", x: 820, c: "output", l: "Output" },
];

const DESC = {
  embed: "Converts words to vectors",
  selfAttn: "Words attend to each other",
  encFFN: "Transforms representations",
  crossAttn: "Decoder attends to encoder output",
  decFFN: "Transforms representations",
  outProj: "Predicts next token probabilities",
};

const CY = 220;
const SVG_W = 960;
const SVG_H = 440;

function TransformerArchitectureStep({ active, theme, setStep }) {
  const isDark = theme === "dark";
  const p = PAL[isDark ? "dark" : "light"];

  const [prefix] = useState("The cat sat on the");
  const [lastWord, setLastWord] = useState("mat");
  const [inToks, setInToks] = useState([]);
  const [outToks, setOutToks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flowing, setFlowing] = useState(false);
  const [hov, setHov] = useState(null);
  const [error, setError] = useState("");
  const [modelStatus, setModelStatus] = useState("idle");
  const [modelProgress, setModelProgress] = useState(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    setModelStatus("loading");
    getGenerator(setModelProgress)
      .then(() => setModelStatus("ready"))
      .catch(() => setModelStatus("error"));
  }, []);

  const run = useCallback(
    async (word) => {
      const text = `${prefix} ${word}`.trim();
      if (!text || loadingRef.current || modelStatus !== "ready") return;
      const toks = text.split(/\s+/).slice(0, 10);
      setInToks(toks);
      setOutToks([]);
      setError("");
      loadingRef.current = true;
      setLoading(true);
      setFlowing(true);
      try {
        const generator = await getGenerator();
        const result = await generator(text, {
          max_new_tokens: 15,
          temperature: 0.7,
          do_sample: true,
        });
        const fullText = result[0].generated_text;
        const gen = fullText.slice(text.length).trim();
        if (gen) setOutToks(gen.split(/\s+/).slice(0, 8));
        else throw new Error("Empty generation");
      } catch (err) {
        setError(err.message || "Generation failed");
      }
      loadingRef.current = false;
      setLoading(false);
    },
    [prefix, modelStatus]
  );

  useEffect(() => {
    if (!lastWord.trim() || modelStatus !== "ready") return;
    const timer = setTimeout(() => run(lastWord), 600);
    return () => clearTimeout(timer);
  }, [lastWord, run, modelStatus]);

  const spacing = (n) => Math.min(34, 300 / Math.max(n, 1));
  const yPos = (i, n) =>
    CY - (n * spacing(n)) / 2 + i * spacing(n) + spacing(n) / 2;

  const flows = [];

  inToks.forEach((_, i) => {
    const bend = (i - (inToks.length - 1) / 2) * 12;
    flows.push({
      d: bez(85, yPos(i, inToks.length), 128, CY, bend, 0),
      c: p.embed,
      dl: i * 0.12,
    });
  });

  for (let si = 0; si < STAGES.length - 1; si++) {
    const s = STAGES[si];
    const nx = STAGES[si + 1];
    const col = p[s.c];
    [-12, 0, 12].forEach((off, li) => {
      flows.push({
        d: bez(
          s.x + 12,
          CY + off,
          nx.x - 12,
          CY + off,
          off * 1.5,
          -off * 1.5
        ),
        c: col,
        dl: si * 0.2 + li * 0.07,
        op: li === 1 ? 0.3 : 0.15,
        w: li === 1 ? 1.8 : 1.2,
      });
    });
  }

  flows.push({
    d: `M${STAGES[2].x},${CY - 15} C${STAGES[2].x},${CY - 95} ${STAGES[3].x},${CY - 95} ${STAGES[3].x},${CY - 15}`,
    c: p.crossAttn,
    dl: 0.5,
    w: 1.8,
    op: 0.25,
  });

  // Encoder residual: encFFN → selfAttn (reverse, below)
  flows.push({
    d: `M${STAGES[2].x},${CY + 15} C${STAGES[2].x},${CY + 75} ${STAGES[1].x},${CY + 75} ${STAGES[1].x},${CY + 15}`,
    c: p.res,
    dl: 0.3,
    w: 1.4,
    op: 0.2,
    rev: true,
  });

  // Decoder residual: decFFN → crossAttn (reverse, below)
  flows.push({
    d: `M${STAGES[4].x},${CY + 15} C${STAGES[4].x},${CY + 75} ${STAGES[3].x},${CY + 75} ${STAGES[3].x},${CY + 15}`,
    c: p.res,
    dl: 0.6,
    w: 1.4,
    op: 0.2,
    rev: true,
  });

  outToks.forEach((_, i) => {
    const bend = (i - (outToks.length - 1) / 2) * 10;
    flows.push({
      d: bez(832, CY, 870, yPos(i, outToks.length), 0, bend),
      c: p.output,
      dl: 0.8 + i * 0.1,
    });
  });

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className={`w-[980px] flex flex-col gap-2 p-5 rounded-2xl border ${
        isDark
          ? "border-cyan-500/20 bg-slate-950/90"
          : "border-blue-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {modelStatus === "loading" ? (
          <div
            className={`flex-1 flex items-center gap-3 px-4 py-2 rounded-xl text-sm ${
              isDark
                ? "bg-slate-900 border border-slate-700"
                : "bg-slate-50 border border-slate-300"
            }`}
          >
            <span
              className={`animate-pulse ${
                isDark ? "text-cyan-400" : "text-blue-600"
              }`}
            >
              Loading DistilGPT-2…
            </span>
            <div
              className={`flex-1 h-2 rounded-full overflow-hidden ${
                isDark ? "bg-slate-800" : "bg-slate-200"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isDark ? "bg-cyan-500" : "bg-blue-500"
                }`}
                style={{ width: `${modelProgress}%` }}
              />
            </div>
            <span
              className={`text-xs ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {modelProgress}%
            </span>
          </div>
        ) : modelStatus === "error" ? (
          <div
            className={`flex-1 px-4 py-2 rounded-xl text-sm text-red-500 ${
              isDark
                ? "bg-slate-900 border border-red-500/30"
                : "bg-red-50 border border-red-200"
            }`}
          >
            Failed to load model — refresh to retry
          </div>
        ) : (
          <div
            className={`flex-1 flex items-center gap-1 px-4 py-2 rounded-xl text-sm ${
              isDark
                ? "bg-slate-900 border border-slate-700"
                : "bg-slate-50 border border-slate-300"
            }`}
          >
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
              {prefix}
            </span>
            <input
              value={lastWord}
              onChange={(e) => setLastWord(e.target.value)}
              className={`w-24 px-2 py-0.5 rounded-lg text-sm font-bold outline-none transition border ${
                isDark
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 focus:border-cyan-400"
                  : "bg-blue-50 border-blue-300 text-blue-700 focus:border-blue-500"
              }`}
            />
          </div>
        )}
        {loading && (
          <span
            className={`text-xs animate-pulse ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            generating…
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        style={{ minHeight: 380 }}
      >
        <style>{`
          @keyframes df{to{stroke-dashoffset:-32}}
          @keyframes dr{to{stroke-dashoffset:32}}
          @keyframes dff{to{stroke-dashoffset:-32}}
          @keyframes drf{to{stroke-dashoffset:32}}
        `}</style>

        <text
          x={265}
          y={38}
          textAnchor="middle"
          fontSize={11}
          fontWeight="800"
          fill={p.embed}
          opacity={0.5}
          letterSpacing="4"
        >
          ENCODER STACK
        </text>
        <text
          x={690}
          y={38}
          textAnchor="middle"
          fontSize={11}
          fontWeight="800"
          fill={p.crossAttn}
          opacity={0.5}
          letterSpacing="4"
        >
          DECODER STACK
        </text>
        <text
          x={(STAGES[2].x + STAGES[3].x) / 2}
          y={CY - 90}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight="600"
          fill={p.crossAttn}
          opacity={0.45}
        >
          encoder output
        </text>
        <text
          x={(STAGES[1].x + STAGES[2].x) / 2}
          y={CY + 88}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight="700"
          fill={p.res}
          opacity={0.55}
          letterSpacing="1"
        >
          ENCODER STACK
        </text>
        <text
          x={(STAGES[3].x + STAGES[4].x) / 2}
          y={CY + 88}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight="700"
          fill={p.res}
          opacity={0.55}
          letterSpacing="1"
        >
          DECODER STACK
        </text>
        <text
          x={45}
          y={55}
          textAnchor="middle"
          fontSize={9}
          fontWeight="700"
          fill={p.embed}
          opacity={0.5}
          letterSpacing="2"
        >
          INPUT
        </text>
        <text
          x={910}
          y={55}
          textAnchor="middle"
          fontSize={9}
          fontWeight="700"
          fill={p.output}
          opacity={0.5}
          letterSpacing="2"
        >
          OUTPUT
        </text>

        <line
          x1={475}
          y1={55}
          x2={475}
          y2={SVG_H - 25}
          stroke={p.dim}
          strokeWidth={1}
          strokeDasharray="3 5"
          strokeOpacity={0.4}
        />

        {flowing &&
          flows.map((f, i) => (
            <g key={i}>
              <path
                d={f.d}
                fill="none"
                stroke={f.c}
                strokeWidth={f.w || 1.2}
                strokeOpacity={f.op || 0.2}
              />
              <path
                d={f.d}
                fill="none"
                stroke={f.c}
                strokeWidth={(f.w || 1.2) + (loading ? 1 : 0.5)}
                strokeOpacity={loading ? (f.rev ? 0.55 : 0.7) : (f.rev ? 0.35 : 0.45)}
                strokeDasharray={f.rev ? "4 8" : "6 10"}
                style={{
                  animation: `${f.rev ? "dr" : "df"} ${loading ? (f.rev ? "1.0" : "0.8") : (f.rev ? "2.2" : "1.8")}s ${f.dl}s linear infinite`,
                  transition: "stroke-opacity 0.3s, stroke-width 0.3s",
                }}
              />
            </g>
          ))}

        {inToks.map((tok, i) => {
          const y = yPos(i, inToks.length);
          return (
            <g key={`i${i}`}>
              <rect
                x={5}
                y={y - 11}
                width={78}
                height={22}
                rx={11}
                fill={p.pill}
                stroke={p.embed}
                strokeWidth={0.8}
                strokeOpacity={0.4}
              />
              <text
                x={44}
                y={y + 4}
                textAnchor="middle"
                fontSize={9.5}
                fontWeight="600"
                fill={p.text}
              >
                {tok.length > 9 ? tok.slice(0, 8) + "…" : tok}
              </text>
            </g>
          );
        })}

        {STAGES.map((s, si) => {
          const col = p[s.c];
          const isHov = hov === s.key;
          return (
            <g
              key={s.key}
              onMouseEnter={() => setHov(s.key)}
              onMouseLeave={() => setHov(null)}
              style={{ cursor: "pointer" }}
            >
              {flowing && (
                <motion.circle
                  cx={s.x}
                  cy={CY}
                  fill={col}
                  animate={{
                    r: loading ? [16, 30, 16] : [14, 24, 14],
                    opacity: loading ? [0.12, 0.04, 0.12] : [0.06, 0.02, 0.06],
                  }}
                  transition={{
                    duration: loading ? 1.2 : 2.5,
                    delay: si * 0.25,
                    repeat: Infinity,
                  }}
                />
              )}
              <circle
                cx={s.x}
                cy={CY}
                r={isHov ? 15 : 11}
                fill="none"
                stroke={col}
                strokeWidth={1.5}
                opacity={isHov ? 0.7 : 0.3}
                style={{ transition: "all 0.2s" }}
              />
              <circle
                cx={s.x}
                cy={CY}
                r={isHov ? 8 : 6}
                fill={col}
                opacity={isHov ? 1 : 0.8}
                style={{ transition: "all 0.2s" }}
              />
              <text
                x={s.x}
                y={CY - 22}
                textAnchor="middle"
                fontSize={9}
                fontWeight="700"
                fill={col}
                opacity={isHov ? 1 : 0.65}
              >
                {s.l}
              </text>
              {isHov && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <rect
                    x={s.x - 100}
                    y={CY + 26}
                    width={200}
                    height={26}
                    rx={8}
                    fill={isDark ? "#1e293bee" : "#f1f5f9ee"}
                    stroke={col}
                    strokeWidth={0.5}
                  />
                  <text
                    x={s.x}
                    y={CY + 43}
                    textAnchor="middle"
                    fontSize={8}
                    fill={p.sub}
                  >
                    {DESC[s.key]}
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}

        {outToks.map((tok, i) => (
          <motion.g
            key={`o${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
          >
            <rect
              x={872}
              y={yPos(i, outToks.length) - 11}
              width={78}
              height={22}
              rx={11}
              fill={p.pill}
              stroke={p.output}
              strokeWidth={0.8}
              strokeOpacity={0.5}
            />
            <text
              x={911}
              y={yPos(i, outToks.length) + 4}
              textAnchor="middle"
              fontSize={9.5}
              fontWeight="600"
              fill={p.text}
            >
              {tok.length > 9 ? tok.slice(0, 8) + "…" : tok}
            </text>
          </motion.g>
        ))}

        {loading && (
          <motion.text
            x={SVG_W / 2}
            y={SVG_H - 15}
            textAnchor="middle"
            fontSize={10}
            fill={p.sub}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            DistilGPT-2 generating…
          </motion.text>
        )}

        {error && !loading && (
          <text
            x={SVG_W / 2}
            y={SVG_H - 15}
            textAnchor="middle"
            fontSize={10}
            fill="#ef4444"
          >
            {error}
          </text>
        )}
      </svg>

      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] ${
            isDark ? "text-slate-600" : "text-slate-400"
          }`}
        >
          DistilGPT-2 (in-browser) · Edit last word to see output change
        </span>
        <button
          onClick={() => setStep(1)}
          className={`px-5 py-1.5 rounded-full text-[11px] font-bold transition ${
            isDark
              ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              : "bg-blue-600 text-white hover:bg-blue-500"
          }`}
        >
          Explore Encoder Details →
        </button>
      </div>
    </motion.div>
  );
}

export default TransformerArchitectureStep;