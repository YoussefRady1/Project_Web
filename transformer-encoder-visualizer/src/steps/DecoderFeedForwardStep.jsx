import { motion, AnimatePresence } from "framer-motion";
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

function normalizeVector(vec) {
  const mean = vec.reduce((a, v) => a + v, 0) / vec.length;
  const variance =
    vec.reduce((a, v) => a + (v - mean) ** 2, 0) / vec.length;
  const std = Math.sqrt(variance + 0.001);
  return vec.map((v) => Number(((v - mean) / std).toFixed(2)));
}

const ADD_NORM_SHIFT = [0.06, -0.11, 0.09, -0.02];

function DecoderFeedForwardStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [showOutput, setShowOutput] = useState(false);
  const [showAddNorm, setShowAddNorm] = useState(false);

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

  const addNormRows = useMemo(
    () =>
      decoderTokens.map((tok, i) => {
        const emb = getDecoderEmbedding(tok);
        const pos = generatePositionVector(i);
        const input = addVectors(emb, pos);
        const sublayerOutput = input.map((v, j) =>
          Number((v + ADD_NORM_SHIFT[j]).toFixed(2))
        );
        const residual = addVectors(input, sublayerOutput);
        const normalized = normalizeVector(residual);
        return { token: tok, input, sublayerOutput, residual, normalized };
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
          The feed-forward network refines each token's representation after
          attention. It applies a non-linear transformation (ReLU) that helps the
          decoder build stronger internal features before making predictions.
        </p>
        <p className={`text-[10px] italic mt-2 pt-2 ${isDark ? "border-t border-slate-700/50 text-cyan-300/70" : "border-t border-slate-300/50 text-blue-600/80"}`}>
          Like a refinement filter — each token's representation is independently polished to capture more nuanced patterns that attention alone cannot express.
        </p>
      </div>

      {/* Data flow */}
      <div className="w-full max-w-[760px] mb-5 grid grid-cols-3 gap-2">
        <div className={`rounded-xl border p-3 ${isDark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-400 bg-emerald-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>From previous step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{"Vectors from Cross-Attention → Add & Normalize. Each vector now carries: word meaning (embedding) + position (positional) + decoder context (masked attention) + input understanding (cross-attention)."}</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-cyan-500/30 bg-cyan-500/5" : "border-blue-400 bg-blue-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-700"}`}>What happens here</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{"Two linear transformations with ReLU activation between them: FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂. The non-linearity lets the model learn complex patterns that pure attention cannot capture."}</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-400 bg-amber-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Goes to next step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Transformed vectors go through the final Add &amp; Normalize of this decoder layer, then to Linear + Softmax for the word prediction.</p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
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
            Feed-forward transformation
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              Each token vector is independently transformed through two linear
              layers with ReLU in between.
            </p>
            <div
              className={`rounded-lg border p-3 text-center text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-950/70 text-white"
                  : "border-slate-400/70 bg-white text-slate-900"
              }`}
            >
              FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂
            </div>
            <p>
              In this demo, we simulate the first layer with a fixed shift
              subtraction:
            </p>
            <div className="flex gap-1 flex-wrap">
              {DECODER_FF_SHIFT.map((v, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 text-xs border rounded ${
                    isDark
                      ? "border-red-400 text-red-300"
                      : "border-red-400 text-red-700 bg-red-100"
                  }`}
                >
                  −{v.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        </div>

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
            ReLU activation
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <div
              className={`rounded-lg border p-3 text-center text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-950/70 text-white"
                  : "border-slate-400/70 bg-white text-slate-900"
              }`}
            >
              ReLU(x) = max(0, x)
            </div>
            <p>
              Positive values pass through unchanged. Negative values become
              zero.
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
            Same as encoder feed-forward
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              The decoder's feed-forward network has the{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                same structure
              </span>{" "}
              as the encoder's, but with{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                separate weights
              </span>
              .
            </p>
            <p>
              Both process each token independently through linear → ReLU →
              linear.
            </p>
          </div>
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
      </div>

      <button
        onClick={() => setShowAddNorm(!showAddNorm)}
        className={`px-5 py-2 rounded-lg border text-sm font-medium transition mb-4 ${
          showAddNorm
            ? isDark
              ? "border-green-400 text-green-300 bg-green-400/10 hover:bg-green-400/20"
              : "border-green-500 text-green-700 bg-green-100 hover:bg-green-200"
            : isDark
            ? "border-amber-400 text-amber-300 bg-amber-400/10 hover:bg-amber-400/20"
            : "border-amber-500 text-amber-700 bg-amber-100 hover:bg-amber-200"
        }`}
      >
        {showAddNorm ? "Hide Add & Normalize ▲" : "Show Add & Normalize ▼"}
      </button>

      <AnimatePresence>
        {showAddNorm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full overflow-hidden"
          >
            <div
              className={`w-full rounded-xl border p-5 mb-4 ${
                isDark
                  ? "border-green-400/30 bg-green-400/5"
                  : "border-green-300 bg-green-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3
                  className={`text-sm font-semibold ${
                    isDark ? "text-green-300" : "text-green-700"
                  }`}
                >
                  Add &amp; Norm after Feed Forward
                </h3>
                <span
                  className={`text-[10px] italic ${
                    isDark ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  input + FFN(input) → normalize
                </span>
              </div>

              <div className="w-full space-y-3">
                {addNormRows.map((row, rIdx) => (
                  <motion.div
                    key={row.token + rIdx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: active ? 1 : 0.3, y: 0 }}
                    transition={{ delay: rIdx * 0.08 }}
                    className={`rounded-lg border p-3 ${
                      isDark
                        ? "border-slate-700 bg-slate-900/70"
                        : "border-slate-400/70 bg-white"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-2 ${
                        isDark ? "text-cyan-300" : "text-blue-800"
                      }`}
                    >
                      {row.token}
                    </div>

                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] min-w-[70px] ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Input:
                      </span>
                      {row.input.map((v, i) => (
                        <span
                          key={`in-${rIdx}-${i}`}
                          className={`px-2 py-0.5 text-[11px] rounded border ${
                            isDark
                              ? "border-cyan-400 text-cyan-300"
                              : "border-blue-400 text-blue-800 bg-blue-100"
                          }`}
                        >
                          {v.toFixed(2)}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] min-w-[70px] ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Sub-layer:
                      </span>
                      {row.sublayerOutput.map((v, i) => (
                        <span
                          key={`sub-${rIdx}-${i}`}
                          className={`px-2 py-0.5 text-[11px] rounded border ${
                            isDark
                              ? "border-purple-400 text-purple-300"
                              : "border-violet-300 text-violet-700 bg-violet-100"
                          }`}
                        >
                          {v.toFixed(2)}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] min-w-[70px] ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Residual:
                      </span>
                      <motion.span
                        animate={
                          active
                            ? { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
                            : {}
                        }
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className={isDark ? "text-cyan-400 text-xs" : "text-blue-600 text-xs"}
                      >
                        +
                      </motion.span>
                      {row.residual.map((v, i) => (
                        <span
                          key={`res-${rIdx}-${i}`}
                          className={`px-2 py-0.5 text-[11px] rounded border ${
                            isDark
                              ? "border-amber-400 text-amber-300"
                              : "border-amber-300 text-amber-700 bg-amber-100"
                          }`}
                        >
                          {v.toFixed(2)}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] min-w-[70px] ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Normalized:
                      </span>
                      {row.normalized.map((v, i) => (
                        <motion.span
                          key={`norm-${rIdx}-${i}`}
                          animate={
                            active
                              ? {
                                  y: [0, -2, 0],
                                  boxShadow: isDark
                                    ? [
                                        "0 0 0px rgba(74,222,128,0)",
                                        "0 0 12px rgba(74,222,128,0.35)",
                                        "0 0 0px rgba(74,222,128,0)",
                                      ]
                                    : "none",
                                }
                              : {}
                          }
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                          className={`px-2 py-0.5 text-[11px] rounded border ${
                            isDark
                              ? "border-green-400 text-green-300"
                              : "border-green-400 text-green-700 bg-green-100"
                          }`}
                        >
                          {v.toFixed(2)}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>The feed-forward network adds non-linearity via ReLU, enabling the model to learn complex patterns. It processes each token independently (unlike attention, which mixes tokens). Same architecture as the encoder's FFN, but with separate learned weights.</p>
      </div>
    </motion.div>
  );
}

export default DecoderFeedForwardStep;
