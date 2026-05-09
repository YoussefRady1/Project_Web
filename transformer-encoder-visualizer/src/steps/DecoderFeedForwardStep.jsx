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

const DECODER_FF_SHIFT = [0.55, 0.85, 0.45, 1.0];

function DecoderFeedForwardStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [showOutput, setShowOutput] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 3) : ["token"]),
    [tokens]
  );

  const extraCount = Math.max(0, tokens.length - 3);

  const decoderTokens = useMemo(
    () => ["<START>", ...safeTokens],
    [safeTokens]
  );

  const rows = useMemo(
    () =>
      decoderTokens.map((tok, i) => {
        const emb = getDecoderEmbedding(tok);
        const pos = generatePositionVector(i);
        const input = addVectors(emb, pos);
        const transformed = input.map((v, j) =>
          Number((v - DECODER_FF_SHIFT[j]).toFixed(2))
        );
        const reluOutput = transformed.map((v) =>
          Number(Math.max(0, v).toFixed(2))
        );
        return { token: tok, input, transformed, reluOutput };
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
        Feed Forward (Decoder)
      </h2>

      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        Transforms each decoder vector through a feed-forward network with ReLU
        activation
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
          The feed-forward network refines each token independently after attention. It applies a non-linear transformation (ReLU) so the decoder can learn patterns that pure attention cannot capture.
        </motion.div>
      )}

      <div
        className={`w-full max-w-[760px] mb-5 rounded-xl border p-4 ${
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
          How it works
        </h3>
        <div
          className={`text-[11px] leading-5 space-y-2 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <p>
            Each token is independently transformed through two linear layers
            with ReLU in between. Same architecture as the encoder FFN, but
            with separate weights.
          </p>
          <div className="flex gap-3 items-center flex-wrap">
            <div
              className={`rounded-lg border p-2 text-center text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-950/70 text-white"
                  : "border-slate-400/70 bg-white text-slate-900"
              }`}
            >
              FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂
            </div>
            <div
              className={`rounded-lg border p-2 text-center text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-950/70 text-white"
                  : "border-slate-400/70 bg-white text-slate-900"
              }`}
            >
              ReLU(x) = max(0, x)
            </div>
          </div>
          <p>
            Demo shift values:{" "}
            {DECODER_FF_SHIFT.map((v, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 text-xs border rounded mr-1 ${
                  isDark
                    ? "border-red-400 text-red-300"
                    : "border-red-400 text-red-700 bg-red-100"
                }`}
              >
                −{v.toFixed(2)}
              </span>
            ))}
          </p>
          <p>
            <span className={isDark ? "text-red-300" : "text-red-700"}>
              Red
            </span>{" "}
            = negative (before ReLU).{" "}
            <span className={isDark ? "text-blue-300" : "text-blue-700"}>
              Blue
            </span>{" "}
            = zeroed (after ReLU).
          </p>
        </div>
      </div>

      <div className="w-full flex items-center justify-center gap-3 mb-5">
        <button
          onClick={() => setShowOutput(false)}
          className={`px-4 py-1.5 text-xs rounded-lg border transition ${
            !showOutput
              ? isDark
                ? "border-cyan-400 text-cyan-300 bg-cyan-400/10"
                : "border-blue-400 text-blue-800 bg-blue-100"
              : isDark
              ? "border-slate-600 text-slate-300 hover:bg-slate-800"
              : "border-slate-300 text-slate-700 hover:bg-slate-100 bg-white"
          }`}
        >
          Show Feed Forward Input
        </button>
        <button
          onClick={() => setShowOutput(true)}
          className={`px-4 py-1.5 text-xs rounded-lg border transition ${
            showOutput
              ? isDark
                ? "border-green-400 text-green-300 bg-green-400/10"
                : "border-green-500 text-green-700 bg-green-100"
              : isDark
              ? "border-slate-600 text-slate-300 hover:bg-slate-800"
              : "border-slate-300 text-slate-700 hover:bg-slate-100 bg-white"
          }`}
        >
          Show ReLU Output
        </button>
      </div>

      <div className="w-full space-y-4 mb-5">
        {rows.map((row, rIdx) => (
          <motion.div
            key={row.token + rIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: active ? 1 : 0.3, y: 0 }}
            transition={{ delay: rIdx * 0.08 }}
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-900/70"
                : "border-slate-400/70 bg-white"
            }`}
          >
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div
                className={`text-sm font-medium min-w-[70px] ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                {row.token}
              </div>
              <div
                className={`text-[10px] ${
                  isDark ? "text-slate-500" : "text-slate-600"
                }`}
              >
                Input vector
              </div>
              <div className="flex gap-1 flex-wrap">
                {row.input.map((v, i) => (
                  <span
                    key={`inp-${rIdx}-${i}`}
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

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1 flex-wrap">
                {(showOutput ? row.reluOutput : row.transformed).map((v, i) => {
                  const origVal = row.transformed[i];
                  const isNeg = origVal < 0;
                  const isZeroAfter = showOutput && origVal < 0;

                  return (
                    <motion.span
                      key={`val-${rIdx}-${i}`}
                      animate={{
                        opacity: active ? 1 : 0.3,
                        scale:
                          active && isNeg ? [1, 1.08, 1] : 1,
                      }}
                      transition={{
                        duration: 0.9,
                        repeat: active && isNeg ? Infinity : 0,
                        delay: i * 0.05,
                      }}
                      className={`px-3 py-1 text-xs rounded border ${
                        showOutput
                          ? isZeroAfter
                            ? isDark
                              ? "border-blue-400 text-blue-300"
                              : "border-blue-400 text-blue-700 bg-blue-100"
                            : isDark
                            ? "border-green-400 text-green-300"
                            : "border-green-400 text-green-700 bg-green-100"
                          : isNeg
                          ? isDark
                            ? "border-red-400 text-red-300"
                            : "border-red-400 text-red-700 bg-red-100"
                          : isDark
                          ? "border-cyan-400 text-cyan-300"
                          : "border-blue-400 text-blue-800 bg-blue-100"
                      }`}
                    >
                      {v.toFixed(2)}
                    </motion.span>
                  );
                })}
              </div>

              <motion.div
                animate={{ rotate: showOutput ? 180 : 0, opacity: active ? 1 : 0.3 }}
                transition={{ duration: 0.35 }}
                className={`text-lg ${isDark ? "text-cyan-400" : "text-blue-600"}`}
              >
                {showOutput ? "←" : "→"}
              </motion.div>

              <div
                className={`text-[11px] ${
                  isDark ? "text-slate-400" : "text-slate-700"
                }`}
              >
                {showOutput
                  ? "After ReLU: negatives become 0"
                  : "Before ReLU: after feed-forward shift"}
              </div>
            </div>
          </motion.div>
        ))}
        {extraCount > 0 && (
          <div
            className={`text-center text-xs py-2 ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            ...and {extraCount} more token{extraCount > 1 ? "s" : ""} processed
            the same way
          </div>
        )}
      </div>

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>The feed-forward network adds non-linearity via ReLU, enabling the model to learn complex patterns. It processes each token independently (unlike attention, which mixes tokens). Same architecture as the encoder's FFN, but with separate learned weights.</p>
      </div>
    </motion.div>
  );
}

export default DecoderFeedForwardStep;
