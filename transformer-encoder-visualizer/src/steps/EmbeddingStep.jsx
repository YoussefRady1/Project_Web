import { motion } from "framer-motion";

// generate vector
const generateVector = () =>
  Array.from({ length: 4 }).map(() =>
    (Math.random() * 1).toFixed(2)
  );

function EmbeddingStep({ active, tokens }) {
  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className="p-6 border border-cyan-500 rounded-2xl w-[420px] min-h-[220px] flex flex-col items-center"
    >
      {/* TITLE */}
      <h2 className="text-cyan-300 font-semibold text-center">
        Embedding
      </h2>

      <p className="text-xs text-slate-400 text-center mb-3">
        converts each word into a vector
      </p>

      {/* CONTENT */}
      <div className="flex flex-col gap-4 mt-2 w-full">

        {tokens.map((word, index) => {
          const vector = generateVector();

          return (
            <div key={index} className="flex items-center gap-3">

              {/* WORD */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: active ? 1 : 0.3,
                  x: active ? 0 : -10,
                }}
                transition={{ delay: index * 0.2 }}
                className="text-cyan-300 text-sm w-12 text-right"
              >
                {word}
              </motion.div>

              {/* ARROW */}
              <motion.div
                animate={{
                  x: active ? [0, 6, 0] : 0,
                  opacity: active ? 1 : 0,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="text-cyan-400"
              >
                →
              </motion.div>

              {/* VECTOR */}
              <div className="flex gap-1 bg-slate-900 px-2 py-1 rounded border border-cyan-400">

                {vector.map((v, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: active ? 1 : 0,
                      y: active ? 0 : 10,
                    }}
                    transition={{
                      delay: index * 0.2 + i * 0.1,
                      duration: 0.3,
                    }}
                    className="text-white text-xs"
                  >
                    {v}
                  </motion.span>
                ))}

              </div>

            </div>
          );
        })}

      </div>
    </motion.div>
  );
}

export default EmbeddingStep;