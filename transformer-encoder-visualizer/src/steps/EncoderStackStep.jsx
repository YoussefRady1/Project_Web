import { motion } from "framer-motion";
import { useState } from "react";

function EncoderStackStep({ active, tokens }) {
  const layerStyles = [
    {
      border: "border-red-500",
      text: "text-red-300",
      glow: "shadow-[0_0_18px_rgba(239,68,68,0.18)]",
      note: "Layer 1: starts building context between words",
    },
    {
      border: "border-red-400",
      text: "text-red-200",
      glow: "shadow-[0_0_18px_rgba(248,113,113,0.16)]",
      note: "Layer 2: adds more understanding",
    },
    {
      border: "border-orange-400",
      text: "text-orange-300",
      glow: "shadow-[0_0_18px_rgba(251,146,60,0.16)]",
      note: "Layer 3: refines relationships and meaning",
    },
    {
      border: "border-lime-400",
      text: "text-lime-300",
      glow: "shadow-[0_0_18px_rgba(163,230,53,0.16)]",
      note: "Layer 4: builds stronger contextual understanding",
    },
    {
      border: "border-green-400",
      text: "text-green-300",
      glow: "shadow-[0_0_18px_rgba(74,222,128,0.18)]",
      note: "Layer 5: produces richer final representations",
    },
  ];

  const [layerCount, setLayerCount] = useState(1);
  const layers = layerStyles.slice(0, layerCount);

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className="p-6 border border-cyan-500 rounded-2xl w-[460px] min-h-[320px] flex flex-col items-center"
    >
      <h2 className="text-cyan-300 font-semibold text-center">
        Encoder Stack
      </h2>

      <p className="text-xs text-slate-400 text-center mb-2">
        The same process is repeated across layers so the model can understand
        the sentence more deeply
      </p>

      <p className="text-[11px] text-slate-500 text-center mb-4 max-w-[380px] leading-5">
        Each layer takes the output of the previous one, applies self-attention
        and feed forward again, and builds a richer representation of each word.
      </p>

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
              className={`w-full px-4 py-3 rounded-xl border ${layer.border} ${layer.glow} bg-slate-900`}
            >
              <div className={`${layer.text} text-xs mb-1`}>
                Layer {index + 1}
              </div>

              <div className="text-[10px] text-slate-500 mb-2 leading-4">
                {layer.note}
              </div>

              <div className="flex gap-2 mb-2 text-sm flex-wrap">
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
                  className="px-2 py-1 rounded border border-slate-600"
                >
                  Attention
                </motion.div>

                <span className="text-slate-500">→</span>

                <motion.div
                  animate={{
                    scale: active ? [1, 1.08, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                  className="px-2 py-1 rounded border border-slate-600"
                >
                  Feed Forward
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
                className="text-cyan-400 text-lg my-2"
              >
                ↓
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-[11px] text-slate-300 leading-5 text-center w-full">
        {layerCount === 1
          ? "With one encoder layer, the model starts building context between words."
          : layerCount < layerStyles.length
          ? "Adding more encoder layers helps the model refine the sentence step by step and build deeper understanding."
          : "More encoder layers now give stronger and richer contextual understanding, which is why deeper encoders usually perform better."}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() =>
            setLayerCount((prev) => Math.min(prev + 1, layerStyles.length))
          }
          className="px-4 py-1.5 text-xs border border-green-400 text-green-300 rounded-lg hover:bg-green-400/10 transition"
        >
          Add Extra Encoder Layer
        </button>

        <button
          onClick={() => setLayerCount((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-1.5 text-xs border border-red-400 text-red-300 rounded-lg hover:bg-red-400/10 transition"
        >
          Remove Encoder Layer
        </button>
      </div>
    </motion.div>
  );
}

export default EncoderStackStep;