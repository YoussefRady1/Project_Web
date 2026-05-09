import { motion } from "framer-motion";
import { useMemo, useState } from "react";

function generateEmbeddingVector(word) {
  const cleanWord = (word || "").toLowerCase();
  if (!cleanWord) return [0, 0, 0, 0];
  const chars = cleanWord.split("");
  const codes = chars.map((c) => c.charCodeAt(0));
  const sum = codes.reduce((a, c) => a + c, 0);
  const first = codes[0] || 0;
  const last = codes[codes.length - 1] || 0;
  const length = cleanWord.length;
  const vowelCount = chars.filter((c) => "aeiou".includes(c)).length;
  return [
    Number(((sum % 100) / 100).toFixed(2)),
    Number((((first * length) % 100) / 100).toFixed(2)),
    Number((((last + vowelCount * 7) % 100) / 100).toFixed(2)),
    Number(((((sum + first + last + length) * 3) % 100) / 100).toFixed(2)),
  ];
}

const START_VECTOR = [0.2, 0.7, 0.1, 0.4];

function getDecoderEmbedding(token) {
  if (token === "<START>") return START_VECTOR;
  return generateEmbeddingVector(token);
}

function DecoderEmbeddingStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [showExplanation, setShowExplanation] = useState(false);

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 3) : ["token"]),
    [tokens]
  );

  const decoderTokens = useMemo(
    () => ["<START>", ...safeTokens],
    [safeTokens]
  );

  const embeddings = useMemo(
    () => decoderTokens.map((t) => ({ token: t, vector: getDecoderEmbedding(t) })),
    [decoderTokens]
  );

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[980px] min-h-[620px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-400/80 bg-white shadow-sm"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        Output Embedding
      </h2>

      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        Each decoder token is converted into a vector representation
      </p>

      <div
        className={`w-full max-w-[760px] rounded-xl border p-4 mb-4 ${
          isDark
            ? "border-slate-700 bg-slate-900/70"
            : "border-slate-400/70 bg-slate-50"
        }`}
      >
        <div
          className={`text-[10px] uppercase tracking-wide text-center mb-1 ${
            isDark ? "text-cyan-300/70" : "text-blue-600"
          }`}
        >
          &lt;START&gt; special embedding
        </div>
        <div className="flex gap-2 justify-center">
          {START_VECTOR.map((v, i) => (
            <motion.span
              key={i}
              animate={
                active
                  ? {
                      boxShadow: isDark
                        ? [
                            "0 0 0px rgba(34,211,238,0)",
                            "0 0 14px rgba(34,211,238,0.4)",
                            "0 0 0px rgba(34,211,238,0)",
                          ]
                        : [
                            "0 0 0px rgba(59,130,246,0)",
                            "0 0 10px rgba(59,130,246,0.3)",
                            "0 0 0px rgba(59,130,246,0)",
                          ],
                    }
                  : {}
              }
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.1 }}
              className={`px-3 py-1.5 text-xs rounded border font-mono ${
                isDark
                  ? "border-cyan-400 text-cyan-300 bg-cyan-400/10"
                  : "border-blue-400 text-blue-800 bg-blue-100"
              }`}
            >
              {v.toFixed(2)}
            </motion.span>
          ))}
        </div>
        <p
          className={`text-[10px] text-center mt-2 ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          Fixed demo vector for the &lt;START&gt; token
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 items-center">
        {embeddings.map(({ token, vector }, index) => (
          <motion.div
            key={token + index}
            initial={{ opacity: 0, x: -14 }}
            animate={{
              opacity: active ? 1 : 0.3,
              x: active ? 0 : -10,
            }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 22,
              delay: index * 0.12,
            }}
            className="flex items-center gap-3"
          >
            <div
              className={`text-sm w-20 text-right font-medium ${
                index === 0
                  ? isDark
                    ? "text-cyan-300"
                    : "text-blue-800"
                  : isDark
                  ? "text-slate-300"
                  : "text-slate-700"
              }`}
            >
              {token}
            </div>

            <motion.div
              animate={{
                x: active ? [0, 8, 0] : 0,
                opacity: active ? [0.6, 1, 0.6] : 0,
                scale: active ? [1, 1.15, 1] : 1,
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.15,
              }}
              className={isDark ? "text-cyan-400" : "text-blue-600"}
            >
              →
            </motion.div>

            <div className="flex flex-col gap-1">
              <div
                className={`text-[10px] ${
                  isDark ? "text-slate-500" : "text-slate-600"
                }`}
              >
                {index === 0 ? "fixed start embedding" : "letter-based demo vector"}
              </div>
              <div
                className={`flex gap-1 px-2 py-1 rounded border ${
                  isDark
                    ? "bg-slate-900 border-cyan-400"
                    : "bg-white border-blue-400"
                }`}
              >
                {vector.map((v, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 14, scale: 0.6 }}
                    animate={{
                      opacity: active ? 1 : 0,
                      y: active ? 0 : 10,
                      scale: active ? 1 : 0.6,
                    }}
                    transition={{
                      delay: index * 0.12 + i * 0.07,
                      type: "spring",
                      stiffness: 340,
                      damping: 22,
                    }}
                    className={
                      isDark ? "text-white text-xs" : "text-slate-900 text-xs"
                    }
                  >
                    {v.toFixed(2)}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => setShowExplanation((v) => !v)}
        className={`mt-5 text-[11px] font-medium underline underline-offset-2 ${
          isDark ? "text-cyan-300 hover:text-cyan-200" : "text-blue-700 hover:text-blue-800"
        }`}
      >
        {showExplanation ? "Hide explanation" : "Show explanation"}
      </button>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-[700px] mt-3 rounded-xl border p-3 text-[11px] leading-5 ${
            isDark ? "border-slate-700 bg-slate-900/70 text-slate-300" : "border-slate-300 bg-slate-50 text-slate-700"
          }`}
        >
          <p className="mb-2">
            Just like the encoder, the decoder cannot work with raw tokens directly. Each token — including the special &lt;START&gt; token — must first be converted into a numerical vector so the Transformer can process it.
          </p>
          <p>
            The decoder has its own embedding table, separate from the encoder's. The &lt;START&gt; token uses a fixed embedding vector.
          </p>
        </motion.div>
      )}

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Embedding converts text into numbers. Words with similar meanings tend to have similar embedding vectors, which helps the model understand relationships between words.</p>
      </div>
    </motion.div>
  );
}

export default DecoderEmbeddingStep;
