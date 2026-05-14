import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DecoderMaskedAttentionStep from "./DecoderMaskedAttentionStep";
import DecoderCrossAttentionStep from "./DecoderCrossAttentionStep";
import DecoderFeedForwardStep from "./DecoderFeedForwardStep";

function DecoderStackStep({ active, tokens, theme }) {
  const [layerCount, setLayerCount] = useState(1);
  const [view, setView] = useState("overview");
  const [showExplanation, setShowExplanation] = useState(false);
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
      note: "Processes decoder context",
    },
    {
      border: "border-orange-500",
      text: isDark ? "text-orange-300" : "text-orange-700",
      glow: "shadow-[0_0_18px_rgba(249,115,22,0.18)]",
      dot: "bg-orange-500",
      note: "Processes deeper context",
    },
    {
      border: "border-amber-400",
      text: isDark ? "text-amber-300" : "text-amber-700",
      glow: "shadow-[0_0_18px_rgba(251,191,36,0.18)]",
      dot: "bg-amber-400",
      note: "Processes deeper context",
    },
    {
      border: "border-lime-400",
      text: isDark ? "text-lime-300" : "text-lime-700",
      glow: "shadow-[0_0_18px_rgba(163,230,53,0.18)]",
      dot: "bg-lime-400",
      note: "Processes deeper context",
    },
    {
      border: "border-emerald-400",
      text: isDark ? "text-emerald-300" : "text-emerald-700",
      glow: "shadow-[0_0_18px_rgba(52,211,153,0.18)]",
      dot: "bg-emerald-400",
      note: "Processes deeper context",
    },
    {
      border: "border-green-500",
      text: isDark ? "text-green-300" : "text-green-700",
      glow: "shadow-[0_0_18px_rgba(34,197,94,0.20)]",
      dot: "bg-green-500",
      note: "Produces final decoder representation",
    },
  ];

  if (view === "masked-attention") {
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
          ← Back to Decoder Stack
        </button>
        <DecoderMaskedAttentionStep active={active} tokens={tokens} theme={theme} />
      </div>
    );
  }

  if (view === "cross-attention") {
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
          ← Back to Decoder Stack
        </button>
        <DecoderCrossAttentionStep active={active} tokens={tokens} theme={theme} />
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
          ← Back to Decoder Stack
        </button>
        <DecoderFeedForwardStep active={active} tokens={tokens} theme={theme} />
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
          ← Back to Decoder Stack
        </button>

        <motion.div
          animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
          transition={{ duration: 0.3 }}
          className={`p-6 border rounded-2xl w-[980px] min-h-[520px] flex flex-col items-center ${
            isDark ? "border-cyan-500" : "border-blue-400/80 bg-white shadow-sm"
          }`}
        >
          <h2 className={`font-semibold text-center ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
            Add &amp; Normalize
          </h2>
          <p className={`text-xs text-center mb-5 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            The stabilizer that runs after every sub-layer in a decoder layer
          </p>

          <div
            className={`w-full max-w-[640px] rounded-xl border p-4 ${
              isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-400/70 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-base font-semibold ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
                What Add &amp; Normalize does
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark
                    ? "border-cyan-400/40 text-cyan-300 bg-cyan-400/10"
                    : "border-blue-400 text-blue-700 bg-blue-50"
                }`}
              >
                ×3 per layer
              </span>
            </div>

            {/* Mini flow diagram */}
            <div
              className={`rounded-lg border p-3 mb-3 ${
                isDark ? "border-slate-700 bg-slate-950/60" : "border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-stretch justify-between gap-1 text-[10px]">
                <div
                  className={`flex-1 px-2 py-1.5 rounded border text-center ${
                    isDark
                      ? "border-slate-600 text-slate-200 bg-slate-900"
                      : "border-slate-300 text-slate-800 bg-slate-50"
                  }`}
                >
                  <div className="font-mono font-semibold">x</div>
                  <div className={`text-[9px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    token vector
                  </div>
                </div>
                <span className={`self-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>→</span>
                <div
                  className={`flex-1 px-2 py-1.5 rounded border text-center ${
                    isDark
                      ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/5"
                      : "border-blue-400 text-blue-700 bg-blue-50"
                  }`}
                >
                  <div className="font-semibold">Sub-Layer</div>
                  <div className={`text-[9px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    attention / FFN
                  </div>
                </div>
                <span className={`self-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>→</span>
                <div
                  className={`flex flex-col items-center justify-center px-1 ${
                    isDark ? "text-amber-300" : "text-amber-700"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold ${
                      isDark
                        ? "border-amber-500/60 bg-amber-500/10"
                        : "border-amber-400 bg-amber-50"
                    }`}
                  >
                    +
                  </div>
                  <div className="text-[9px] mt-0.5">add x back</div>
                </div>
                <span className={`self-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>→</span>
                <div
                  className={`flex-1 px-2 py-1.5 rounded border text-center ${
                    isDark
                      ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5"
                      : "border-emerald-400 text-emerald-700 bg-emerald-50"
                  }`}
                >
                  <div className="font-semibold">LayerNorm</div>
                  <div className={`text-[9px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    rescale values
                  </div>
                </div>
                <span className={`self-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>→</span>
                <div
                  className={`flex-1 px-2 py-1.5 rounded border text-center ${
                    isDark
                      ? "border-slate-600 text-slate-200 bg-slate-900"
                      : "border-slate-300 text-slate-800 bg-slate-50"
                  }`}
                >
                  <div className="font-mono font-semibold">out</div>
                  <div className={`text-[9px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    refined vector
                  </div>
                </div>
              </div>
              <div
                className={`mt-2 text-center text-[10px] font-mono ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                out = LayerNorm( x + SubLayer(x) )
              </div>

              {/* Legend explaining each symbol */}
              <div
                className={`mt-2 pt-2 border-t text-[10px] leading-4 space-y-1 ${
                  isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"
                }`}
              >
                <div>
                  <span className="font-mono font-semibold">x</span> — the token vector going into the sub-layer (e.g. the decoder vector for one word).
                </div>
                <div>
                  <span className={`font-semibold ${isDark ? "text-cyan-300" : "text-blue-700"}`}>Sub-Layer</span> — whichever operation is being applied: <em>masked self-attention</em>, <em>cross-attention</em>, or the <em>feed-forward</em> network.
                </div>
                <div>
                  <span className={`font-bold ${isDark ? "text-amber-300" : "text-amber-700"}`}>+</span> — the <em>residual connection</em>: we add the original <span className="font-mono">x</span> back to the sub-layer's output so nothing learned earlier is lost.
                </div>
                <div>
                  <span className={`font-semibold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>LayerNorm</span> — rescales the combined vector so its values have zero mean and unit variance, which keeps numbers stable across many stacked layers.
                </div>
              </div>
            </div>

            {/* Two compact info cards */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div
                className={`rounded-lg border p-2 ${
                  isDark ? "border-amber-500/40 bg-amber-500/5" : "border-amber-300 bg-amber-50"
                }`}
              >
                <div
                  className={`text-[10px] font-semibold mb-0.5 ${
                    isDark ? "text-amber-300" : "text-amber-800"
                  }`}
                >
                  Add (residual)
                </div>
                <p
                  className={`text-[10px] leading-4 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Re-injects the original input so useful signal is never lost.
                </p>
              </div>
              <div
                className={`rounded-lg border p-2 ${
                  isDark ? "border-emerald-500/40 bg-emerald-500/5" : "border-emerald-300 bg-emerald-50"
                }`}
              >
                <div
                  className={`text-[10px] font-semibold mb-0.5 ${
                    isDark ? "text-emerald-300" : "text-emerald-800"
                  }`}
                >
                  Normalize
                </div>
                <p
                  className={`text-[10px] leading-4 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Rescales each vector to zero mean &amp; unit variance — keeps training stable.
                </p>
              </div>
            </div>

            <p
              className={`text-[10px] leading-4 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Applied after masked self-attention, cross-attention, and feed-forward.
              Without it, activations would explode or vanish across deep stacks.
            </p>
          </div>
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
        Decoder Stack
      </h2>

      <p
        className={`text-xs text-center mb-2 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        The decoder stack is built from repeated decoder layers
      </p>

      <button
        onClick={() => setShowExplanation((v) => !v)}
        className={`mb-3 text-[11px] font-medium underline underline-offset-2 ${
          isDark ? "text-cyan-300 hover:text-cyan-200" : "text-blue-700 hover:text-blue-800"
        }`}
      >
        {showExplanation ? "Hide explanation" : "Show explanation"}
      </button>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-[760px] mb-5 rounded-xl border p-3 text-[11px] leading-5 ${
            isDark ? "border-slate-700 bg-slate-900/70 text-slate-300" : "border-slate-300 bg-slate-50 text-slate-700"
          }`}
        >
          The decoder stack repeats decoder layers to progressively refine the output. Each layer combines masked self-attention, cross-attention, and a feed-forward network to produce accurate predictions.
        </motion.div>
      )}

      <div className="w-full max-w-[760px] mb-5">
        <div
          className={`rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-400/70 bg-slate-50"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            What happens inside one decoder layer?
          </h3>

          <div
            className={`space-y-3 text-[11px] leading-5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60"
                  : "border-slate-400/70 bg-white"
              }`}
            >
              <div
                className={`font-medium mb-2 ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Correct decoder layer order
              </div>

              <div className="flex flex-col gap-1 text-xs">
                {[
                  { label: "Masked Self-Attention", kind: "sub" },
                  { label: "Add & Norm", kind: "norm" },
                  { label: "Cross-Attention ← Encoder", kind: "sub" },
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
                          isDark
                            ? "bg-slate-800 text-slate-300"
                            : "bg-slate-200 text-slate-700"
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

            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-cyan-400/40 bg-cyan-400/5"
                  : "border-blue-400 bg-blue-50"
              }`}
            >
              <div
                className={`font-medium mb-1 ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Key difference from encoder
              </div>
              <p>
                The decoder layer has an extra sub-layer — cross-attention —
                which connects it to the encoder's output. This is the bridge
                between understanding the input and generating the output.
              </p>
            </div>

            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60"
                  : "border-slate-400/70 bg-white"
              }`}
            >
              <div
                className={`font-semibold text-lg mb-3 text-center ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Learn the internal parts
              </div>

              <p
                className={`mb-4 text-sm leading-6 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Before fully understanding the decoder stack, explore what each
                sub-layer does. Each sub-view includes its own Add &amp; Norm
                explanation.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setView("masked-attention")}
                  className={`px-4 py-1.5 text-xs border rounded-lg transition ${
                    isDark
                      ? "border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
                      : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
                  }`}
                >
                  Learn Masked Self-Attention
                </button>

                <button
                  onClick={() => setView("cross-attention")}
                  className={`px-4 py-1.5 text-xs border rounded-lg transition ${
                    isDark
                      ? "border-amber-400 text-amber-300 hover:bg-amber-400/10"
                      : "border-amber-400 text-amber-700 bg-amber-100 hover:bg-amber-200"
                  }`}
                >
                  Learn Cross-Attention
                </button>

                <button
                  onClick={() => setView("feedforward")}
                  className={`px-4 py-1.5 text-xs border rounded-lg transition ${
                    isDark
                      ? "border-green-400 text-green-300 hover:bg-green-400/10"
                      : "border-green-500 text-green-700 bg-green-100 hover:bg-green-200"
                  }`}
                >
                  Learn Feed Forward
                </button>

                <button
                  onClick={() => setView("addnorm")}
                  className={`px-4 py-1.5 text-xs border rounded-lg transition ${
                    isDark
                      ? "border-emerald-400 text-emerald-300 hover:bg-emerald-400/10"
                      : "border-emerald-500 text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                  }`}
                >
                  Learn Add &amp; Normalize
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Understanding Depth Bar */}
      <div className={`w-full mb-4 rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-300 bg-slate-50"}`}>
        <div className={`flex justify-between text-[10px] mb-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          <span className="font-medium">Understanding Depth</span>
          <span>{layerCount} / 6 decoder layers active</span>
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
            ? "1 layer — basic context processing begins"
            : layerCount <= 2
            ? `${layerCount} layers — alignment with encoder growing`
            : layerCount <= 4
            ? `${layerCount} layers — deeper cross-attention patterns forming`
            : `${layerCount} layers — rich, full understanding reached`}
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
                className={`w-full px-3 py-2 rounded-xl border transition-colors duration-300 ${
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

                <div className="flex gap-2 mb-3 text-sm flex-wrap items-center">
                  {(tokens.length ? tokens.slice(0, 10) : ["token"]).map((t, i) => (
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

                <div className="flex flex-col gap-1 mt-1">
                  {[
                    { label: "Masked Self-Attention", highlight: false },
                    { label: "Add & Norm", highlight: false },
                    { label: "Cross-Attention ← Encoder", highlight: true },
                    { label: "Add & Norm", highlight: false },
                    { label: "Feed Forward", highlight: false },
                    { label: "Add & Norm", highlight: false },
                  ].map((row, n) => (
                    <div
                      key={n}
                      className={`flex items-center gap-2 text-[10px] px-2 py-1 rounded border ${
                        row.highlight
                          ? isDark
                            ? "border-amber-500/60 text-amber-300 bg-amber-500/5"
                            : "border-amber-300 text-amber-800 bg-amber-50"
                          : isDark
                          ? "border-slate-600 text-white"
                          : "border-slate-300 text-slate-900 bg-slate-50"
                      }`}
                    >
                      <span
                        className={`font-mono font-semibold w-4 shrink-0 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {n + 1}.
                      </span>
                      <span>{row.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {index !== layerStyles.length - 1 && (
                <motion.div
                  animate={{
                    y: arrowActive ? [0, 8, 0] : 0,
                    opacity: arrowActive ? [0.5, 1, 0.5] : 0.18,
                    scale: arrowActive ? [1, 1.18, 1] : 1,
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.18 + 0.2,
                  }}
                  className={`text-lg my-2 transition-colors duration-300 ${
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
                </motion.div>
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
          ? "With one decoder layer, the model starts learning to align generated tokens with the input."
          : layerCount < layerStyles.length
          ? "Adding more decoder layers repeats the same internal process, refining both self-context and encoder alignment."
          : "All decoder layers now work together to build the richest possible representation for accurate output prediction."}
      </div>
    </motion.div>
  );
}

export default DecoderStackStep;
