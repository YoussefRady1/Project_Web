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

function FeedForwardStep({ active, tokens = [] }) {
  const [showOutput, setShowOutput] = useState(false);

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
      className="p-6 border border-cyan-500 rounded-2xl w-[980px] min-h-[420px] flex flex-col items-center"
    >
      <h2 className="text-cyan-300 font-semibold text-center">
        Feed Forward (ReLU)
      </h2>

      <p className="text-xs text-slate-400 text-center mb-2">
        The feed forward layer transforms each word vector, then ReLU turns negative values into 0
      </p>

      <p className="text-[11px] text-slate-500 text-center mb-4 max-w-[780px] leading-5">
        The input here is built from the same stable rules used earlier:
        word embedding + positional vector. Then a fixed feed-forward demo rule changes the values.
        Some dimensions become negative, and ReLU keeps only the positive ones.
      </p>

      <div className="flex w-full gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setShowOutput(false)}
              className={`px-4 py-1.5 text-xs rounded-lg border transition ${
                !showOutput
                  ? "border-cyan-400 text-cyan-300 bg-cyan-400/10"
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Show Feed Forward Input
            </button>

            <button
              onClick={() => setShowOutput(true)}
              className={`px-4 py-1.5 text-xs rounded-lg border transition ${
                showOutput
                  ? "border-green-400 text-green-300 bg-green-400/10"
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Show ReLU Output
            </button>
          </div>

          <div className="space-y-4">
            {rows.map((row, rowIndex) => (
              <motion.div
                key={row.word + rowIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: active ? 1 : 0.3,
                  y: active ? 0 : 10,
                }}
                transition={{ delay: rowIndex * 0.08, duration: 0.25 }}
                className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
              >
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="text-cyan-300 text-sm font-medium min-w-[70px]">
                    {row.word}
                  </div>

                  <div className="text-[10px] text-slate-500">
                    Input = Embedding + Position
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {row.encoderLikeInput.map((v, i) => (
                      <span
                        key={`enc-${rowIndex}-${i}`}
                        className="px-2 py-1 text-xs border border-cyan-400 text-cyan-300 rounded"
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
                                ? "border-blue-400 text-blue-300"
                                : "border-green-400 text-green-300"
                              : isNegativeOriginal
                              ? "border-red-400 text-red-300"
                              : "border-cyan-400 text-cyan-300"
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
                    className="text-cyan-400 text-lg"
                  >
                    {showOutput ? "←" : "→"}
                  </motion.div>

                  <div className="text-[11px] text-slate-400">
                    {showOutput
                      ? "After ReLU: every negative value becomes 0"
                      : "Before ReLU: feed forward transformation can create negative values"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-[320px] flex flex-col gap-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
            <h3 className="text-cyan-300 text-sm font-semibold mb-2">
              Where do the negative values come from?
            </h3>

            <div className="text-[11px] text-slate-300 leading-5 space-y-2">
              <p>
                They do <span className="text-white">not</span> come randomly.
              </p>

              <p>
                First, the word gets a stable input vector from:
                <br />
                <span className="text-cyan-300">embedding + positional encoding</span>
              </p>

              <p>
                Then the feed forward layer changes that input.
                In a real Transformer, this happens using learned weights and biases.
              </p>

              <p>
                In this demo, we simulate that with a fixed subtraction rule:
              </p>

              <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-center text-white text-sm">
                new value = input value − fixed shift
              </div>

              <div className="flex gap-1 flex-wrap">
                {FEED_FORWARD_SHIFT.map((v, i) => (
                  <span
                    key={`shift-${i}`}
                    className="px-2 py-1 text-xs border border-red-400 text-red-300 rounded"
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

          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
            <h3 className="text-cyan-300 text-sm font-semibold mb-2">
              Why do we subtract a number here?
            </h3>

            <div className="text-[11px] text-slate-300 leading-5 space-y-2">
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

          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
            <h3 className="text-cyan-300 text-sm font-semibold mb-2">
              What is ReLU?
            </h3>

            <div className="text-[11px] text-slate-300 leading-5 space-y-2">
              <p>
                ReLU means <span className="text-white">Rectified Linear Unit</span>.
              </p>

              <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-center text-white text-sm">
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

          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
            <h3 className="text-cyan-300 text-sm font-semibold mb-2">
              Why do we use ReLU?
            </h3>

            <div className="text-[11px] text-slate-300 leading-5 space-y-2">
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
                <span className="text-red-300">red values</span> are negative before ReLU
                <br />
                <span className="text-blue-300">blue values</span> are zeros after ReLU
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
            <div className="text-cyan-300 text-sm font-semibold mb-2">
              Mini video
            </div>

            <div className="aspect-video rounded-lg overflow-hidden border border-slate-700">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/6MmGNZsA5nI"
                title="ReLU activation function video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <p className="text-[10px] text-slate-500 mt-2 leading-4">
              Short side video about the ReLU activation function.
            </p>
          </div>

          {sample && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
              <h3 className="text-cyan-300 text-sm font-semibold mb-2">
                Example with: {sample.word}
              </h3>

              <div className="text-[11px] text-slate-300 leading-5 space-y-2">
                <p>Input vector:</p>

                <div className="flex gap-1 flex-wrap">
                  {sample.encoderLikeInput.map((v, i) => (
                    <span
                      key={`sample-input-${i}`}
                      className="px-2 py-1 text-xs border border-cyan-400 text-cyan-300 rounded"
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
                          ? "border-red-400 text-red-300"
                          : "border-cyan-400 text-cyan-300"
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
                          ? "border-blue-400 text-blue-300"
                          : "border-green-400 text-green-300"
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
      </div>
    </motion.div>
  );
}

export default FeedForwardStep;