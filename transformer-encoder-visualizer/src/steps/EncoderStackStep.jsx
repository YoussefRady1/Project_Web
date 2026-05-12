import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AttentionStep from "./AttentionStep";
import FeedForwardStep from "./FeedForwardStep";

function EncoderStackStep({ active, tokens, theme }) {
  const [layerCount, setLayerCount] = useState(1);
  const [view, setView] = useState("overview");
  const isDark = theme === "dark";

  useEffect(() => {
    if (!active || view !== "overview") return;
    const id = setInterval(() => {
      setLayerCount((prev) => (prev >= 6 ? 1 : prev + 1));
    }, 2200);
    return () => clearInterval(id);
  }, [active, view]);

  const layerStyles = [
    {
      border: "border-red-500",
      text: isDark ? "text-red-300" : "text-red-700",
      glow: "shadow-[0_0_18px_rgba(239,68,68,0.18)]",
      dot: "bg-red-500",
      note: "Layer 1: starts building basic context between words",
    },
    {
      border: "border-orange-500",
      text: isDark ? "text-orange-300" : "text-orange-700",
      glow: "shadow-[0_0_18px_rgba(249,115,22,0.18)]",
      dot: "bg-orange-500",
      note: "Layer 2: connects nearby words and short phrases",
    },
    {
      border: "border-amber-400",
      text: isDark ? "text-amber-300" : "text-amber-700",
      glow: "shadow-[0_0_18px_rgba(251,191,36,0.18)]",
      dot: "bg-amber-400",
      note: "Layer 3: refines word relationships and grammar patterns",
    },
    {
      border: "border-lime-400",
      text: isDark ? "text-lime-300" : "text-lime-700",
      glow: "shadow-[0_0_18px_rgba(163,230,53,0.18)]",
      dot: "bg-lime-400",
      note: "Layer 4: captures sentence-level meaning",
    },
    {
      border: "border-emerald-400",
      text: isDark ? "text-emerald-300" : "text-emerald-700",
      glow: "shadow-[0_0_18px_rgba(52,211,153,0.18)]",
      dot: "bg-emerald-400",
      note: "Layer 5: builds strong contextual understanding",
    },
    {
      border: "border-green-500",
      text: isDark ? "text-green-300" : "text-green-700",
      glow: "shadow-[0_0_18px_rgba(34,197,94,0.20)]",
      dot: "bg-green-500",
      note: "Layer 6: produces the final, richest representation",
    },
  ];

  if (view === "attention") {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setView("overview")}
          className={`px-4 py-1.5 text-xs border rounded-lg transition ${
            isDark
              ? "border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
              : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
          }`}
        >
          ← Back to Encoder Stack
        </button>

        <AttentionStep active={active} tokens={tokens} theme={theme} />
      </div>
    );
  }

  if (view === "feedforward") {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setView("overview")}
          className={`px-4 py-1.5 text-xs border rounded-lg transition ${
            isDark
              ? "border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
              : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
          }`}
        >
          ← Back to Encoder Stack
        </button>

        <FeedForwardStep active={active} tokens={tokens} theme={theme} />
      </div>
    );
  }

  if (view === "addnorm") {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setView("overview")}
          className={`px-4 py-1.5 text-xs border rounded-lg transition ${
            isDark
              ? "border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
              : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
          }`}
        >
          ← Back to Encoder Stack
        </button>

        <motion.div
          animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
          transition={{ duration: 0.3 }}
          className={`p-6 border rounded-2xl w-[980px] min-h-[620px] flex flex-col items-center ${
            isDark ? "border-cyan-500" : "border-blue-400/80 bg-white shadow-sm"
          }`}
        >
          <h2 className={`font-semibold text-center ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
            Add &amp; Normalize
          </h2>
          <p className={`text-xs text-center mb-4 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            The stabilizer that runs after every sub-layer in an encoder layer
          </p>

          {/* Mini flow diagram */}
          <div
            className={`w-full max-w-[760px] rounded-xl border p-4 mb-4 ${
              isDark ? "border-slate-700 bg-slate-950/60" : "border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-stretch justify-between gap-1 text-[10px]">
              <div className={`flex-1 px-2 py-1.5 rounded border text-center ${isDark ? "border-slate-600 text-slate-200 bg-slate-900" : "border-slate-300 text-slate-800 bg-slate-50"}`}>
                <div className="font-mono font-semibold">x</div>
                <div className={`text-[9px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>token vector</div>
              </div>
              <span className={`self-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>→</span>
              <div className={`flex-1 px-2 py-1.5 rounded border text-center ${isDark ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/5" : "border-blue-400 text-blue-700 bg-blue-50"}`}>
                <div className="font-semibold">Sub-Layer</div>
                <div className={`text-[9px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>attention / FFN</div>
              </div>
              <span className={`self-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>→</span>
              <div className={`flex flex-col items-center justify-center px-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold ${isDark ? "border-amber-500/60 bg-amber-500/10" : "border-amber-400 bg-amber-50"}`}>+</div>
                <div className="text-[9px] mt-0.5">add x back</div>
              </div>
              <span className={`self-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>→</span>
              <div className={`flex-1 px-2 py-1.5 rounded border text-center ${isDark ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5" : "border-emerald-400 text-emerald-700 bg-emerald-50"}`}>
                <div className="font-semibold">LayerNorm</div>
                <div className={`text-[9px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>rescale values</div>
              </div>
              <span className={`self-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>→</span>
              <div className={`flex-1 px-2 py-1.5 rounded border text-center ${isDark ? "border-slate-600 text-slate-200 bg-slate-900" : "border-slate-300 text-slate-800 bg-slate-50"}`}>
                <div className="font-mono font-semibold">out</div>
                <div className={`text-[9px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>refined vector</div>
              </div>
            </div>
            <div className={`mt-2 text-center text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              out = LayerNorm( x + SubLayer(x) )
            </div>
          </div>

          {/* Two info cards */}
          <div className="w-full max-w-[760px] grid grid-cols-2 gap-2 mb-4">
            <div className={`rounded-lg border p-3 ${isDark ? "border-amber-500/40 bg-amber-500/5" : "border-amber-300 bg-amber-50"}`}>
              <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-amber-300" : "text-amber-800"}`}>Add (residual)</div>
              <p className={`text-[11px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Re-injects the original input <span className="font-mono">x</span> so useful signal is never lost as the layer transforms it.
              </p>
            </div>
            <div className={`rounded-lg border p-3 ${isDark ? "border-emerald-500/40 bg-emerald-500/5" : "border-emerald-300 bg-emerald-50"}`}>
              <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>Normalize</div>
              <p className={`text-[11px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Rescales each vector to zero mean &amp; unit variance — keeps training stable across deep stacks.
              </p>
            </div>
          </div>

          <div className={`w-full max-w-[760px] text-[11px] leading-5 space-y-2 mb-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            <p>After <strong>self-attention</strong>, the model adds the original input back and normalizes the result.</p>
            <p>After <strong>feed forward</strong>, it does the same thing again: add the previous signal and normalize it.</p>
            <p>This happens <strong>twice</strong> per encoder layer — once after each sub-layer.</p>
          </div>

          <div className="w-full max-w-[760px] aspect-video rounded-lg overflow-hidden border border-slate-700">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/G45TuC6zRf4"
              title="Layer Normalization in Transformer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className={`text-[10px] mt-2 leading-4 max-w-[760px] ${isDark ? "text-slate-500" : "text-slate-600"}`}>
            Short video explaining residual connections and layer normalization.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[980px] min-h-[760px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-400/80 bg-white shadow-sm"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        Encoder Stack
      </h2>

      <p
        className={`text-xs text-center mb-2 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        The encoder stack is built from repeated encoder layers
      </p>
<div
  className={`w-full max-w-[760px] mb-5 rounded-xl border p-3 ${
    isDark
      ? "border-cyan-400/30 bg-cyan-400/5"
      : "border-blue-400 bg-blue-50"
  }`}
>
  <div
    className={`text-sm font-semibold mb-1 ${
      isDark ? "text-cyan-300" : "text-blue-800"
    }`}
  >
    Why we use this step
  </div>

  <p
    className={`text-[11px] leading-5 ${
      isDark ? "text-slate-300" : "text-slate-700"
    }`}
  >
    We use the encoder stack because one layer is usually not enough to build deep understanding. Repeating encoder layers allows the model to refine context step by step and produce richer sentence representations.
  </p>
</div>
      {/* Inside one encoder layer */}
      <div className="w-full mb-5">
        <div className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-400/70 bg-slate-50"}`}>
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
            What happens inside one encoder layer?
          </h3>

          {/* Numbered 1-4 layer order */}
          <div className={`rounded-lg border p-3 mb-3 ${isDark ? "border-slate-700 bg-slate-950/60" : "border-slate-400/70 bg-white"}`}>
            <div className={`font-medium mb-2 text-[11px] ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
              Encoder layer order
            </div>
            <div className="flex flex-col gap-1 text-xs">
              {[
                { label: "Self-Attention", kind: "sub" },
                { label: "Add & Norm", kind: "norm" },
                { label: "Feed Forward", kind: "sub" },
                { label: "Add & Norm", kind: "norm" },
              ].map((row, i) => {
                const isNorm = row.kind === "norm";
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded border ${
                      isNorm
                        ? isDark
                          ? "border-slate-700 text-slate-300 bg-slate-900/40"
                          : "border-slate-300 text-slate-700 bg-white"
                        : isDark
                        ? "border-slate-600 text-white bg-slate-900/60"
                        : "border-slate-300 text-slate-900 bg-slate-50"
                    }`}
                  >
                    <span
                      className={`font-mono font-semibold w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                        isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span>{row.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`rounded-lg border p-3 mb-3 ${isDark ? "border-cyan-400/40 bg-cyan-400/5" : "border-blue-400 bg-blue-50"}`}>
            <div className={`font-medium mb-1 text-[11px] ${isDark ? "text-cyan-300" : "text-blue-800"}`}>Important note</div>
            <p className={`text-[11px] leading-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              This encoder layer repeats multiple times to form the full encoder stack. Each repetition refines the representations further.
            </p>
          </div>

          <div className={`font-medium mb-2 text-[11px] ${isDark ? "text-slate-300" : "text-slate-700"}`}>Explore the internal sub-layers:</div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setView("attention")}
              className={`px-4 py-1.5 text-xs border rounded-lg transition ${isDark ? "border-cyan-400 text-cyan-300 hover:bg-cyan-400/10" : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"}`}
            >
              Learn Self-Attention →
            </button>
            <button
              onClick={() => setView("addnorm")}
              className={`px-4 py-1.5 text-xs border rounded-lg transition ${isDark ? "border-emerald-400 text-emerald-300 hover:bg-emerald-400/10" : "border-emerald-500 text-emerald-700 bg-emerald-100 hover:bg-emerald-200"}`}
            >
              Learn Add &amp; Normalize →
            </button>
            <button
              onClick={() => setView("feedforward")}
              className={`px-4 py-1.5 text-xs border rounded-lg transition ${isDark ? "border-green-400 text-green-300 hover:bg-green-400/10" : "border-green-500 text-green-700 bg-green-100 hover:bg-green-200"}`}
            >
              Learn Feed Forward →
            </button>
          </div>
        </div>
      </div>

      {/* Understanding Depth bar (auto-incrementing) */}
      <div className={`w-full mb-4 rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-300 bg-slate-50"}`}>
        <div className={`flex justify-between text-[10px] mb-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          <span className="font-medium">Understanding Depth</span>
          <span>{layerCount} / 6 encoder layers active</span>
        </div>
        <div className={`w-full h-4 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
          <motion.div
            animate={{ width: `${(layerCount / 6) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)" }}
          />
        </div>
        <div className={`text-[10px] text-center mt-1.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          {layerCount === 1
            ? "1 layer — basic word-to-word context begins"
            : layerCount <= 2
            ? `${layerCount} layers — short-range relationships forming`
            : layerCount <= 4
            ? `${layerCount} layers — grammar and phrase patterns emerging`
            : `${layerCount} layers — rich, sentence-level understanding reached`}
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        {layerStyles.map((layer, index) => {
          const isActive = index < layerCount;
          const arrowActive = active && index < layerCount - 1;
          return (
            <div key={index} className="flex flex-col items-center w-full">
              <motion.div
                initial={{ opacity: 0, y: -22, scale: 0.94, filter: "blur(4px)" }}
                animate={{
                  opacity: active ? (isActive ? 1 : 0.22) : 0.15,
                  y: 0,
                  scale: isActive ? 1 : 0.985,
                  filter: isActive ? "blur(0px)" : "blur(0.5px)",
                }}
                transition={{
                  delay: index * 0.12,
                  type: "spring",
                  stiffness: 220,
                  damping: 22,
                  mass: 0.9,
                }}
                className={`w-full px-4 py-3 rounded-xl border transition-colors duration-300 ${
                  isActive
                    ? `${layer.border} ${layer.glow}`
                    : isDark
                    ? "border-slate-800"
                    : "border-slate-200"
                } ${isDark ? "bg-slate-900" : "bg-white"}`}
              >
                <div
                  className={`text-xs mb-1 transition-colors duration-300 ${
                    isActive
                      ? layer.text
                      : isDark
                      ? "text-slate-600"
                      : "text-slate-400"
                  }`}
                >
                  Layer {index + 1}
                </div>

                <div
                  className={`text-[10px] mb-2 leading-4 transition-colors duration-300 ${
                    isActive
                      ? isDark
                        ? "text-slate-500"
                        : "text-slate-600"
                      : isDark
                      ? "text-slate-700"
                      : "text-slate-400"
                  }`}
                >
                  {layer.note}
                </div>

                <div className="flex gap-2 mb-3 text-sm flex-wrap">
                  {tokens.map((t, i) => (
                    <span
                      key={i}
                      className={`transition-colors duration-300 ${
                        isActive
                          ? layer.text
                          : isDark
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <div className={`px-2 py-1 rounded border ${isDark ? "border-slate-600 text-white" : "border-slate-300 text-slate-900 bg-slate-50"}`}>
                    Self-Attention
                  </div>
                  <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>
                  <div className={`px-2 py-1 rounded border ${isDark ? "border-slate-600 text-white" : "border-slate-300 text-slate-900 bg-slate-50"}`}>
                    Add &amp; Normalize
                  </div>
                  <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>
                  <div className={`px-2 py-1 rounded border ${isDark ? "border-slate-600 text-white" : "border-slate-300 text-slate-900 bg-slate-50"}`}>
                    Feed Forward
                  </div>
                  <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>
                  <div className={`px-2 py-1 rounded border ${isDark ? "border-slate-600 text-white" : "border-slate-300 text-slate-900 bg-slate-50"}`}>
                    Add &amp; Normalize
                  </div>
                </div>
              </motion.div>

              {index !== layerStyles.length - 1 && (
                <div
                  className={`text-lg my-1 transition-colors duration-300 ${
                    arrowActive
                      ? isDark
                        ? "text-cyan-400"
                        : "text-blue-600"
                      : isDark
                      ? "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className={`mt-3 rounded-xl border p-3 text-[11px] leading-5 text-center w-full ${
          isDark
            ? "border-slate-700 bg-slate-900/70 text-slate-300"
            : "border-slate-400/70 bg-slate-50 text-slate-700"
        }`}
      >
        {layerCount === 1
          ? "With one encoder layer, the model starts building context between words."
          : layerCount < layerStyles.length
          ? "Adding more encoder layers repeats the same internal process and helps the model refine the sentence step by step."
          : "More encoder layers now repeat the same encoder-layer structure and build richer contextual understanding across the sentence."}
      </div>
    </motion.div>
  );
}

export default EncoderStackStep;