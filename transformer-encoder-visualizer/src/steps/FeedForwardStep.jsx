import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// ✅ Controlled vector (25% negatives)
const generateVector = () =>
  Array.from({ length: 4 }).map(() => {
    const isNegative = Math.random() < 0.25;
    return isNegative
      ? (-Math.random()).toFixed(2)
      : (Math.random()).toFixed(2);
  });

function FeedForwardStep({ active, tokens }) {
  const [isOutput, setIsOutput] = useState(false);
  const [vectors, setVectors] = useState([]);

  // ✅ Generate once per tokens change
  useEffect(() => {
    const newVectors = tokens.map(() => generateVector());
    setVectors(newVectors);
    setIsOutput(false); // reset to input
  }, [tokens]);

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className="p-6 border border-cyan-500 rounded-2xl w-[460px] min-h-[240px] flex flex-col items-center"
    >
      {/* TITLE */}
      <h2 className="text-cyan-300 font-semibold text-center">
        Feed Forward (ReLU)
      </h2>

      <p className="text-xs text-slate-400 text-center mb-4">
        Refine and improve each word’s representation by ReLU that converts negative to zero
      </p>

      {/* 🔥 BUTTON */}
      <button
        onClick={() => setIsOutput((prev) => !prev)}
        className={`mb-4 px-4 py-1 text-xs border rounded ${
          isOutput
            ? "border-green-400 text-green-300 hover:bg-green-400/10"
            : "border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
        }`}
      >
        {isOutput ? "Show Input" : "Show Output" }
      </button>

      <div className="flex flex-col gap-4 w-full">

        {tokens.map((word, index) => {
          const vector = vectors[index] || [];

          return (
            <div
              key={index}
              className="flex items-center gap-3 justify-center flex-wrap"
            >
              {/* WORD */}
              <div className="text-cyan-300 text-sm w-12 text-right">
                {word}
              </div>

              {/* VECTOR */}
              <div className="flex gap-1 flex-wrap max-w-[260px] justify-center">
                {vector.map((v, i) => {
                  const val = parseFloat(v);
                  const isNegative = val < 0;
                  const relu = Math.max(0, val);

                  const displayValue = isOutput
                    ? relu.toFixed(2)
                    : v;

                  const isRed =
                    !isOutput && isNegative;

                  return (
                    <motion.div
                      key={i}
                      animate={{
                        scale:
                          isNegative && isOutput
                            ? [1, 1.15, 1]
                            : 1,
                      }}
                      transition={{ duration: 0.4 }}
                      className={`px-2 py-1 text-xs border rounded ${
                        isRed
                          ? "border-red-400 text-red-300"
                          : "border-cyan-400 text-cyan-300"
                      }`}
                    >
                      {displayValue}
                    </motion.div>
                  );
                })}
              </div>

              {/* 🔥 ARROW (FLIPS MANUALLY) */}
              <motion.span
                animate={{
                  rotate: isOutput ? 180 : 0,
                }}
                transition={{ duration: 0.4 }}
                className="text-cyan-400"
              >
                →
              </motion.span>

              {/* RELU */}
              <motion.div
                animate={{
                  scale: active ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                className="px-2 py-1 text-xs border border-purple-400 text-purple-300 rounded"
              >
                ReLU
              </motion.div>
            </div>
          );
        })}

      </div>
    </motion.div>
  );
}

export default FeedForwardStep;