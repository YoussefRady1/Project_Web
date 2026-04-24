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

function PositionalStep({ active, tokens, theme }) {
  const [usePosition, setUsePosition] = useState(true);
  const [shuffledTokens, setShuffledTokens] = useState([]);
  const isDark = theme === "dark";

  const embeddingVectors = tokens.map((word) => generateEmbeddingVector(word));
  const positionVectors = tokens.map((_, index) => generatePositionVector(index));

  const displayTokens = usePosition ? tokens : shuffledTokens;

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      className={`relative p-6 border rounded-2xl w-[900px] min-h-[340px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-300 bg-white"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        Positional Encoding
      </h2>

      <p
        className={`text-xs text-center mb-2 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        adds position information to each vector to keep the correct order
      </p>
<div
  className={`w-full max-w-[560px] mx-auto mb-5 rounded-xl border p-3 ${
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
  className={`text-[11px] leading-5 max-w-[620px] ${
      isDark ? "text-slate-300" : "text-slate-700"
    }`}
  >
    We use positional encoding because the Transformer processes tokens in parallel, so it needs extra position information to know the order of words inside the sentence.
  </p>
</div>
      <div className="absolute top-3 right-3 z-10">
  <div
    className={`rounded-lg border px-2.5 py-2 flex flex-col gap-1.5 text-[10px] ${
            isDark
              ? "border-slate-700 bg-slate-900/90"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-sm border ${
                isDark ? "border-cyan-400 bg-cyan-400/10" : "border-blue-300 bg-blue-100"
              }`}
            ></span>
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              Word embedding vector
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-sm border ${
                isDark ? "border-purple-400 bg-purple-400/10" : "border-violet-300 bg-violet-100"
              }`}
            ></span>
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              Positional vector
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-sm border ${
                isDark ? "border-green-400 bg-green-400/10" : "border-green-400 bg-green-100"
              }`}
            ></span>
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              Output vector
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (usePosition) {
            setShuffledTokens(shuffleArray(tokens));
          }
          setUsePosition(!usePosition);
        }}
        className={`mb-2 px-4 py-1 text-xs border rounded transition ${
          isDark
            ? "border-red-400 text-red-300 hover:bg-red-400/10"
            : "border-red-400 text-red-700 hover:bg-red-100"
        }`}
      >
        {usePosition
          ? "Show Without Positional Encoding"
          : "Show With Positional Encoding"}
      </button>

      {usePosition && (
        <p
          className={`text-[11px] text-center mb-4 ${
            isDark ? "text-slate-500" : "text-slate-600"
          }`}
        >
          The purple positional vector is a fixed demo vector based on the word
          position: Word 1 gets one position vector, Word 2 gets another, and so on.
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                layout: { type: "spring", stiffness: 320, damping: 32 },
                opacity: { duration: 0.35, delay: index * 0.06 },
                y: { type: "spring", stiffness: 240, damping: 24, delay: index * 0.06 },
              }}
              className="flex items-center gap-3 justify-center"
            >
              <div
                className={`text-sm w-20 text-right ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                (Word {index + 1})
              </div>

              <div
                className={`text-sm w-16 text-left ${
                  isDark ? "text-cyan-400" : "text-blue-700"
                }`}
              >
                {word}
              </div>

              <div className="flex flex-col items-center gap-1">
                <div
                  className={`text-[10px] ${
                    isDark ? "text-cyan-300" : "text-blue-800"
                  }`}
                >
                  Embedding
                </div>
                <div className="flex gap-1">
                  {emb.map((v, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 text-xs border rounded ${
                        isDark
                          ? "border-cyan-400 text-cyan-300"
                          : "border-blue-300 text-blue-800 bg-blue-100"
                      }`}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {usePosition && (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 }}
                    className={isDark ? "text-cyan-400" : "text-blue-600"}
                  >
                    +
                  </motion.span>

                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`text-[10px] ${
                        isDark ? "text-purple-300" : "text-violet-700"
                      }`}
                    >
                      Position vector (Word {index + 1})
                    </div>
                    <div className="flex gap-1">
                      {pos.map((v, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 text-xs border rounded ${
                            isDark
                              ? "border-purple-400 text-purple-300"
                              : "border-violet-300 text-violet-700 bg-violet-100"
                          }`}
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.span
                    animate={{ x: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 + 0.2 }}
                    className={isDark ? "text-cyan-400" : "text-blue-600"}
                  >
                    →
                  </motion.span>

                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`text-[10px] ${
                        isDark ? "text-green-300" : "text-green-700"
                      }`}
                    >
                      Output vector
                    </div>
                    <div className="flex gap-1">
                      {emb.map((v, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.6, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 360,
                            damping: 22,
                            delay: index * 0.06 + i * 0.07 + 0.2,
                          }}
                          className={`px-2 py-1 text-xs border rounded ${
                            isDark
                              ? "border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.18)]"
                              : "border-green-400 text-green-700 bg-green-100"
                          }`}
                        >
                          {(parseFloat(v) + parseFloat(pos[i])).toFixed(2)}
                        </motion.span>
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