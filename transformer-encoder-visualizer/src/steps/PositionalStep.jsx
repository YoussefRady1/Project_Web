import { motion } from "framer-motion";
import { useState } from "react";

// same stable embedding rule used in EmbeddingStep
const generateEmbeddingVector = (word) => {
  const cleanWord = (word || "").toLowerCase();

  if (!cleanWord) return ["0.00", "0.00", "0.00", "0.00"];

  const chars = cleanWord.split("");
  const codes = chars.map((char) => char.charCodeAt(0));

  const sum = codes.reduce((acc, code) => acc + code, 0);
  const first = codes[0] || 0;
  const last = codes[codes.length - 1] || 0;
  const length = cleanWord.length;

  const vowelCount = chars.filter((char) =>
    ["a", "e", "i", "o", "u"].includes(char)
  ).length;

  const v1 = ((sum % 100) / 100).toFixed(2);
  const v2 = (((first * length) % 100) / 100).toFixed(2);
  const v3 = (((last + vowelCount * 7) % 100) / 100).toFixed(2);
  const v4 = ((((sum + first + last + length) * 3) % 100) / 100).toFixed(2);

  return [v1, v2, v3, v4];
};

// fixed positional vector based on word position
const generatePositionVector = (position) => {
  const pos = position + 1;

  return [
    ((pos * 0.10) % 1).toFixed(2),
    ((pos * 0.20) % 1).toFixed(2),
    ((pos * 0.30) % 1).toFixed(2),
    ((pos * 0.40) % 1).toFixed(2),
  ];
};

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function PositionalStep({ active, tokens }) {
  const [usePosition, setUsePosition] = useState(true);
  const [shuffledTokens, setShuffledTokens] = useState([]);

    const embeddingVectors = tokens.map((word) => generateEmbeddingVector(word));
  const positionVectors = tokens.map((_, index) => generatePositionVector(index));

 const displayTokens = usePosition
  ? tokens
  : shuffledTokens;

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      className="relative p-6 border border-cyan-500 rounded-2xl w-[900px] min-h-[260px] flex flex-col items-center"
    >
      {/* TITLE */}
      <h2 className="text-cyan-300 font-semibold text-center">
        Positional Encoding
      </h2>

            <p className="text-xs text-slate-400 text-center mb-2">
        adds position information to each vector to keep the correct order
      </p>

      <div className="absolute top-4 right-4 z-10">
  <div className="rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 flex flex-col gap-2 text-[11px]">
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-sm border border-cyan-400 bg-cyan-400/10"></span>
      <span className="text-slate-300">Word embedding vector</span>
    </div>

    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-sm border border-purple-400 bg-purple-400/10"></span>
      <span className="text-slate-300">Positional vector</span>
    </div>

    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-sm border border-green-400 bg-green-400/10"></span>
      <span className="text-slate-300">Output vector</span>
    </div>
  </div>
</div>

      {/* 🔥 RED BUTTON */}
            <button
        onClick={() => {
  if (usePosition) {
    // going to WITHOUT  → shuffle once
    setShuffledTokens(shuffleArray(tokens));
  }
  setUsePosition(!usePosition);
}}
        className="mb-2 px-4 py-1 text-xs border border-red-400 text-red-300 rounded hover:bg-red-400/10"
      >
        {usePosition
          ? "Show Without Positional Encoding"
          : "Show With Positional Encoding"}
      </button>

      {usePosition && (
        <p className="text-[11px] text-slate-500 text-center mb-4">
          The purple positional vector is a fixed demo vector based on the word position:
          Word 1 gets one position vector, Word 2 gets another, and so on.
        </p>
      )}

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
              <div className="flex flex-col items-center gap-1">
                <div className="text-[10px] text-cyan-300">Embedding</div>
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
              </div>

              {/* POSITIONAL */}
              {usePosition && (
                <>
                  <span className="text-cyan-400">+</span>

                                    {/* POSITION VECTOR */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-[10px] text-purple-300">
                      Position vector (Word {index + 1})
                    </div>
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
                  </div>

                  <span className="text-cyan-400">→</span>

                                    {/* RESULT */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-[10px] text-green-300">Output vector</div>
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