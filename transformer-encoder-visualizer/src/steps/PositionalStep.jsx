import { motion } from "framer-motion";
import { useState } from "react";

// generate vector
const generateVector = () =>
  Array.from({ length: 4 }).map(() =>
    (Math.random()).toFixed(2)
  );

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function PositionalStep({ active, tokens }) {
  const [usePosition, setUsePosition] = useState(true);
  const [shuffledTokens, setShuffledTokens] = useState([]);

  const embeddingVectors = tokens.map(() => generateVector());
  const positionVectors = tokens.map(() => generateVector());

 const displayTokens = usePosition
  ? tokens
  : shuffledTokens;

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      className="p-6 border border-cyan-500 rounded-2xl w-[900px] min-h-[260px] flex flex-col items-center"
    >
      {/* TITLE */}
      <h2 className="text-cyan-300 font-semibold text-center">
        Positional Encoding
      </h2>

      <p className="text-xs text-slate-400 text-center mb-4">
        adds position information to each vector
      </p>

      {/* 🔥 RED BUTTON */}
      <button
        onClick={() => {
  if (usePosition) {
    // going to WITHOUT  → shuffle once
    setShuffledTokens(shuffleArray(tokens));
  }
  setUsePosition(!usePosition);
}}
        className="mb-4 px-4 py-1 text-xs border border-red-400 text-red-300 rounded hover:bg-red-400/10"
      >
        {usePosition
          ? "Show Without Positional Encoding"
          : "Show With Positional Encoding"}
      </button>

      <div className="flex flex-col gap-4 w-full items-center">

        {displayTokens.map((word, index) => {
          const emb = embeddingVectors[index];
          const pos = positionVectors[index];

          return (
            <motion.div
              key={index}
              layout
              animate={{
                x: 0,
              }}
              className="flex items-center gap-3 justify-center"
            >
              {/* 🔥 WORD + LABEL */}
              <div className="text-cyan-300 text-sm w-20 text-right">
                (Word {index + 1})
              </div>

              {/* WORD */}
              <div className="text-cyan-400 text-sm w-16 text-left">
                {word}
              </div>

              {/* EMBEDDING */}
              <div className="flex gap-1">
                {emb.map((v, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs border border-cyan-400 text-cyan-300 rounded"
                  >
                    {v}
                  </span>
                ))}
              </div>

              {/* POSITIONAL */}
              {usePosition && (
                <>
                  <span className="text-cyan-400">+</span>

                  {/* POSITION VECTOR */}
                  <div className="flex gap-1">
                    {pos.map((v, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs border border-purple-400 text-purple-300 rounded"
                      >
                        {v}
                      </span>
                    ))}
                  </div>

                  <span className="text-cyan-400">→</span>

                  {/* RESULT */}
                  <div className="flex gap-1">
                    {emb.map((v, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs border border-green-400 text-green-300 rounded"
                      >
                        {(parseFloat(v) + parseFloat(pos[i])).toFixed(2)}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}

      </div>
    </motion.div>
  );
}

export default PositionalStep;