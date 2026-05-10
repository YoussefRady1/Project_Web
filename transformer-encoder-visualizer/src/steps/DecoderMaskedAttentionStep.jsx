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

const WQ = [0.9, 0.3, 0.6, 0.2];
const WK = [0.2, 0.8, 0.4, 0.7];
const WV = [0.7, 0.4, 0.9, 0.3];
const Q_SHIFT = [0.03, 0.05, 0.02, 0.04];
const K_SHIFT = [0.04, 0.02, 0.05, 0.03];
const V_SHIFT = [0.02, 0.04, 0.03, 0.05];

function projectVector(input, weights, shift) {
  return input.map((v, i) =>
    Number(((v * weights[i] + shift[i]) % 1).toFixed(2))
  );
}

function dotProduct(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

function normalizeScore(score) {
  return Math.min(0.99, Math.max(0, score / 2.5));
}

function formatVector(vector) {
  return vector.map((v) => v.toFixed(2));
}

function DecoderMaskedAttentionStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 10) : ["token"]),
    [tokens]
  );

  const decoderTokens = useMemo(
    () => ["<START>", ...safeTokens],
    [safeTokens]
  );

  const tokenVectors = useMemo(
    () =>
      decoderTokens.map((tok, i) => {
        const emb = getDecoderEmbedding(tok);
        const pos = generatePositionVector(i);
        const input = addVectors(emb, pos);
        const query = projectVector(input, WQ, Q_SHIFT);
        const key = projectVector(input, WK, K_SHIFT);
        const value = projectVector(input, WV, V_SHIFT);
        return { token: tok, input, query, key, value };
      }),
    [decoderTokens]
  );

  const maskedMatrix = useMemo(
    () =>
      tokenVectors.map((src, row) =>
        tokenVectors.map((tgt, col) => {
          const isMasked = col > row;
          const raw = dotProduct(src.query, tgt.key);
          const score = normalizeScore(raw);
          return {
            score: Number(score.toFixed(2)),
            masked: isMasked,
          };
        })
      ),
    [tokenVectors]
  );

  const focusedData = tokenVectors[focusedIndex] || tokenVectors[0];

  const canAttendTo = decoderTokens
    .slice(0, focusedIndex + 1)
    .filter((_, i) => i !== focusedIndex);
  const maskedTokens = decoderTokens.slice(focusedIndex + 1);

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
        Masked Self-Attention
      </h2>

      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        The decoder can only attend to past and current tokens, future tokens
        are masked
      </p>

      <button
        onClick={() => setShowExplanation((v) => !v)}
        className={`mb-3 text-[11px] font-medium underline underline-offset-2 ${
          isDark ? "text-cyan-300 hover:text-cyan-200" : "text-blue-700 hover:text-blue-800"
        }`}
      >
        {showExplanation ? "Hide explanation" : "Show explanation"}
      </button>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-[760px] mb-5 rounded-xl border p-3 text-[11px] leading-5 ${
            isDark ? "border-slate-700 bg-slate-900/70 text-slate-300" : "border-slate-300 bg-slate-50 text-slate-700"
          }`}
        >
          Masked self-attention prevents the decoder from "cheating" by looking at future tokens. Each position can only attend to itself and previous tokens, enforcing left-to-right autoregressive generation.
        </motion.div>
      )}

      <div className="w-full max-w-[760px] mb-5">
        <div
          className={`rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-400/70 bg-slate-50"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            How does masking work?
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              The attention score matrix is the same as in the encoder: each
              token's{" "}
              <span className={isDark ? "text-amber-300" : "text-amber-700"}>
                Query
              </span>{" "}
              is compared with every other token's{" "}
              <span className={isDark ? "text-pink-300" : "text-pink-700"}>
                Key
              </span>
              .
            </p>
            <p>
              But before applying softmax, all future positions are set to{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                −∞
              </span>
              , which makes their attention weight effectively{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                zero
              </span>
              .
            </p>
            <p>
              This creates a{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                causal mask
              </span>{" "}
               a triangular pattern where each token can only see itself and
              previous tokens.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border p-4 mb-5 ${
          isDark
            ? "border-slate-700 bg-slate-900/80"
            : "border-slate-400/70 bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className={`text-sm font-semibold ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            Token perspective
          </div>
          <div
            className={`text-[10px] ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Click a token to inspect
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 justify-center items-center">
          {decoderTokens.map((tok, i) => (
            <motion.button
              key={tok + i}
              onClick={() => setFocusedIndex(i)}
              animate={{
                scale: focusedIndex === i ? 1.08 : 1,
                boxShadow:
                  focusedIndex === i
                    ? isDark
                      ? "0 0 16px rgba(34,211,238,0.4)"
                      : "0 0 12px rgba(59,130,246,0.3)"
                    : "none",
              }}
              className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                focusedIndex === i
                  ? isDark
                    ? "border-cyan-400 text-cyan-300 bg-cyan-400/15"
                    : "border-blue-400 text-blue-800 bg-blue-100"
                  : isDark
                  ? "border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700"
                  : "border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
              }`}
            >
              {tok}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div
            className={`rounded-lg border p-3 ${
              isDark
                ? "border-cyan-400/30 bg-cyan-400/5"
                : "border-blue-400 bg-blue-50"
            }`}
          >
            <div
              className={`text-[10px] uppercase tracking-wide mb-1 ${
                isDark ? "text-cyan-300/80" : "text-blue-700"
              }`}
            >
              Current token
            </div>
            <div
              className={`text-sm font-medium ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              {decoderTokens[focusedIndex]}
            </div>
          </div>

          <div
            className={`rounded-lg border p-3 ${
              isDark
                ? "border-green-400/30 bg-green-400/5"
                : "border-green-400 bg-green-50"
            }`}
          >
            <div
              className={`text-[10px] uppercase tracking-wide mb-1 ${
                isDark ? "text-green-300/80" : "text-green-700"
              }`}
            >
              Can attend to
            </div>
            <div
              className={`text-sm ${
                isDark ? "text-green-300" : "text-green-700"
              }`}
            >
              {canAttendTo.length > 0 ? canAttendTo.join(", ") : "Only self"}
            </div>
          </div>

          <div
            className={`rounded-lg border p-3 ${
              isDark
                ? "border-red-400/30 bg-red-400/5"
                : "border-red-400 bg-red-50"
            }`}
          >
            <div
              className={`text-[10px] uppercase tracking-wide mb-1 ${
                isDark ? "text-red-300/80" : "text-red-700"
              }`}
            >
              Masked (cannot see)
            </div>
            <div
              className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}
            >
              {maskedTokens.length > 0 ? maskedTokens.join(", ") : "None"}
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border p-3 ${
            isDark
              ? "border-slate-700 bg-slate-950/60"
              : "border-slate-400/70 bg-white"
          }`}
        >
          <div
            className={`font-medium mb-2 text-[11px] ${
              isDark ? "text-slate-300" : "text-slate-900"
            }`}
          >
            Q, K, V for: {focusedData.token}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] w-8 ${
                  isDark ? "text-amber-300" : "text-amber-700"
                }`}
              >
                Q:
              </span>
              {formatVector(focusedData.query).map((v, i) => (
                <span
                  key={`q-${i}`}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    isDark
                      ? "border-amber-400 text-amber-300"
                      : "border-amber-400 text-amber-700 bg-amber-100"
                  }`}
                >
                  {v}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] w-8 ${
                  isDark ? "text-pink-300" : "text-pink-700"
                }`}
              >
                K:
              </span>
              {formatVector(focusedData.key).map((v, i) => (
                <span
                  key={`k-${i}`}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    isDark
                      ? "border-pink-400 text-pink-300"
                      : "border-pink-400 text-pink-700 bg-pink-100"
                  }`}
                >
                  {v}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] w-8 ${
                  isDark ? "text-lime-300" : "text-lime-700"
                }`}
              >
                V:
              </span>
              {formatVector(focusedData.value).map((v, i) => (
                <span
                  key={`v-${i}`}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    isDark
                      ? "border-lime-400 text-lime-300"
                      : "border-lime-400 text-lime-700 bg-lime-100"
                  }`}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border p-4 mb-5 ${
          isDark
            ? "border-slate-700 bg-slate-900/80"
            : "border-slate-400/70 bg-slate-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-3 ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Masked attention matrix
        </div>

        <div
          className={`text-[11px] leading-5 mb-3 ${
            isDark ? "text-slate-400" : "text-slate-700"
          }`}
        >
          Blue cells = allowed attention. Red cells with 🔒 = masked future
          positions (set to −∞ before softmax).
        </div>

        <div className="overflow-x-auto">
          <table className="text-[11px] border-collapse">
            <thead>
              <tr>
                <th
                  className={`px-2 py-1 ${
                    isDark ? "text-slate-500" : "text-slate-600"
                  }`}
                />
                {decoderTokens.map((tok, i) => (
                  <th
                    key={`col-${i}`}
                    className={`px-2 py-1 font-medium ${
                      isDark ? "text-cyan-300" : "text-blue-800"
                    }`}
                  >
                    {tok}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maskedMatrix.map((row, rIdx) => (
                <tr key={`row-${rIdx}`}>
                  <td
                    className={`px-2 py-1 font-medium ${
                      isDark ? "text-cyan-300" : "text-blue-800"
                    }`}
                  >
                    {decoderTokens[rIdx]}
                  </td>
                  {row.map((cell, cIdx) => (
                    <td key={`cell-${rIdx}-${cIdx}`} className="px-1 py-1">
                      <motion.div
                        animate={
                          active && !cell.masked
                            ? {
                                boxShadow: isDark
                                  ? [
                                      "0 0 0px rgba(34,211,238,0)",
                                      "0 0 8px rgba(34,211,238,0.25)",
                                      "0 0 0px rgba(34,211,238,0)",
                                    ]
                                  : "none",
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: rIdx * 0.1,
                        }}
                        className={`min-w-[52px] text-center rounded border px-2 py-1 ${
                          cell.masked
                            ? isDark
                              ? "border-red-400/40 bg-red-400/10 text-red-300/60"
                              : "border-red-300 bg-red-50 text-red-400"
                            : isDark
                            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                            : "border-blue-400 bg-blue-50 text-blue-800"
                        }`}
                      >
                        {cell.masked ? "🔒" : cell.score.toFixed(2)}
                      </motion.div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`w-full max-w-[760px] mt-2 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Masking prevents the decoder from "cheating" by looking at future tokens. This ensures the model learns to predict each word using only past context, just like how you generate speech one word at a time.</p>
      </div>
    </motion.div>
  );
}

export default DecoderMaskedAttentionStep;
