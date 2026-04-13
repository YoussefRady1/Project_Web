import { motion } from "framer-motion";
import { useState } from "react";
import AttentionStep from "./AttentionStep";
import FeedForwardStep from "./FeedForwardStep";

function EncoderStackStep({ active, tokens, theme }) {
  const [layerCount, setLayerCount] = useState(1);
  const [view, setView] = useState("overview");
  const isDark = theme === "dark";

  const layerStyles = [
    {
      border: "border-red-500",
      text: isDark ? "text-red-300" : "text-red-700",
      glow: "shadow-[0_0_18px_rgba(239,68,68,0.18)]",
      note: "Layer 1: starts building context between words",
    },
    {
      border: "border-red-400",
      text: isDark ? "text-red-200" : "text-red-700",
      glow: "shadow-[0_0_18px_rgba(248,113,113,0.16)]",
      note: "Layer 2: adds more understanding",
    },
    {
      border: "border-orange-400",
      text: isDark ? "text-orange-300" : "text-orange-700",
      glow: "shadow-[0_0_18px_rgba(251,146,60,0.16)]",
      note: "Layer 3: refines relationships and meaning",
    },
    {
      border: "border-lime-400",
      text: isDark ? "text-lime-300" : "text-lime-700",
      glow: "shadow-[0_0_18px_rgba(163,230,53,0.16)]",
      note: "Layer 4: builds stronger contextual understanding",
    },
    {
      border: "border-green-400",
      text: isDark ? "text-green-300" : "text-green-700",
      glow: "shadow-[0_0_18px_rgba(74,222,128,0.18)]",
      note: "Layer 5: produces richer final representations",
    },
  ];

  const layers = layerStyles.slice(0, layerCount);

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

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[980px] min-h-[760px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-300 bg-white"
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
      : "border-blue-300 bg-blue-50"
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
      <p
        className={`text-[11px] text-center mb-4 max-w-[760px] leading-5 ${
          isDark ? "text-slate-500" : "text-slate-600"
        }`}
      >
        In the correct Transformer encoder architecture, self-attention and feed
        forward are not separate main steps outside the stack. They are inside
        each encoder layer. One encoder layer follows this order:
        self-attention, add &amp; normalize, feed forward, add &amp; normalize.
      </p>

      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
        <div
          className={`rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            What happens inside one encoder layer?
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
                  : "border-slate-300 bg-white"
              }`}
            >
              <div
                className={`font-medium mb-1 ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Correct encoder layer order
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Self-Attention
                </div>
                <span className={isDark ? "text-slate-500" : "text-slate-600"}>
                  →
                </span>
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Add &amp; Normalize
                </div>
                <span className={isDark ? "text-slate-500" : "text-slate-600"}>
                  →
                </span>
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Feed Forward
                </div>
                <span className={isDark ? "text-slate-500" : "text-slate-600"}>
                  →
                </span>
                <div
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Add &amp; Normalize
                </div>
              </div>
            </div>

            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-cyan-400/40 bg-cyan-400/5"
                  : "border-blue-300 bg-blue-50"
              }`}
            >
              <div
                className={`font-medium mb-1 ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Important note
              </div>
              <p>This encoder layer repeats multiple times to form the full encoder stack.</p>
            </div>

            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60"
                  : "border-slate-300 bg-white"
              }`}
            >
              <div
                className={`font-semibold text-lg mb-3 text-center ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Learn the internal parts first
              </div>

              <p
                className={`mb-4 text-sm leading-6 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Before fully understanding the encoder stack, the student should
                first know what self-attention does and what the feed forward
                layer does.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setView("attention")}
                  className={`px-4 py-1.5 text-xs border rounded-lg transition ${
                    isDark
                      ? "border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
                      : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
                  }`}
                >
                  Learn Self-Attention
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
              : "border-slate-300 bg-slate-50"
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
              After self-attention, the model adds the original input back and
              normalizes the result.
            </p>

            <p>
              After feed forward, it does the same thing again: add the previous
              signal and normalize it.
            </p>

            <p>
              This helps keep learning stable and preserves useful information
              through the layer.
            </p>
          </div>

          <div className="aspect-video rounded-lg overflow-hidden border border-slate-700">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/G45TuC6zRf4"
              title="Layer Normalization in Transformer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <p
            className={`text-[10px] mt-2 leading-4 ${
              isDark ? "text-slate-500" : "text-slate-600"
            }`}
          >
            Short side video to explain residual connection and layer normalization.
          </p>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border p-4 mb-5 ${
          isDark
            ? "border-slate-700 bg-slate-900/70"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <div
          className={`text-sm font-semibold text-center mb-4 ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          One Encoder Layer Diagram
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
              isDark ? "border-cyan-500 bg-slate-950/70" : "border-blue-300 bg-white"
            }`}
          >
            <div
              className={`w-full text-center text-sm font-medium mb-3 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              Encoder Layer
            </div>

            <div className="w-full flex flex-col items-center gap-2 text-xs">
              <div
                className={`w-full text-center px-2 py-1.5 rounded-lg border text-xs ${
                  isDark
                    ? "border-slate-600 text-white"
                    : "border-slate-300 text-slate-900 bg-slate-50"
                }`}
              >
                Self-Attention
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
        {layers.map((layer, index) => (
          <div key={index} className="flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{
                opacity: active ? 1 : 0.3,
                y: 0,
                scale: 1,
              }}
              transition={{ delay: index * 0.2, duration: 0.35 }}
              className={`w-full px-4 py-3 rounded-xl border ${layer.border} ${layer.glow} ${
                isDark ? "bg-slate-900" : "bg-white"
              }`}
            >
              <div className={`${layer.text} text-xs mb-1`}>Layer {index + 1}</div>

              <div
                className={`text-[10px] mb-2 leading-4 ${
                  isDark ? "text-slate-500" : "text-slate-600"
                }`}
              >
                {layer.note}
              </div>

              <div className="flex gap-2 mb-3 text-sm flex-wrap">
                {tokens.map((t, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      opacity: active ? 1 : 0.35,
                      y: active ? [0, -2, 0] : 0,
                      scale: active ? [1, 1.03 + index * 0.02, 1] : 1,
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.05 + index * 0.2,
                    }}
                    className={layer.text}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <motion.div
                  animate={{
                    scale: active ? [1, 1.08, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Self-Attention
                </motion.div>

                <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>

                <motion.div
                  animate={{
                    scale: active ? [1, 1.08, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.15,
                  }}
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Add &amp; Normalize
                </motion.div>

                <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>

                <motion.div
                  animate={{
                    scale: active ? [1, 1.08, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.3,
                  }}
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Feed Forward
                </motion.div>

                <span className={isDark ? "text-slate-500" : "text-slate-600"}>→</span>

                <motion.div
                  animate={{
                    scale: active ? [1, 1.08, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.45,
                  }}
                  className={`px-2 py-1 rounded border ${
                    isDark
                      ? "border-slate-600 text-white"
                      : "border-slate-300 text-slate-900 bg-slate-50"
                  }`}
                >
                  Add &amp; Normalize
                </motion.div>
              </div>
            </motion.div>

            {index !== layers.length - 1 && (
              <motion.div
                animate={{
                  y: active ? [0, 6, 0] : 0,
                  opacity: active ? 1 : 0,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                className={`text-lg my-2 ${isDark ? "text-cyan-400" : "text-blue-600"}`}
              >
                ↓
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div
        className={`mt-3 rounded-xl border p-3 text-[11px] leading-5 text-center w-full ${
          isDark
            ? "border-slate-700 bg-slate-900/70 text-slate-300"
            : "border-slate-300 bg-slate-50 text-slate-700"
        }`}
      >
        {layerCount === 1
          ? "With one encoder layer, the model starts building context between words."
          : layerCount < layerStyles.length
          ? "Adding more encoder layers repeats the same internal process and helps the model refine the sentence step by step."
          : "More encoder layers now repeat the same encoder-layer structure and build richer contextual understanding across the sentence."}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() =>
            setLayerCount((prev) => Math.min(prev + 1, layerStyles.length))
          }
          className={`px-4 py-1.5 text-xs border rounded-lg transition ${
            isDark
              ? "border-green-400 text-green-300 hover:bg-green-400/10"
              : "border-green-500 text-green-700 bg-green-100 hover:bg-green-200"
          }`}
        >
          Add Extra Encoder Layer
        </button>

        <button
          onClick={() => setLayerCount((prev) => Math.max(prev - 1, 1))}
          className={`px-4 py-1.5 text-xs border rounded-lg transition ${
            isDark
              ? "border-red-400 text-red-300 hover:bg-red-400/10"
              : "border-red-400 text-red-700 bg-red-100 hover:bg-red-200"
          }`}
        >
          Remove Encoder Layer
        </button>
      </div>
    </motion.div>
  );
}

export default EncoderStackStep;