import { motion } from "framer-motion";
import { useMemo } from "react";

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

function generatePositionVector(position) {
  const pos = position + 1;
  return [
    Number(((pos * 0.1) % 1).toFixed(2)),
    Number(((pos * 0.2) % 1).toFixed(2)),
    Number(((pos * 0.3) % 1).toFixed(2)),
    Number(((pos * 0.4) % 1).toFixed(2)),
  ];
}

function addVectors(a, b) {
  return a.map((v, i) => Number((v + b[i]).toFixed(2)));
}

function DecoderPositionalStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 6) : ["token"]),
    [tokens]
  );

  const decoderTokens = useMemo(
    () => ["<START>", ...safeTokens],
    [safeTokens]
  );

  const rows = useMemo(
    () =>
      decoderTokens.map((tok, i) => {
        const emb = getDecoderEmbedding(tok);
        const pos = generatePositionVector(i);
        const combined = addVectors(emb, pos);
        return { token: tok, embedding: emb, position: pos, combined };
      }),
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
        Positional Encoding (Decoder)
      </h2>

      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        Adding position information to each decoder embedding vector
      </p>

      <div
        className={`w-full max-w-[760px] mb-5 rounded-xl border p-3 ${
          isDark
            ? "border-cyan-400/30 bg-cyan-400/5"
            : "border-blue-400 bg-blue-50"
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
          Just like the encoder, the decoder processes tokens in parallel and
          needs positional encoding to know the order of generated tokens. The
          position of &lt;START&gt; is 0, the first predicted token is position
          1, and so on.
        </p>
        <p className={`text-[10px] italic mt-2 pt-2 ${isDark ? "border-t border-slate-700/50 text-cyan-300/70" : "border-t border-slate-300/50 text-blue-600/80"}`}>
          Like numbering the pages of a book — the content is the same, but the order matters for understanding the story.
        </p>
      </div>

      {/* Data flow */}
      <div className="w-full max-w-[760px] mb-5 grid grid-cols-3 gap-2">
        <div className={`rounded-xl border p-3 ${isDark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-400 bg-emerald-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>From previous step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Embedding vectors from the previous step. Each vector represents a word's meaning, but the model doesn't yet know which position each token is at.</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-cyan-500/30 bg-cyan-500/5" : "border-blue-400 bg-blue-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-700"}`}>What happens here</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>A unique position vector is added to each embedding. This lets the model distinguish 'word at position 0' from 'word at position 3' — crucial since transformers process all tokens in parallel.</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-400 bg-amber-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Goes to next step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>These position-aware vectors enter Masked Self-Attention, where each token learns about other tokens it's allowed to see.</p>
        </div>
      </div>

      <div
        className={`absolute top-3 right-3 z-10 rounded-lg border px-2.5 py-2 flex flex-col gap-1.5 text-[10px] ${
          isDark
            ? "border-slate-700 bg-slate-900/90"
            : "border-slate-400/70 bg-slate-50"
        }`}
        style={{ position: "relative", top: 0, right: 0, marginBottom: 16 }}
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-sm border ${
              isDark
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-blue-300 bg-blue-100"
            }`}
          />
          <span className={isDark ? "text-slate-300" : "text-slate-700"}>
            Decoder embedding
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-sm border ${
              isDark
                ? "border-purple-400 bg-purple-400/10"
                : "border-violet-300 bg-violet-100"
            }`}
          />
          <span className={isDark ? "text-slate-300" : "text-slate-700"}>
            Positional vector
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-sm border ${
              isDark
                ? "border-green-400 bg-green-400/10"
                : "border-green-400 bg-green-100"
            }`}
          />
          <span className={isDark ? "text-slate-300" : "text-slate-700"}>
            Combined output
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        {rows.map((row, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: active ? 1 : 0.3, y: 0 }}
            transition={{
              opacity: { duration: 0.35, delay: index * 0.08 },
              y: {
                type: "spring",
                stiffness: 240,
                damping: 24,
                delay: index * 0.08,
              },
            }}
            className="flex items-center gap-3 justify-center flex-wrap"
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
              {row.token}
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
                {row.embedding.map((v, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 text-xs border rounded ${
                      isDark
                        ? "border-cyan-400 text-cyan-300"
                        : "border-blue-400 text-blue-800 bg-blue-100"
                    }`}
                  >
                    {v.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>

            <motion.span
              animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.12,
              }}
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
                Position {index}
              </div>
              <div className="flex gap-1">
                {row.position.map((v, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 text-xs border rounded ${
                      isDark
                        ? "border-purple-400 text-purple-300"
                        : "border-violet-300 text-violet-700 bg-violet-100"
                    }`}
                  >
                    {v.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>

            <motion.span
              animate={{
                x: [0, 6, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.12 + 0.2,
              }}
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
                Output
              </div>
              <div className="flex gap-1">
                {row.combined.map((v, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.6, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 360,
                      damping: 22,
                      delay: index * 0.08 + i * 0.07 + 0.2,
                    }}
                    className={`px-2 py-1 text-xs border rounded ${
                      isDark
                        ? "border-green-400 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.18)]"
                        : "border-green-400 text-green-700 bg-green-100"
                    }`}
                  >
                    {v.toFixed(2)}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p
        className={`text-[11px] text-center mt-5 max-w-[700px] leading-5 ${
          isDark ? "text-slate-500" : "text-slate-600"
        }`}
      >
        Each decoder token's embedding is added to a positional vector. This
        gives the model both the meaning of the token and its position in the
        generated output sequence.
      </p>

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Without positional encoding, the model would treat "the cat sat on the mat" the same as "mat the on sat cat the." Position gives order to meaning.</p>
      </div>
    </motion.div>
  );
}

export default DecoderPositionalStep;
