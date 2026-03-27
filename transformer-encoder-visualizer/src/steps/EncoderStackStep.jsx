import { motion } from "framer-motion";

function EncoderStackStep({ active, tokens }) {
  const layers = [
    { border: "border-cyan-400", text: "text-cyan-300" },
    { border: "border-purple-400", text: "text-purple-300" },
    { border: "border-green-400", text: "text-green-300" },
  ];

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className="p-6 border border-cyan-500 rounded-2xl w-[460px] min-h-[320px] flex flex-col items-center"
    >
      {/* TITLE */}
      <h2 className="text-cyan-300 font-semibold text-center">
        Encoder Stack
      </h2>

      <p className="text-xs text-slate-400 text-center mb-4">
        The attention process is repeated across multiple layers
      </p>

      <div className="flex flex-col items-center w-full">

        {layers.map((layer, index) => (
          <div key={index} className="flex flex-col items-center w-full">

            {/* LAYER BOX */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: active ? 1 : 0.3,
                y: 0,
              }}
              transition={{ delay: index * 0.2 }}
              className={`w-full px-4 py-3 rounded-xl border ${layer.border} bg-slate-900`}
            >
              {/* LAYER TITLE */}
              <div className={`${layer.text} text-xs mb-2`}>
                Layer {index + 1}
              </div>

              {/* TOKENS */}
              <div className="flex gap-2 mb-2 text-sm">
                {tokens.map((t, i) => (
                  <span key={i} className={layer.text}>
                    {t}
                  </span>
                ))}
              </div>

              {/* INNER STEPS */}
              <div className="flex items-center gap-2 text-xs">

                {/* ATTENTION */}
                <motion.div
                  animate={{
                    boxShadow: active
                      ? ["0 0 0px", "0 0 10px", "0 0 0px"]
                      : "none",
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                  }}
                  className="px-2 py-1 rounded border border-slate-600"
                >
                  Attention
                </motion.div>

                <span className="text-slate-500">→</span>

                {/* FFN */}
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

            {/* 🔥 ARROW BETWEEN LAYERS */}
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
    </motion.div>
  );
}

export default EncoderStackStep;