import { motion } from "framer-motion";
import { useMemo, useState } from "react";

// Same stable embedding rule used in the other steps
function generateEmbeddingVector(word) {
  const cleanWord = (word || "").toLowerCase();

  if (!cleanWord) return [0, 0, 0, 0];

  const chars = cleanWord.split("");
  const codes = chars.map((char) => char.charCodeAt(0));

  const sum = codes.reduce((acc, code) => acc + code, 0);
  const first = codes[0] || 0;
  const last = codes[codes.length - 1] || 0;
  const length = cleanWord.length;

  const vowelCount = chars.filter((char) =>
    ["a", "e", "i", "o", "u"].includes(char)
  ).length;

  return [
    Number(((sum % 100) / 100).toFixed(2)),
    Number((((first * length) % 100) / 100).toFixed(2)),
    Number((((last + vowelCount * 7) % 100) / 100).toFixed(2)),
    Number(((((sum + first + last + length) * 3) % 100) / 100).toFixed(2)),
  ];
}

// Same positional rule used in Positional step
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
  return a.map((value, index) => Number((value + b[index]).toFixed(2)));
}

// Fixed demo "bias" subtraction to simulate how a feed-forward layer
// can push some dimensions below zero after transformation.
// This is NOT random. It is a stable teaching rule.
const FEED_FORWARD_SHIFT = [0.65, 0.95, 0.55, 1.1];

function generateFeedForwardInput(word, index) {
  const embedding = generateEmbeddingVector(word);
  const position = generatePositionVector(index);
  const encoderLikeInput = addVectors(embedding, position);

  const transformed = encoderLikeInput.map((value, i) =>
    Number((value - FEED_FORWARD_SHIFT[i]).toFixed(2))
  );

  const reluOutput = transformed.map((v) =>
    Number(Math.max(0, v).toFixed(2))
  );

  return {
    embedding,
    position,
    encoderLikeInput,
    transformed,
    reluOutput,
  };
}

function FeedForwardStep({ active, tokens = [], theme }) {
  const [showOutput, setShowOutput] = useState(false);
  const isDark = theme === "dark";

  const safeTokens = tokens.length ? tokens.slice(0, 10) : ["token"];

  const rows = useMemo(() => {
    return safeTokens.map((word, index) => ({
      word,
      ...generateFeedForwardInput(word, index),
    }));
  }, [safeTokens]);

  const sample = rows[0];

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[980px] min-h-[760px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-300 bg-white"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        Feed Forward (ReLU)
      </h2>

      <p
        className={`text-xs text-center mb-2 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        The feed forward layer transforms each word vector, then ReLU turns negative values into 0
      </p>
<div
  className={`w-full max-w-[760px] mb-5 rounded-xl border p-3 ${
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
    className={`text-[11px] leading-5 ${
      isDark ? "text-slate-300" : "text-slate-700"
    }`}
  >
    We use the feed forward layer to further refine each word representation after attention. It helps the model transform the attended information into a stronger and more useful internal representation.
  </p>
</div>
      <div className="w-full flex flex-col gap-6 items-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-900/80"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <h3
              className={`text-sm font-semibold mb-2 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              Where do the negative values come from?
            </h3>

            <div
              className={`text-[11px] leading-5 space-y-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <p>
                They do <span className={isDark ? "text-white" : "text-slate-900"}>not</span> come randomly.
              </p>

              <p>
                First, the word gets a stable input vector from:
                <br />
                <span className={isDark ? "text-cyan-300" : "text-blue-800"}>
                  embedding + positional encoding
                </span>
              </p>

              <p>
                Then the feed forward layer changes that input.
                In a real Transformer, this happens using learned weights and biases.
              </p>

              <p>
                In this demo, we simulate that with a fixed subtraction rule:
              </p>

              <div
                className={`rounded-lg border p-3 text-center text-sm ${
                  isDark
                    ? "border-slate-700 bg-slate-950/70 text-white"
                    : "border-slate-300 bg-white text-slate-900"
                }`}
              >
                new value = input value − fixed shift
              </div>

              <div className="flex gap-1 flex-wrap">
                {FEED_FORWARD_SHIFT.map((v, i) => (
                  <span
                    key={`shift-${i}`}
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

              <p>
                If the shifted result goes below 0, that dimension becomes negative.
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-900/80"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <h3
              className={`text-sm font-semibold mb-2 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              Why do we subtract a number here?
            </h3>

            <div
              className={`text-[11px] leading-5 space-y-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <p>
                We subtract fixed values only to make the feed forward effect easy to see.
              </p>

              <p>
                This gives a stable demo:
                the same word always produces the same values,
                and some dimensions clearly cross below zero.
              </p>

              <p>
                So subtraction here is a simple teaching version of what learned weights and biases
                do inside a real neural network.
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-900/80"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <h3
              className={`text-sm font-semibold mb-2 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              What is ReLU?
            </h3>

            <div
              className={`text-[11px] leading-5 space-y-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <p>
                ReLU means <span className={isDark ? "text-white" : "text-slate-900"}>Rectified Linear Unit</span>.
              </p>

              <div
                className={`rounded-lg border p-3 text-center text-sm ${
                  isDark
                    ? "border-slate-700 bg-slate-950/70 text-white"
                    : "border-slate-300 bg-white text-slate-900"
                }`}
              >
                ReLU(x) = max(0, x)
              </div>

              <p>
                So:
                <br />
                positive value → stays the same
                <br />
                negative value → becomes 0
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-900/80"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <h3
              className={`text-sm font-semibold mb-2 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              Why do we use ReLU?
            </h3>

            <div
              className={`text-[11px] leading-5 space-y-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <p>
                ReLU removes negative activations and keeps positive ones.
              </p>

              <p>
                This helps the network focus on useful positive signals
                and adds non-linearity, which makes neural networks more powerful.
              </p>

              <p>
                In this demo:
                <br />
                <span className={isDark ? "text-red-300" : "text-red-700"}>red values</span> are negative before ReLU
                <br />
                <span className={isDark ? "text-blue-300" : "text-blue-700"}>blue values</span> are zeros after ReLU
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-3 ${
              isDark
                ? "border-slate-700 bg-slate-900/80"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <div
              className={`text-sm font-semibold mb-2 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              Mini video
            </div>

            <div className={`aspect-video rounded-lg overflow-hidden border ${
              isDark ? "border-slate-700" : "border-slate-300"
            }`}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/6MmGNZsA5nI"
                title="ReLU activation function video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <p
              className={`text-[10px] mt-2 leading-4 ${
                isDark ? "text-slate-500" : "text-slate-600"
              }`}
            >
              Short side video about the ReLU activation function.
            </p>
          </div>

          {sample && (
            <div
              className={`rounded-xl border p-4 ${
                isDark
                  ? "border-slate-700 bg-slate-900/80"
                  : "border-slate-300 bg-slate-50"
              }`}
            >
              <h3
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Example with: {sample.word}
              </h3>

              <div
                className={`text-[11px] leading-5 space-y-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <p>Input vector:</p>

                <div className="flex gap-1 flex-wrap">
                  {sample.encoderLikeInput.map((v, i) => (
                    <span
                      key={`sample-input-${i}`}
                      className={`px-2 py-1 text-xs border rounded ${
                        isDark
                          ? "border-cyan-400 text-cyan-300"
                          : "border-blue-300 text-blue-800 bg-blue-100"
                      }`}
                    >
                      {v.toFixed(2)}
                    </span>
                  ))}
                </div>

                <p>After feed forward shift:</p>

                <div className="flex gap-1 flex-wrap">
                  {sample.transformed.map((v, i) => (
                    <span
                      key={`sample-transformed-${i}`}
                      className={`px-2 py-1 text-xs rounded border ${
                        v < 0
                          ? isDark
                            ? "border-red-400 text-red-300"
                            : "border-red-400 text-red-700 bg-red-100"
                          : isDark
                          ? "border-cyan-400 text-cyan-300"
                          : "border-blue-300 text-blue-800 bg-blue-100"
                      }`}
                    >
                      {v.toFixed(2)}
                    </span>
                  ))}
                </div>

                <p>After ReLU:</p>

                <div className="flex gap-1 flex-wrap">
                  {sample.reluOutput.map((v, i) => (
                    <span
                      key={`sample-relu-${i}`}
                      className={`px-2 py-1 text-xs rounded border ${
                        v === 0
                          ? isDark
                            ? "border-blue-400 text-blue-300"
                            : "border-blue-400 text-blue-700 bg-blue-100"
                          : isDark
                          ? "border-green-400 text-green-300"
                          : "border-green-400 text-green-700 bg-green-100"
                      }`}
                    >
                      {v.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <p
          className={`text-[11px] text-center max-w-[780px] leading-5 ${
            isDark ? "text-slate-500" : "text-slate-600"
          }`}
        >
          The input here is built from the same stable rules used earlier:
          word embedding + positional vector. Then a fixed feed-forward demo rule changes the values.
          Some dimensions become negative, and ReLU keeps only the positive ones.
        </p>

        <div className="w-full flex items-center justify-center gap-3">
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

        <div className="w-full space-y-4">
          {rows.map((row, rowIndex) => (
            <motion.div
              key={row.word + rowIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: active ? 1 : 0.3,
                y: active ? 0 : 10,
              }}
              transition={{ delay: rowIndex * 0.08, duration: 0.25 }}
              className={`rounded-xl border p-4 ${
                isDark
                  ? "border-slate-700 bg-slate-900/70"
                  : "border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div
                  className={`text-sm font-medium min-w-[70px] ${
                    isDark ? "text-cyan-300" : "text-blue-800"
                  }`}
                >
                  {row.word}
                </div>

                <div
                  className={`text-[10px] ${
                    isDark ? "text-slate-500" : "text-slate-600"
                  }`}
                >
                  Input = Embedding + Position
                </div>

                <div className="flex gap-1 flex-wrap">
                  {row.encoderLikeInput.map((v, i) => (
                    <span
                      key={`enc-${rowIndex}-${i}`}
                      className={`px-2 py-1 text-xs border rounded ${
                        isDark
                          ? "border-cyan-400 text-cyan-300"
                          : "border-blue-300 text-blue-800 bg-blue-100"
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
                    const originalValue = row.transformed[i];
                    const isNegativeOriginal = originalValue < 0;
                    const isZeroAfterRelu = showOutput && originalValue < 0;

                    return (
                      <motion.span
                        key={`vec-${rowIndex}-${i}`}
                        animate={{
                          opacity: active ? 1 : 0.3,
                          scale:
                            active && isNegativeOriginal
                              ? [1, 1.08, 1]
                              : 1,
                        }}
                        transition={{
                          duration: 0.9,
                          repeat: active && isNegativeOriginal ? Infinity : 0,
                          delay: i * 0.05,
                        }}
                        className={`px-3 py-1 text-xs rounded border ${
                          showOutput
                            ? isZeroAfterRelu
                              ? isDark
                                ? "border-blue-400 text-blue-300"
                                : "border-blue-400 text-blue-700 bg-blue-100"
                              : isDark
                              ? "border-green-400 text-green-300"
                              : "border-green-400 text-green-700 bg-green-100"
                            : isNegativeOriginal
                            ? isDark
                              ? "border-red-400 text-red-300"
                              : "border-red-400 text-red-700 bg-red-100"
                            : isDark
                            ? "border-cyan-400 text-cyan-300"
                            : "border-blue-300 text-blue-800 bg-blue-100"
                        }`}
                      >
                        {v.toFixed(2)}
                      </motion.span>
                    );
                  })}
                </div>

                <motion.div
                  animate={{
                    rotate: showOutput ? 180 : 0,
                    opacity: active ? 1 : 0.3,
                  }}
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
                    ? "After ReLU: every negative value becomes 0"
                    : "Before ReLU: feed forward transformation can create negative values"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default FeedForwardStep;