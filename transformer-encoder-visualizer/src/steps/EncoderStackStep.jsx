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
                </div>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <motion.div
                    animate={{
                      scale: active && isActive ? [1, 1.08, 1] : 1,
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
                      scale: active && isActive ? [1, 1.08, 1] : 1,
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
                      scale: active && isActive ? [1, 1.08, 1] : 1,
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
                      scale: active && isActive ? [1, 1.08, 1] : 1,
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
            : "border-slate-300 bg-slate-50 text-slate-700"
        }`}
      >
        {layerCount === 1
          ? "With one encoder layer, the model starts building context between words."
          : layerCount < layerStyles.length
          ? "Adding more encoder layers repeats the same internal process and helps the model refine the sentence step by step."
          : "More encoder layers now repeat the same encoder-layer structure and build richer contextual understanding across the sentence."}
      </div>

      <div
        className={`mt-4 w-full rounded-2xl border p-5 ${
          isDark
            ? "border-slate-700 bg-slate-900/70"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className={`inline-block w-2 h-2 rounded-full ${
                isDark ? "bg-green-400" : "bg-green-500"
              }`}
            />
            <div
              className={`text-sm font-semibold tracking-wide ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              Encoder Depth Animation
            </div>
          </div>

          <div
            className={`flex items-baseline gap-1 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              Depth
            </span>
            <span className="font-mono text-base font-bold tabular-nums">
              {layerCount}
            </span>
            <span className="text-xs opacity-60">/ {layerStyles.length}</span>
          </div>
        </div>

        <div className="relative px-3 pt-1 pb-2 mb-4">
          <div
            className={`absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[3px] rounded-full ${
              isDark ? "bg-slate-700" : "bg-slate-300"
            }`}
          />
          <motion.div
            animate={{
              width: `calc(${
                ((layerCount - 1) / (layerStyles.length - 1)) * 100
              }% )`,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-green-500"
          />

          <div className="relative flex items-center justify-between">
            {layerStyles.map((layer, i) => {
              const isFilled = i < layerCount;
              const isCurrent = i === layerCount - 1;
              return (
                <div key={i} className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: isCurrent ? [1, 1.15, 1] : 1,
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-colors duration-300 ${
                      isFilled
                        ? `${layer.dot} ${
                            isDark
                              ? "border-slate-900 text-slate-900"
                              : "border-white text-white"
                          }`
                        : isDark
                        ? "bg-slate-800 border-slate-600 text-slate-500"
                        : "bg-white border-slate-300 text-slate-400"
                    } ${
                      isCurrent
                        ? isDark
                          ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-300/70"
                          : "ring-2 ring-offset-2 ring-offset-slate-50 ring-blue-500/60"
                        : ""
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                  <span
                    className={`mt-1.5 text-[10px] font-semibold tracking-wide ${
                      isFilled
                        ? isDark
                          ? "text-slate-200"
                          : "text-slate-700"
                        : isDark
                        ? "text-slate-600"
                        : "text-slate-400"
                    }`}
                  >
                    Layer {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div
          key={layerCount}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`rounded-lg border px-3 py-2 mb-3 ${
            isDark
              ? "border-slate-700 bg-slate-950/60"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                layerStyles[layerCount - 1].dot
              }`}
            />
            <div
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Currently active
            </div>
          </div>
          <div
            className={`text-xs leading-5 mt-1 ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            {layerStyles[layerCount - 1].note}
          </div>
        </motion.div>

        <div className="flex items-center justify-between gap-3">
          <div
            className={`text-[11px] leading-4 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            More layers → richer context and deeper understanding.
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Understanding
            </span>
            <div
              className={`w-24 h-1.5 rounded-full overflow-hidden ${
                isDark ? "bg-slate-800" : "bg-slate-200"
              }`}
            >
              <motion.div
                animate={{
                  width: `${(layerCount / layerStyles.length) * 100}%`,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-green-500"
              />
            </div>
            <span
              className={`text-[11px] font-mono font-semibold tabular-nums ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              {Math.round((layerCount / layerStyles.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default EncoderStackStep;