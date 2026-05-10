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

function generateEncoderOutputVector(word, index, tokenCount) {
  const embedding = generateEmbeddingVector(word);
  const position = generatePositionVector(index);
  const encoderInput = addVectors(embedding, position);
  const contextBoost = [
    Number((((index + 1) * 0.08) % 1).toFixed(2)),
    Number((((tokenCount - index) * 0.05) % 1).toFixed(2)),
    Number((((word.length % 5) * 0.07) % 1).toFixed(2)),
    Number(((((index + 1) + word.length) * 0.04) % 1).toFixed(2)),
  ];
  return encoderInput.map((v, i) => Number((v + contextBoost[i]).toFixed(2)));
}

const WQ = [0.9, 0.3, 0.6, 0.2];
const WK = [0.2, 0.8, 0.4, 0.7];
const Q_SHIFT = [0.03, 0.05, 0.02, 0.04];
const K_SHIFT = [0.04, 0.02, 0.05, 0.03];

function projectVector(input, weights, shift) {
  return input.map((v, i) =>
    Number(((v * weights[i] + shift[i]) % 1).toFixed(2))
  );
}

function dotProduct(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

function normalizeScore(score) {
  return Math.min(0.99, Math.max(0.01, score / 2.5));
}

function DecoderCrossAttentionStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [hoveredDecoder, setHoveredDecoder] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 6) : ["token"]),
    [tokens]
  );

  const decoderTokens = useMemo(
    () => ["<START>", ...safeTokens],
    [safeTokens]
  );

  const encoderOutputs = useMemo(
    () =>
      safeTokens.map((word, i) => ({
        word,
        vector: generateEncoderOutputVector(word, i, safeTokens.length),
      })),
    [safeTokens]
  );

  const decoderVectors = useMemo(
    () =>
      decoderTokens.map((tok, i) => {
        const emb = getDecoderEmbedding(tok);
        const pos = generatePositionVector(i);
        const input = addVectors(emb, pos);
        const query = projectVector(input, WQ, Q_SHIFT);
        return { token: tok, query };
      }),
    [decoderTokens]
  );

  const encoderKeys = useMemo(
    () =>
      encoderOutputs.map((enc) => ({
        word: enc.word,
        key: projectVector(enc.vector, WK, K_SHIFT),
      })),
    [encoderOutputs]
  );

  const crossMatrix = useMemo(
    () =>
      decoderVectors.map((dec) =>
        encoderKeys.map((enc) => {
          const raw = dotProduct(dec.query, enc.key);
          return Number(normalizeScore(raw).toFixed(2));
        })
      ),
    [decoderVectors, encoderKeys]
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
        Encoder–Decoder Attention (Cross-Attention)
      </h2>

      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        The decoder consults encoder outputs to understand the original input
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
          Cross-attention is the bridge between encoder and decoder. The decoder sends Queries from its own tokens, while the encoder provides Keys and Values from its output vectors. This lets the decoder "look at" the original input while generating each output token — like a translator glancing back at the source text.
        </motion.div>
      )}

      {/* 4-step process guide */}
      <div className={`w-full max-w-[760px] mb-5 rounded-xl border p-4 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-400/70 bg-slate-50"}`}>
        <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
          How Cross-Attention Works — 4 Steps
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className={`rounded-lg border p-2.5 ${isDark ? "border-amber-400/30 bg-amber-400/5" : "border-amber-200 bg-amber-50"}`}>
            <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>① Decoder creates Query (Q)</div>
            <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Each decoder token asks: "What part of the input do I need to focus on right now?"</div>
          </div>
          <div className={`rounded-lg border p-2.5 ${isDark ? "border-pink-400/30 bg-pink-400/5" : "border-pink-200 bg-pink-50"}`}>
            <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-pink-300" : "text-pink-700"}`}>② Encoder provides Keys (K)</div>
            <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Each encoder output says: "Here is what I represent." Q·K gives a relevance score for each pair.</div>
          </div>
          <div className={`rounded-lg border p-2.5 ${isDark ? "border-cyan-400/30 bg-cyan-400/5" : "border-blue-200 bg-blue-50"}`}>
            <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-700"}`}>③ Scores become attention weights</div>
            <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>High score = this encoder token is important. Softmax normalizes all scores so they sum to 1.</div>
          </div>
          <div className={`rounded-lg border p-2.5 ${isDark ? "border-lime-400/30 bg-lime-400/5" : "border-lime-200 bg-lime-50"}`}>
            <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-lime-300" : "text-lime-700"}`}>④ Encoder Values (V) are blended</div>
            <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Weighted mix of encoder Values becomes the decoder's new context — what it "learned" from the input.</div>
          </div>
        </div>
        <div className={`rounded-lg p-2 text-center text-[10px] italic ${isDark ? "bg-slate-950/50 text-slate-400 border border-slate-800" : "bg-white text-slate-500 border border-slate-200"}`}>
          Analogy: Like a translator glancing back at the source text — the decoder "looks at" encoder output for every word it generates
        </div>
      </div>

      <div className={`w-full rounded-xl border p-5 mb-5 ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-400/70 bg-slate-50"}`}>
        <div className={`text-sm font-semibold mb-1 text-center ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
          Interactive Cross-Attention Flow
        </div>
        <div className={`text-[10px] text-center mb-4 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          Hover a decoder token (Q) to see which encoder tokens it attends to
        </div>

        <div className="flex items-start gap-4 relative">
          {/* LEFT: Decoder tokens (Q source) */}
          <div className="flex flex-col gap-2 w-[36%]">
            <div className={`text-[10px] font-semibold uppercase tracking-wide text-center mb-1 px-2 py-1 rounded-lg ${isDark ? "bg-amber-400/10 text-amber-300" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
              DECODER — sends Query (Q)
            </div>
            {decoderVectors.map((dec, i) => (
              <motion.div
                key={dec.token + i}
                onMouseEnter={() => setHoveredDecoder(i)}
                onMouseLeave={() => setHoveredDecoder(null)}
                animate={{
                  boxShadow: hoveredDecoder === i
                    ? isDark ? "0 0 18px rgba(251,191,36,0.4)" : "0 0 14px rgba(217,119,6,0.25)"
                    : "none",
                  scale: hoveredDecoder === i ? 1.03 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`rounded-lg border p-2 cursor-pointer transition-colors ${
                  hoveredDecoder === i
                    ? isDark ? "border-amber-400 bg-amber-400/10" : "border-amber-400 bg-amber-50"
                    : isDark ? "border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10" : "border-amber-200 bg-white hover:bg-amber-50"
                }`}
              >
                <div className={`text-xs font-medium ${isDark ? "text-amber-300" : "text-amber-700"}`}>{dec.token}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {dec.query.map((v, j) => (
                    <span key={j} className={`text-[9px] px-1 py-0.5 rounded ${isDark ? "text-amber-300/70 bg-amber-400/10" : "text-amber-600 bg-amber-100"}`}>
                      Q:{v.toFixed(2)}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CENTER: Connections + scores */}
          <div className="flex flex-col gap-2 w-[28%] pt-8">
            {hoveredDecoder !== null ? (
              <>
                <div className={`text-[9px] text-center mb-1 font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Attention weights from "{decoderVectors[hoveredDecoder]?.token}"
                </div>
                {encoderOutputs.map((enc, i) => {
                  const score = crossMatrix[hoveredDecoder][i];
                  const pct = Math.round(score * 100);
                  return (
                    <motion.div
                      key={`conn-${i}`}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="flex flex-col gap-0.5"
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`flex-1 h-[3px] rounded-full ${isDark ? "bg-gradient-to-r from-amber-400/80 to-green-400/80" : "bg-gradient-to-r from-amber-400/60 to-green-500/60"}`}
                          style={{ opacity: 0.3 + score * 0.7 }}
                        />
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                          className={`w-2 h-2 rounded-full shrink-0 ${isDark ? "bg-green-400" : "bg-green-500"}`}
                          style={{ filter: isDark ? `drop-shadow(0 0 4px rgba(74,222,128,${score}))` : "none", opacity: 0.4 + score * 0.6 }}
                        />
                      </div>
                      <div className={`text-center text-[9px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {pct}% on "{enc.word}"
                      </div>
                    </motion.div>
                  );
                })}
                {/* Result box */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`mt-2 rounded-lg border p-2 text-center ${isDark ? "border-lime-400/40 bg-lime-400/5" : "border-lime-300 bg-lime-50"}`}
                >
                  <div className={`text-[9px] font-semibold mb-0.5 ${isDark ? "text-lime-300" : "text-lime-700"}`}>Result (V blend)</div>
                  <div className={`text-[9px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    [{encoderOutputs.map((enc, i) => `${Math.round(crossMatrix[hoveredDecoder][i] * 100)}%·V${i + 1}`).join(" + ")}]
                  </div>
                </motion.div>
              </>
            ) : (
              <div className={`text-[10px] text-center leading-5 mt-4 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                ← Hover a decoder token to see which encoder tokens it queries
              </div>
            )}
          </div>

          {/* RIGHT: Encoder outputs (K, V source) */}
          <div className="flex flex-col gap-2 w-[36%]">
            <div className={`text-[10px] font-semibold uppercase tracking-wide text-center mb-1 px-2 py-1 rounded-lg ${isDark ? "bg-green-400/10 text-green-300" : "bg-green-50 text-green-700 border border-green-200"}`}>
              ENCODER — provides K &amp; V
            </div>
            {encoderOutputs.map((enc, i) => (
              <motion.div
                key={enc.word + i}
                animate={{
                  boxShadow: hoveredDecoder !== null
                    ? isDark
                      ? `0 0 ${Math.round(crossMatrix[hoveredDecoder][i] * 22) + 2}px rgba(74,222,128,${crossMatrix[hoveredDecoder][i] * 0.65})`
                      : `0 0 ${Math.round(crossMatrix[hoveredDecoder][i] * 16) + 2}px rgba(34,197,94,${crossMatrix[hoveredDecoder][i] * 0.4})`
                    : "none",
                  scale: hoveredDecoder !== null ? 1 + crossMatrix[hoveredDecoder][i] * 0.06 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`rounded-lg border p-2 ${isDark ? "border-green-400/40 bg-green-400/5" : "border-green-300 bg-green-50"}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-medium ${isDark ? "text-green-300" : "text-green-700"}`}>{enc.word}</div>
                  {hoveredDecoder !== null && (
                    <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${isDark ? "bg-green-400/20 text-green-300" : "bg-green-100 text-green-700"}`}>
                      {Math.round(crossMatrix[hoveredDecoder][i] * 100)}%
                    </div>
                  )}
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {enc.vector.map((v, j) => (
                    <span key={j} className={`text-[9px] px-1 py-0.5 rounded ${isDark ? "text-green-300/70 bg-green-400/10" : "text-green-600 bg-green-100"}`}>
                      {v.toFixed(2)}
                    </span>
                  ))}
                </div>
                {hoveredDecoder !== null && (
                  <div className={`mt-1.5 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                    <motion.div
                      animate={{ width: `${crossMatrix[hoveredDecoder][i] * 100}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-full bg-green-400"
                    />
                  </div>
                )}
              </motion.div>
            ))}
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
          Cross-attention score matrix
        </div>

        <div
          className={`text-[11px] leading-5 mb-3 ${
            isDark ? "text-slate-400" : "text-slate-700"
          }`}
        >
          Rows = decoder tokens (Query source). Columns = encoder tokens
          (Key/Value source). Higher scores mean stronger attention.
        </div>

        <div className="overflow-x-auto">
          <table className="text-[11px] border-collapse">
            <thead>
              <tr>
                <th
                  className={`px-2 py-1 ${
                    isDark ? "text-slate-500" : "text-slate-600"
                  }`}
                >
                  Dec \ Enc
                </th>
                {safeTokens.map((tok, i) => (
                  <th
                    key={`ecol-${i}`}
                    className={`px-2 py-1 font-medium ${
                      isDark ? "text-green-300" : "text-green-700"
                    }`}
                  >
                    {tok}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crossMatrix.map((row, rIdx) => (
                <tr key={`crow-${rIdx}`}>
                  <td
                    className={`px-2 py-1 font-medium ${
                      isDark ? "text-cyan-300" : "text-blue-800"
                    }`}
                  >
                    {decoderTokens[rIdx]}
                  </td>
                  {row.map((score, cIdx) => {
                    const intensity = score;
                    return (
                      <td key={`ccell-${rIdx}-${cIdx}`} className="px-1 py-1">
                        <motion.div
                          animate={
                            active
                              ? {
                                  boxShadow: isDark
                                    ? [
                                        `0 0 0px rgba(34,211,238,0)`,
                                        `0 0 ${Math.round(intensity * 12)}px rgba(34,211,238,${intensity * 0.3})`,
                                        `0 0 0px rgba(34,211,238,0)`,
                                      ]
                                    : "none",
                                }
                              : {}
                          }
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: rIdx * 0.08,
                          }}
                          className={`min-w-[48px] text-center rounded border px-2 py-1 ${
                            isDark
                              ? "border-slate-700"
                              : "border-slate-300"
                          }`}
                          style={{
                            backgroundColor: isDark
                              ? `rgba(34,211,238,${intensity * 0.15})`
                              : `rgba(59,130,246,${intensity * 0.12})`,
                            color: isDark ? "#e2e8f0" : "#1e293b",
                          }}
                        >
                          {score.toFixed(2)}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border p-4 mb-5 ${
          isDark
            ? "border-slate-700 bg-slate-900/70"
            : "border-slate-400/70 bg-slate-50"
        }`}
      >
        <div
          className={`text-[11px] leading-5 space-y-2 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <p>
            <span className={isDark ? "text-cyan-300 font-medium" : "text-blue-800 font-medium"}>
              Key insight:
            </span>{" "}
            Cross-attention allows the decoder to selectively focus on the most
            relevant parts of the input sentence while generating each output
            token. This is what makes translation, summarization, and other
            sequence-to-sequence tasks possible.
          </p>
        </div>
      </div>

    </motion.div>
  );
}

export default DecoderCrossAttentionStep;
