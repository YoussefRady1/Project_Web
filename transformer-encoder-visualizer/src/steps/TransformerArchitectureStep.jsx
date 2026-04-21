import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  AutoTokenizer,
  AutoModelForSeq2SeqLM,
  env,
} from "@xenova/transformers";
import StageDetailView from "../components/StageDetailView";
import AnimationRuleEditor, { DEFAULT_RULES } from "../components/AnimationRuleEditor";

env.useBrowserCache = true;
env.allowLocalModels = false;

let modelBundle = null;
let modelLoading = false;
const waiters = [];

async function getModel(onProgress) {
  if (modelBundle) return modelBundle;
  if (modelLoading) {
    return new Promise((resolve) => waiters.push(resolve));
  }
  modelLoading = true;
  const tokenizer = await AutoTokenizer.from_pretrained("Xenova/t5-small", {
    progress_callback: (data) => {
      if (data.status === "progress" && onProgress)
        onProgress(Math.round(data.progress));
    },
  });
  const model = await AutoModelForSeq2SeqLM.from_pretrained(
    "Xenova/t5-small",
    {
      progress_callback: (data) => {
        if (data.status === "progress" && onProgress)
          onProgress(Math.round(data.progress));
      },
    }
  );
  modelBundle = { tokenizer, model };
  modelLoading = false;
  waiters.forEach((fn) => fn(modelBundle));
  waiters.length = 0;
  return modelBundle;
}

/* softmax over a flat array (logits → probabilities), numerically stable */
function softmax(logits) {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++)
    if (logits[i] > max) max = logits[i];
  const expArr = new Float64Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    const v = Math.exp(logits[i] - max);
    expArr[i] = v;
    sum += v;
  }
  for (let i = 0; i < logits.length; i++) expArr[i] /= sum;
  return expArr;
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

const EXAMPLES = [
  { label: "English → French", prefix: "translate English to French:", text: "The house is wonderful" },
  { label: "English → German", prefix: "translate English to German:", text: "My friend likes coffee" },
  { label: "English → Romanian", prefix: "translate English to Romanian:", text: "The weather is nice today" },
];

const CY = 220;
const SVG_W = 960;
const SVG_H = 440;

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
  accent,
  isDark,
  disabled,
  hint,
  formatter,
}) {
  const accentTxt = {
    cyan: isDark ? "text-cyan-300" : "text-blue-700",
    purple: isDark ? "text-purple-300" : "text-purple-700",
    amber: isDark ? "text-amber-300" : "text-amber-600",
    emerald: isDark ? "text-emerald-300" : "text-emerald-700",
    rose: isDark ? "text-rose-300" : "text-rose-600",
    slate: isDark ? "text-slate-300" : "text-slate-600",
  }[accent];
  const accentBar = {
    cyan: "accent-cyan-500",
    purple: "accent-purple-500",
    amber: "accent-amber-500",
    emerald: "accent-emerald-500",
    rose: "accent-rose-500",
    slate: "accent-slate-500",
  }[accent];
  const shown = formatter ? formatter(value) : value.toFixed(step < 1 ? 2 : 0);
  return (
    <div className={`flex-1 min-w-0 ${disabled ? "opacity-40" : ""}`}>
      <div className="flex items-baseline justify-between mb-0.5">
        <span
          className={`text-[10.5px] font-semibold ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {label}
        </span>
        <span className={`text-[10.5px] font-bold tabular-nums ${accentTxt}`}>
          {shown}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${accentBar}`}
      />
      {hint && (
        <div
          className={`text-[9px] italic leading-tight mt-0.5 ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function GenerationControls({
  isDark,
  numBeams,
  setNumBeams,
  topP,
  setTopP,
  topK,
  setTopK,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  repetitionPenalty,
  setRepetitionPenalty,
}) {
  const isBeam = numBeams > 1;
  const tempHint =
    temperature <= 0.3
      ? "low — almost deterministic"
      : temperature < 0.9
      ? "balanced — slight variety"
      : temperature < 1.4
      ? "standard — natural variety"
      : "high — unpredictable";
  const topPHint =
    topP < 0.4
      ? "narrow pool — safe words"
      : topP < 0.75
      ? "balanced pool"
      : "wide pool — creative";

  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        isDark ? "border-slate-700 bg-slate-900/40" : "border-slate-300 bg-slate-50"
      }`}
    >
      <div
        className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        Generation Controls ·{" "}
        <span className={isBeam ? "text-cyan-400" : "text-purple-400"}>
          {isBeam ? "Beam Search mode" : "Sampling mode"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        <ControlSlider
          label="Beams"
          value={numBeams}
          min={1}
          max={6}
          step={1}
          suffix=""
          accent="cyan"
          isDark={isDark}
          onChange={setNumBeams}
          hint={
            numBeams === 1
              ? "greedy/sampling mode"
              : `explores ${numBeams} paths in parallel`
          }
        />
        <ControlSlider
          label="Temperature"
          value={temperature}
          min={0.1}
          max={2}
          step={0.05}
          suffix=""
          accent="rose"
          isDark={isDark}
          disabled={isBeam}
          onChange={setTemperature}
          hint={isBeam ? "n/a in beam search" : tempHint}
        />
        <ControlSlider
          label="Top-P"
          value={topP}
          min={0.1}
          max={1}
          step={0.05}
          suffix=""
          accent="purple"
          isDark={isDark}
          disabled={isBeam}
          onChange={setTopP}
          hint={isBeam ? "n/a in beam search" : topPHint}
        />
        <ControlSlider
          label="Top-K"
          value={topK}
          min={1}
          max={100}
          step={1}
          suffix=""
          accent="amber"
          isDark={isDark}
          disabled={isBeam}
          onChange={setTopK}
          hint={
            isBeam
              ? "n/a in beam search"
              : topK < 10
              ? "only top few candidates"
              : topK < 40
              ? "moderate candidate pool"
              : "large candidate pool"
          }
        />
        <ControlSlider
          label="Max tokens"
          value={maxTokens}
          min={4}
          max={32}
          step={1}
          suffix=""
          accent="emerald"
          isDark={isDark}
          onChange={setMaxTokens}
          hint="cap on output length"
        />
        <ControlSlider
          label="Repetition penalty"
          value={repetitionPenalty}
          min={1}
          max={2}
          step={0.05}
          suffix=""
          accent="slate"
          isDark={isDark}
          onChange={setRepetitionPenalty}
          hint={
            repetitionPenalty < 1.05
              ? "no penalty (model may repeat)"
              : repetitionPenalty < 1.3
              ? "mild discourage"
              : "strongly discourages repeats"
          }
          formatter={(v) => v.toFixed(2)}
        />
      </div>
    </div>
  );
}

function TransformerArchitectureStep({ active, theme, setStep }) {
  const isDark = theme === "dark";
  const p = PAL[isDark ? "dark" : "light"];

  const [activeExample, setActiveExample] = useState(0);
  const [task, setTask] = useState(EXAMPLES[0].prefix);
  const [inputText, setInputText] = useState(EXAMPLES[0].text);
  const [numBeams, setNumBeams] = useState(1);
  const [topP, setTopP] = useState(0.9);
  const [topK, setTopK] = useState(50);
  const [temperature, setTemperature] = useState(1.0);
  const [maxTokens, setMaxTokens] = useState(12);
  const [repetitionPenalty, setRepetitionPenalty] = useState(1.0);

  const selectExample = (idx) => {
    const ex = EXAMPLES[idx];
    setActiveExample(idx);
    setTask(ex.prefix);
    setInputText(ex.text);
    setOutToks([]);
    setError("");
  };
  const [inToks, setInToks] = useState([]);
  const [outToks, setOutToks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flowing, setFlowing] = useState(false);
  const [hov, setHov] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [error, setError] = useState("");
  const [modelStatus, setModelStatus] = useState("idle");
  const [modelProgress, setModelProgress] = useState(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    setModelStatus("loading");
    getModel(setModelProgress)
      .then(() => setModelStatus("ready"))
      .catch(() => setModelStatus("error"));
  }, []);

  const run = useCallback(
    async () => {
      const text = `${task} ${inputText}`.trim();
      if (!text || loadingRef.current || modelStatus !== "ready") return;
      const visibleToks = inputText.trim().split(/\s+/).slice(0, 10);
      setInToks(visibleToks);
      setOutToks([]);
      setError("");
      loadingRef.current = true;
      setLoading(true);
      setFlowing(true);
      try {
        const { tokenizer, model } = await getModel();
        const inputs = await tokenizer(text);

        const genOpts = {
          attention_mask: inputs.attention_mask,
          max_new_tokens: maxTokens,
          return_dict_in_generate: true,
          output_scores: true,
          repetition_penalty: repetitionPenalty,
        };
        if (numBeams > 1) {
          genOpts.num_beams = numBeams;
          genOpts.do_sample = false;
        } else {
          genOpts.do_sample = true;
          genOpts.top_p = topP;
          genOpts.top_k = topK;
          genOpts.temperature = Math.max(0.05, temperature);
        }

        const output = await model.generate(inputs.input_ids, genOpts);

        // Normalise the output: different versions return either a raw Tensor,
        // a plain 2-D array of ids, or a {sequences, scores} object.
        let seqTensor = null;
        let scores = [];
        if (output && output.sequences) {
          seqTensor = output.sequences;
          scores = output.scores || [];
        } else if (output && output.data !== undefined && output.dims) {
          seqTensor = output;
        } else if (Array.isArray(output)) {
          seqTensor = output;
        }

        // Pull a flat array of ids for the first (winning) sequence.
        let idArray = [];
        if (seqTensor?.data && seqTensor.dims) {
          const dims = seqTensor.dims;
          const seqLen = dims[dims.length - 1];
          idArray = Array.from(seqTensor.data.slice(0, seqLen), Number);
        } else if (Array.isArray(seqTensor)) {
          const first = Array.isArray(seqTensor[0]) ? seqTensor[0] : seqTensor;
          idArray = first.map(Number);
        }

        if (idArray.length === 0) throw new Error("Empty generation");

        // Skip T5's decoder_start_token (pad) and stop at EOS.
        const eosId = tokenizer.eos_token_id ?? 1;
        const generatedIds = [];
        for (let i = 1; i < idArray.length; i++) {
          const id = idArray[i];
          if (id === eosId) break;
          generatedIds.push(id);
        }

        // Compute real per-token probabilities (when scores are available) and
        // merge subwords into whole-word pills. We decode cumulatively because
        // SentencePiece's leading-space marker (▁) is stripped when decoding a
        // single id in isolation — so the only reliable way to detect a word
        // boundary is to diff each incremental decode against the previous.
        const firstScore = scores[0];
        const vocabSize =
          firstScore?.dims?.[firstScore.dims.length - 1] ||
          firstScore?.data?.length;
        const merged = [];
        let accumulated = "";
        for (let i = 0; i < generatedIds.length; i++) {
          const tokenId = generatedIds[i];
          const nextFull = tokenizer.decode(generatedIds.slice(0, i + 1), {
            skip_special_tokens: true,
          });
          const piece = nextFull.slice(accumulated.length);
          accumulated = nextFull;

          // per-token probability
          let prob = 0;
          let rank = 1;
          const step = scores[i];
          if (step?.data && vocabSize) {
            const logitsSlice = Array.from(step.data.slice(0, vocabSize));
            const probs = softmax(logitsSlice);
            prob = probs[tokenId] ?? 0;
            const target = prob;
            for (let j = 0; j < probs.length; j++)
              if (probs[j] > target) rank++;
          } else {
            // Fallback: synthesise a monotonically-decreasing confidence so
            // the UI still renders meaningful pill thickness/opacity.
            prob = Math.max(0.3, 0.95 - i * 0.06);
          }

          const startsWithSpace = /^\s/.test(piece);
          const visible = piece.trim();
          if (!visible) continue;
          if (merged.length === 0 || startsWithSpace) {
            merged.push({ tok: visible, prob, rank, subwordCount: 1 });
          } else {
            const prev = merged[merged.length - 1];
            prev.tok += visible;
            // joint probability of the word = product of subword probs
            prev.prob *= prob;
            prev.subwordCount += 1;
          }
        }

        if (merged.length > 0) setOutToks(merged.slice(0, 8));
        else throw new Error("Empty generation");
      } catch (err) {
        setError(err.message || "Generation failed");
      }
      loadingRef.current = false;
      setLoading(false);
    },
    [
      task,
      inputText,
      modelStatus,
      numBeams,
      topP,
      topK,
      temperature,
      maxTokens,
      repetitionPenalty,
    ]
  );

  useEffect(() => {
    if (!inputText.trim() || modelStatus !== "ready") return;
    const timer = setTimeout(() => run(), 600);
    return () => clearTimeout(timer);
  }, [
    inputText,
    run,
    modelStatus,
    numBeams,
    topP,
    topK,
    temperature,
    maxTokens,
    repetitionPenalty,
  ]);

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
    isCrossArc: true,
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

  outToks.forEach((item, i) => {
    const bend = (i - (outToks.length - 1) / 2) * 10;
    flows.push({
      d: bez(832, CY, 870, yPos(i, outToks.length), 0, bend),
      c: p.output,
      dl: 0.8 + i * 0.1,
      op: 0.1 + (item.prob || 0.5) * 0.3,
      outProb: item.prob || 0,
    });
  });

  /* ---- apply rule-based filters ---- */
  const visibleOutToks = outToks.filter(
    (t) => (t.prob || 0) >= rules.probThreshold
  );
  const visibleFlows = flows.filter((f) => {
    if (f.rev && !rules.showResiduals) return false;
    if (f.isCrossArc && !rules.showCrossArc) return false;
    if (f.outProb !== undefined && f.outProb < rules.probThreshold) return false;
    return true;
  });

  /* ---- derive scaled values from rules ---- */
  const opacityScale = rules.lineOpacity / DEFAULT_RULES.lineOpacity;
  const thicknessScale = rules.lineThickness / DEFAULT_RULES.lineThickness;
  const delayScale = rules.stageDelay / DEFAULT_RULES.stageDelay;
  const flowDur = (loading ? 0.8 : 1.8) / rules.flowSpeed;
  const flowDurRev = (loading ? 1.0 : 2.2) / rules.flowSpeed;

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
      {modelStatus === "loading" ? (
        <div
          className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm ${
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
            Loading T5-Small…
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
          className={`px-4 py-2 rounded-xl text-sm text-red-500 ${
            isDark
              ? "bg-slate-900 border border-red-500/30"
              : "bg-red-50 border border-red-200"
          }`}
        >
          Failed to load model — refresh to retry
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Try:
            </span>
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => selectExample(idx)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition border ${
                  activeExample === idx
                    ? isDark
                      ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                      : "border-blue-500 bg-blue-50 text-blue-700"
                    : isDark
                    ? "border-slate-700 text-slate-500 hover:border-slate-600"
                    : "border-slate-300 text-slate-400 hover:border-slate-400"
                }`}
              >
                {ex.label}
              </button>
            ))}
            {loading && (
              <span
                className={`text-xs animate-pulse ml-auto ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                generating…
              </span>
            )}
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
              isDark
                ? "bg-slate-900 border border-slate-700"
                : "bg-slate-50 border border-slate-300"
            }`}
          >
            <span
              className={`font-semibold shrink-0 ${
                isDark ? "text-cyan-400/70" : "text-blue-500/70"
              }`}
            >
              {task}
            </span>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`flex-1 px-3 py-1 rounded-lg text-sm font-semibold outline-none transition border ${
                isDark
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 focus:border-cyan-400"
                  : "bg-blue-50 border-blue-300 text-blue-700 focus:border-blue-500"
              }`}
              placeholder="Type any sentence…"
            />
          </div>
        </div>
      )}

      <GenerationControls
        isDark={isDark}
        numBeams={numBeams}
        setNumBeams={setNumBeams}
        topP={topP}
        setTopP={setTopP}
        topK={topK}
        setTopK={setTopK}
        temperature={temperature}
        setTemperature={setTemperature}
        maxTokens={maxTokens}
        setMaxTokens={setMaxTokens}
        repetitionPenalty={repetitionPenalty}
        setRepetitionPenalty={setRepetitionPenalty}
      />

      <AnimationRuleEditor rules={rules} setRules={setRules} isDark={isDark} />

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
          y={50}
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
          x={45}
          y={62}
          textAnchor="middle"
          fontSize={6.5}
          fill={p.sub}
          opacity={0.5}
        >
          Your sentence
        </text>
        <text
          x={910}
          y={50}
          textAnchor="middle"
          fontSize={9}
          fontWeight="700"
          fill={p.output}
          opacity={0.5}
          letterSpacing="2"
        >
          OUTPUT
        </text>
        <text
          x={910}
          y={62}
          textAnchor="middle"
          fontSize={6.5}
          fill={p.sub}
          opacity={0.5}
        >
          Model prediction
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
          visibleFlows.map((f, i) => {
            const baseW = (f.w || DEFAULT_RULES.lineThickness) * thicknessScale;
            const baseOp = (f.op || 0.2) * opacityScale;
            const animOp = loading
              ? (f.rev ? 0.55 : 0.7) * opacityScale
              : (f.rev ? 0.35 : 0.45) * opacityScale;
            const animW = baseW + (loading ? 1 : 0.5);
            const dashForFlow = f.rev ? "4 8" : rules.dashPattern;
            const dur = f.rev ? flowDurRev : flowDur;
            return (
              <g key={i}>
                <path
                  d={f.d}
                  fill="none"
                  stroke={f.c}
                  strokeWidth={baseW}
                  strokeOpacity={Math.min(baseOp, 1)}
                />
                <path
                  d={f.d}
                  fill="none"
                  stroke={f.c}
                  strokeWidth={animW}
                  strokeOpacity={Math.min(animOp, 1)}
                  strokeDasharray={dashForFlow}
                  style={{
                    animation: rules.autoPlay
                      ? `${f.rev ? "dr" : "df"} ${dur}s ${f.dl * delayScale}s linear infinite`
                      : "none",
                    transition: "stroke-opacity 0.3s, stroke-width 0.3s",
                  }}
                />
              </g>
            );
          })}

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
          const isSelected = selectedStage === s.key;
          return (
            <g
              key={s.key}
              onMouseEnter={() => setHov(s.key)}
              onMouseLeave={() => setHov(null)}
              onClick={() =>
                setSelectedStage((prev) => (prev === s.key ? null : s.key))
              }
              style={{ cursor: "pointer" }}
            >
              {flowing && rules.autoPlay && (
                <motion.circle
                  cx={s.x}
                  cy={CY}
                  fill={col}
                  animate={{
                    r: loading
                      ? [16 * rules.nodeSize, 30 * rules.nodeSize, 16 * rules.nodeSize]
                      : [14 * rules.nodeSize, 24 * rules.nodeSize, 14 * rules.nodeSize],
                    opacity: loading ? [0.12, 0.04, 0.12] : [0.06, 0.02, 0.06],
                  }}
                  transition={{
                    duration: loading ? rules.pulseSpeed * 0.48 : rules.pulseSpeed,
                    delay: si * rules.stageDelay,
                    repeat: Infinity,
                  }}
                />
              )}
              <circle
                cx={s.x}
                cy={CY}
                r={(isSelected ? 18 : isHov ? 15 : 11) * rules.nodeSize}
                fill="none"
                stroke={col}
                strokeWidth={isSelected ? 2 : 1.5}
                opacity={isSelected ? 0.9 : isHov ? 0.7 : 0.3}
                style={{ transition: "all 0.2s" }}
              />
              <circle
                cx={s.x}
                cy={CY}
                r={(isSelected ? 9 : isHov ? 8 : 6) * rules.nodeSize}
                fill={col}
                opacity={isSelected ? 1 : isHov ? 1 : 0.8}
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
              {isHov && !isSelected && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <rect
                    x={s.x - 110}
                    y={CY + 26}
                    width={220}
                    height={36}
                    rx={8}
                    fill={isDark ? "#1e293bee" : "#f1f5f9ee"}
                    stroke={col}
                    strokeWidth={0.5}
                  />
                  <text
                    x={s.x}
                    y={CY + 41}
                    textAnchor="middle"
                    fontSize={8}
                    fill={p.sub}
                  >
                    {DESC[s.key]}
                  </text>
                  <text
                    x={s.x}
                    y={CY + 54}
                    textAnchor="middle"
                    fontSize={7}
                    fill={col}
                    opacity={0.8}
                    fontStyle="italic"
                  >
                    click to open internals →
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}

        {visibleOutToks.map((item, i) => {
          const y = yPos(i, visibleOutToks.length);
          const prob = item.prob || 0;
          const pct = Math.round(prob * 100);
          return (
            <motion.g
              key={`o${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <rect
                x={872}
                y={y - 11}
                width={78}
                height={22}
                rx={11}
                fill={p.pill}
                stroke={p.output}
                strokeWidth={0.6 + prob * 1.4}
                strokeOpacity={0.3 + prob * 0.7}
              />
              <text
                x={908}
                y={y + 4}
                textAnchor="middle"
                fontSize={9.5}
                fontWeight={prob > 0.6 ? "800" : "500"}
                fill={p.text}
                opacity={0.4 + prob * 0.6}
              >
                {item.tok.length > 7 ? item.tok.slice(0, 6) + "…" : item.tok}
              </text>
              <text
                x={948}
                y={y + 3}
                textAnchor="end"
                fontSize={7}
                fontWeight="700"
                fill={p.output}
                opacity={0.4 + prob * 0.6}
              >
                {pct}%
              </text>
            </motion.g>
          );
        })}

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
            T5-Small generating…
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

      <StageDetailView
        stageKey={selectedStage}
        onClose={() => setSelectedStage(null)}
        p={p}
        isDark={isDark}
      />

      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] ${
            isDark ? "text-slate-600" : "text-slate-400"
          }`}
        >
          T5-Small in your browser · Output % are real softmax probabilities · Drag any slider to explore how it changes the output
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