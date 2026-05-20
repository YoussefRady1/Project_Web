import { motion } from "framer-motion";
import { useState, useMemo } from "react";

function generateEmbeddingVector(word) {
  const cleanWord = (word || "").toLowerCase();
  if (!cleanWord) return ["0.00", "0.00", "0.00", "0.00"];
  const chars = cleanWord.split("");
  const codes = chars.map((c) => c.charCodeAt(0));
  const sum = codes.reduce((a, c) => a + c, 0);
  const first = codes[0] || 0;
  const last = codes[codes.length - 1] || 0;
  const length = cleanWord.length;
  const vowelCount = chars.filter((c) => "aeiou".includes(c)).length;
  return [
    ((sum % 100) / 100).toFixed(2),
    (((first * length) % 100) / 100).toFixed(2),
    (((last + vowelCount * 7) % 100) / 100).toFixed(2),
    ((((sum + first + last + length) * 3) % 100) / 100).toFixed(2),
  ];
}

const START_VECTOR = ["0.20", "0.70", "0.10", "0.40"];

function getDecoderEmbedding(token) {
  if (token === "<START>") return START_VECTOR;
  return generateEmbeddingVector(token);
}

function generatePositionVector(position) {
  const pos = position + 1;
  return [
    ((pos * 0.1) % 1).toFixed(2),
    ((pos * 0.2) % 1).toFixed(2),
    ((pos * 0.3) % 1).toFixed(2),
    ((pos * 0.4) % 1).toFixed(2),
  ];
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function DecoderPositionalStep({ active, tokens = [], theme }) {
  const [usePosition, setUsePosition] = useState(true);
  const [shuffledTokens, setShuffledTokens] = useState([]);
  const isDark = theme === "dark";

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 6) : ["token"]),
    [tokens]
  );

  const decoderTokens = useMemo(
    () => ["<START>", ...safeTokens],
    [safeTokens]
  );

  const embeddingVectors = decoderTokens.map((tok) => getDecoderEmbedding(tok));
  const positionVectors = decoderTokens.map((_, i) => generatePositionVector(i));

  const displayTokens = usePosition ? decoderTokens : shuffledTokens;

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
      className={`relative p-6 border rounded-2xl w-[900px] min-h-[340px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-400/80 bg-white shadow-sm"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        Positional Encoding (Decoder)
      </h2>

      <p
        className={`text-xs text-center mb-2 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        tells the decoder <em>which generation step</em> it is currently on, not just word order
      </p>

      <div
        className={`w-full max-w-[560px] mx-auto mb-5 rounded-xl border p-3 ${
          isDark ? "border-cyan-400/30 bg-cyan-400/5" : "border-blue-400 bg-blue-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-1 ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Why we use this step decoder purpose
        </div>
        <p
          className={`text-[11px] leading-5 max-w-[620px] ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          Unlike the encoder where positional encoding orders the <strong>input</strong> words,
          the decoder uses it to track which <strong>generation step</strong> it is currently on.
          &lt;START&gt; is always step 0, the first predicted word is step 1, and so on.
          Without this, the decoder cannot distinguish whether it is generating the 1st or the 5th output word.
        </p>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <div
          className={`rounded-lg border px-2.5 py-2 flex flex-col gap-1.5 text-[10px] ${
            isDark
              ? "border-slate-700 bg-slate-900/90"
              : "border-slate-400/70 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-sm border ${
                isDark ? "border-cyan-400 bg-cyan-400/10" : "border-blue-300 bg-blue-100"
              }`}
            />
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              Decoder embedding
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-sm border ${
                isDark ? "border-purple-400 bg-purple-400/10" : "border-violet-300 bg-violet-100"
              }`}
            />
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              Positional vector
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-sm border ${
                isDark ? "border-green-400 bg-green-400/10" : "border-green-400 bg-green-100"
              }`}
            />
            <span className={isDark ? "text-slate-300" : "text-slate-700"}>
              Output vector
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (usePosition) {
            setShuffledTokens(shuffleArray(decoderTokens));
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
          ? "Show Decoder Without Position Info"
          : "Show Decoder With Position Info"}
      </button>

      {usePosition ? (
        <p
          className={`text-[11px] text-center mb-4 ${
            isDark ? "text-slate-500" : "text-slate-600"
          }`}
        >
          The purple positional vector marks the generation step: &lt;START&gt; = step 0,
          first predicted word = step 1, and so on different from the encoder where
          positions simply order the input words.
        </p>
      ) : (
        <p
          className={`text-[11px] text-center mb-4 ${
            isDark ? "text-red-400/70" : "text-red-600"
          }`}
        >
          Without positional encoding the decoder cannot tell which generation step it is on —
          all output positions appear equivalent, so the shuffled order below is indistinguishable.
        </p>
      )}

      <div className="flex flex-col gap-4 w-full items-center">
        {displayTokens.map((tok, index) => {
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
                (Pos {index})
              </div>

              <div
                className={`text-sm w-16 text-left ${
                  isDark ? "text-cyan-400" : "text-blue-700"
                }`}
              >
                {tok}
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
                          : "border-blue-400 text-blue-800 bg-blue-100"
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
                      Position vector (Pos {index})
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

export default DecoderPositionalStep;
