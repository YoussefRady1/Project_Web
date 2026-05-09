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

      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
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
                className={`font-medium mb-1 ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Correct decoder layer order
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Masked Self-Attention
                </div>
                <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Add &amp; Norm
                </div>
                <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-purple-500/60 text-purple-300"
                      : "border-purple-300 text-purple-800 bg-purple-50"
                  }`}
                >
                  Cross-Attention
                </div>
                <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Add &amp; Norm
                </div>
                <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Feed Forward
                </div>
                <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Add &amp; Norm
                </div>
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
                      ? "border-purple-400 text-purple-300 hover:bg-purple-400/10"
                      : "border-purple-400 text-purple-700 bg-purple-100 hover:bg-purple-200"
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
              </div>
            </div>
          </div>
        </div>

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
            Add &amp; Normalize
          </h3>

          <div
            className={`text-[11px] leading-5 space-y-2 mb-3 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              After each sub-layer (masked attention, cross-attention, feed
              forward), the model adds the original input back and normalizes.
            </p>
            <p>
              This happens{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                three times
              </span>{" "}
              per decoder layer — once after each sub-layer.
            </p>
            <p>
              It helps keep learning stable and preserves useful information
              through the layer.
            </p>
          </div>

          <p
            className={`text-[11px] leading-5 mt-2 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Layer normalization rescales each vector to have zero mean and unit
            variance, keeping values stable as they pass through many layers.
            Without it, activations can explode or vanish, making deep stacks
            impossible to train effectively.
          </p>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border p-4 mb-5 ${
          isDark
            ? "border-slate-700 bg-slate-900/70"
            : "border-slate-400/70 bg-slate-50"
        }`}
      >
        <div
          className={`text-sm font-semibold text-center mb-4 ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          One Decoder Layer Diagram
        </div>

        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              opacity: active ? 1 : 0.3,
              scale: active ? [1, 1.01, 1] : 1,
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
            }}
            className={`w-full max-w-[320px] rounded-xl border p-3 flex flex-col items-center ${
              isDark ? "border-cyan-500 bg-slate-950/70" : "border-blue-400/80 bg-white shadow-sm"
            }`}
          >
            <div
              className={`w-full text-center text-sm font-medium mb-3 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              Decoder Layer
            </div>

            <div className="w-full flex flex-col items-center gap-2 text-xs">
              <div
                className={`w-full text-center px-2 py-1.5 rounded-lg border text-xs ${
                  isDark
                    ? "border-slate-600 text-white"
                    : "border-slate-300 text-slate-900 bg-slate-50"
                }`}
              >
                Masked Self-Attention
              </div>

              <div className={isDark ? "text-cyan-400" : "text-blue-600"}>↓</div>

              <div
                className={`w-full text-center px-2 py-1.5 rounded-lg border text-xs ${
                  isDark
                    ? "border-slate-600 text-white"
                    : "border-slate-300 text-slate-900 bg-slate-50"
                }`}
              >
                Add &amp; Normalize
              </div>

              <div className={isDark ? "text-cyan-400" : "text-blue-600"}>↓</div>

              <div
                className={`w-full text-center px-2 py-1.5 rounded-lg border text-xs ${
                  isDark
                    ? "border-purple-500/60 text-purple-300"
                    : "border-purple-300 text-purple-800 bg-purple-50"
                }`}
              >
                Cross-Attention (← Encoder)
              </div>

              <div className={isDark ? "text-cyan-400" : "text-blue-600"}>↓</div>

              <div
                className={`w-full text-center px-2 py-1.5 rounded-lg border text-xs ${
                  isDark
                    ? "border-slate-600 text-white"
                    : "border-slate-300 text-slate-900 bg-slate-50"
                }`}
              >
                Add &amp; Normalize
              </div>

              <div className={isDark ? "text-cyan-400" : "text-blue-600"}>↓</div>

              <div
                className={`w-full text-center px-2 py-1.5 rounded-lg border text-xs ${
                  isDark
                    ? "border-slate-600 text-white"
                    : "border-slate-300 text-slate-900 bg-slate-50"
                }`}
              >
                Feed Forward
              </div>

              <div className={isDark ? "text-cyan-400" : "text-blue-600"}>↓</div>

              <div
                className={`w-full text-center px-2 py-1.5 rounded-lg border text-xs ${
                  isDark
                    ? "border-slate-600 text-white"
                    : "border-slate-300 text-slate-900 bg-slate-50"
                }`}
              >
                Add &amp; Normalize
              </div>
            </div>
          </motion.div>
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

                <div className="flex gap-2 mb-3 text-sm flex-wrap items-center">
                  {(tokens.length ? tokens.slice(0, 3) : ["token"]).map((t, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        opacity: active && isActive ? 1 : 0.3,
                        y: active && isActive ? [0, -2, 0] : 0,
                        scale: active && isActive ? [1, 1.03 + index * 0.02, 1] : 1,
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.05 + index * 0.2,
                      }}
                      className={`transition-colors duration-300 ${
                        isActive
                          ? layer.text
                          : isDark
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      {t}
                    </motion.span>
                  ))}
                  {tokens.length > 3 && (
                    <span
                      className={`text-[10px] ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      ...and {tokens.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  <motion.div
                    animate={{
                      scale: active && isActive ? [1, 1.08, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`px-2 py-1 rounded border ${
                      isDark
                        ? "border-slate-600 text-white"
                        : "border-slate-300 text-slate-900 bg-slate-50"
                    }`}
                  >
                    Masked Attn
                  </motion.div>

                  <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>

                  <motion.div
                    animate={{
                      scale: active && isActive ? [1, 1.08, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
                    className={`px-2 py-1 rounded border ${
                      isDark
                        ? "border-slate-600 text-white"
                        : "border-slate-300 text-slate-900 bg-slate-50"
                    }`}
                  >
                    Add&amp;Norm
                  </motion.div>

                  <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>

                  <motion.div
                    animate={{
                      scale: active && isActive ? [1, 1.08, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className={`px-2 py-1 rounded border ${
                      isDark
                        ? "border-purple-500/60 text-purple-300"
                        : "border-purple-300 text-purple-800 bg-purple-50"
                    }`}
                  >
                    Cross-Attn
                  </motion.div>

                  <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>

                  <motion.div
                    animate={{
                      scale: active && isActive ? [1, 1.08, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    className={`px-2 py-1 rounded border ${
                      isDark
                        ? "border-slate-600 text-white"
                        : "border-slate-300 text-slate-900 bg-slate-50"
                    }`}
                  >
                    Add&amp;Norm
                  </motion.div>

                  <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>

                  <motion.div
                    animate={{
                      scale: active && isActive ? [1, 1.08, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className={`px-2 py-1 rounded border ${
                      isDark
                        ? "border-slate-600 text-white"
                        : "border-slate-300 text-slate-900 bg-slate-50"
                    }`}
                  >
                    FFN
                  </motion.div>

                  <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>

                  <motion.div
                    animate={{
                      scale: active && isActive ? [1, 1.08, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                    className={`px-2 py-1 rounded border ${
                      isDark
                        ? "border-slate-600 text-white"
                        : "border-slate-300 text-slate-900 bg-slate-50"
                    }`}
                  >
                    Add&amp;Norm
                  </motion.div>
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
