import { motion } from "framer-motion";
import { useMemo } from "react";
// same stable embedding rule used in previous steps
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

function generateEncoderOutputVector(word, index, tokenCount) {
  const embedding = generateEmbeddingVector(word);
  const position = generatePositionVector(index);
  const encoderInput = addVectors(embedding, position);

  // stable demo "context refinement" rule
  const contextBoost = [
    Number((((index + 1) * 0.08) % 1).toFixed(2)),
    Number((((tokenCount - index) * 0.05) % 1).toFixed(2)),
    Number((((word.length % 5) * 0.07) % 1).toFixed(2)),
    Number(((((index + 1) + word.length) * 0.04) % 1).toFixed(2)),
  ];

  const output = encoderInput.map((value, i) =>
    Number((value + contextBoost[i]).toFixed(2))
  );

  return {
    encoderInput,
    contextBoost,
    output,
  };
}

function EncoderOutputStep({ active, tokens = [] }) {
  const safeTokens = tokens.length ? tokens.slice(0, 10) : ["token"];

  const rows = useMemo(() => {
    return safeTokens.map((word, index) => ({
      word,
      ...generateEncoderOutputVector(word, index, safeTokens.length),
    }));
  }, [safeTokens]);

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className="p-6 border border-cyan-500 rounded-2xl w-[980px] min-h-[620px] flex flex-col items-center"
    >
      <h2 className="text-cyan-300 font-semibold text-center">
        Encoder Output
      </h2>

      <p className="text-xs text-slate-400 text-center mb-2">
        Final contextual word representations produced by the encoder stack
      </p>

      <p className="text-[11px] text-slate-500 text-center mb-5 max-w-[780px] leading-5">
        After passing through the encoder stack, each word now has an output
        vector that contains richer contextual information. These output vectors
        are the final result of the encoder.
      </p>

      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
          <h3 className="text-cyan-300 text-sm font-semibold mb-2">
            What does encoder output mean?
          </h3>

          <div className="text-[11px] text-slate-300 leading-5 space-y-2">
            <p>
              At the beginning, each word only had its own embedding and
              position information.
            </p>

            <p>
  After going through the encoder stack, each word representation is
  more context-aware.
</p>

<p>
  This happens through context refinement, where the encoder adjusts each
  word vector after comparing it with other words in the sentence.
  This helps every word carry richer meaning based on surrounding words.
</p>

            <p>
              That means a word vector now carries information not only about
              itself, but also about the surrounding words in the sentence.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
          <h3 className="text-cyan-300 text-sm font-semibold mb-2">
            Final encoder result
          </h3>

          <div className="text-[11px] text-slate-300 leading-5 space-y-2">
            <p>
              The encoder outputs one final vector for each input word.
            </p>

            <p>
              These vectors are then ready to be used by later Transformer
              components, or simply shown here as the final encoder result in
              this educational visualization.
            </p>
          </div>
        </div>
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
            className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
          >
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="text-cyan-300 text-sm font-medium min-w-[90px]">
                {row.word}
              </div>

              <div className="text-[10px] text-slate-500">
                Final encoder output vector
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-2">
              <div className="text-[11px] text-slate-400 min-w-[130px]">
                Encoder input:
              </div>

              <div className="flex gap-1 flex-wrap">
                {row.encoderInput.map((v, i) => (
                  <span
                    key={`input-${rowIndex}-${i}`}
                    className="px-2 py-1 text-xs border border-cyan-400 text-cyan-300 rounded"
                  >
                    {v.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-2">
              <div className="text-[11px] text-slate-400 min-w-[130px]">
                Context refinement:
              </div>

              <div className="flex gap-1 flex-wrap">
                {row.contextBoost.map((v, i) => (
                  <span
                    key={`boost-${rowIndex}-${i}`}
                    className="px-2 py-1 text-xs border border-purple-400 text-purple-300 rounded"
                  >
                    +{v.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-[11px] text-slate-400 min-w-[130px]">
                Final output:
              </div>

              <div className="flex gap-1 flex-wrap">
                {row.output.map((v, i) => (
                  <motion.span
                    key={`out-${rowIndex}-${i}`}
                    animate={{
                      opacity: active ? 1 : 0.3,
                      y: active ? [0, -2, 0] : 0,
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.06,
                    }}
                    className="px-3 py-1 text-xs rounded border border-green-400 text-green-300"
                  >
                    {v.toFixed(2)}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default EncoderOutputStep;