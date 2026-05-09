import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";

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

function DecoderTransitionStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [showExplanation, setShowExplanation] = useState(false);
  const [phase, setPhase] = useState(0);

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 8) : ["token"]),
    [tokens]
  );

  const rows = useMemo(
    () =>
      safeTokens.map((word, i) => ({
        word,
        output: generateEncoderOutputVector(word, i, safeTokens.length),
      })),
    [safeTokens]
  );

  const startTransfer = useCallback(() => {
    setPhase(1);
    setTimeout(() => setPhase(2), 1200);
    setTimeout(() => setPhase(3), 3400);
  }, []);

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
        Encoder → Decoder Transfer
      </h2>

      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        Passing contextual memory from the encoder to the decoder
      </p>

      <button
        onClick={() => setShowExplanation((v) => !v)}
        className={`mb-4 text-[11px] font-medium underline underline-offset-2 ${
          isDark ? "text-cyan-300 hover:text-cyan-200" : "text-blue-700 hover:text-blue-800"
        }`}
      >
        {showExplanation ? "Hide explanation" : "Show explanation"}
      </button>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-[700px] mb-5 rounded-xl border p-3 text-[11px] leading-5 ${
            isDark ? "border-slate-700 bg-slate-900/70 text-slate-300" : "border-slate-300 bg-slate-50 text-slate-700"
          }`}
        >
          <p className="mb-2">
            The encoder has finished understanding the input sentence. Now it sends its contextual output vectors to the decoder, so the decoder can use this understanding while generating the output sequence.
          </p>
          <p>
            The decoder will use these vectors as Keys (K) and Values (V) in Cross-Attention, allowing it to reference the input while generating output.
          </p>
        </motion.div>
      )}

      {phase === 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={startTransfer}
          className={`mb-6 px-6 py-3 rounded-xl border text-sm font-semibold transition ${
            isDark
              ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
          }`}
        >
          ▶ Transfer Context to Decoder
        </motion.button>
      )}

      <div className="w-full relative">
        <AnimatePresence mode="wait">
          {phase <= 2 && phase > 0 ? null : phase === 0 ? (
            <motion.div
              key="initial-vectors"
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div
                className={`text-xs mb-3 text-center ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Encoder Output Vectors
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {rows.map((row, i) => (
                  <div
                    key={row.word + i}
                    className={`px-3 py-2 rounded-lg border ${
                      isDark
                        ? "border-green-400/60 bg-slate-900/80"
                        : "border-green-400 bg-white"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium mb-1 ${
                        isDark ? "text-cyan-300" : "text-blue-800"
                      }`}
                    >
                      {row.word}
                    </div>
                    <div className="flex gap-1">
                      {row.output.map((v, j) => (
                        <span
                          key={j}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isDark
                              ? "text-green-300 bg-green-400/10"
                              : "text-green-700 bg-green-100"
                          }`}
                        >
                          {v.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {(phase === 1 || phase === 2) && (
          <div className="w-full">
            <div
              className={`text-xs mb-3 text-center ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Encoder Output Vectors
            </div>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {rows.map((row, i) => (
                <motion.div
                  key={row.word + i}
                  animate={{
                    scale: phase >= 1 ? 0.82 : 1,
                    opacity: phase >= 2 ? 0 : 1,
                    x: phase >= 2 ? 300 : 0,
                    boxShadow:
                      phase >= 1
                        ? isDark
                          ? "0 0 20px rgba(34,211,238,0.4)"
                          : "0 0 16px rgba(59,130,246,0.3)"
                        : "none",
                  }}
                  transition={{
                    duration: phase >= 2 ? 1.0 : 0.8,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark
                      ? "border-green-400/60 bg-slate-900/80"
                      : "border-green-400 bg-white"
                  }`}
                >
                  <div
                    className={`text-xs font-medium mb-1 ${
                      isDark ? "text-cyan-300" : "text-blue-800"
                    }`}
                  >
                    {row.word}
                  </div>
                  <div className="flex gap-1">
                    {row.output.map((v, j) => (
                      <span
                        key={j}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isDark
                            ? "text-green-300 bg-green-400/10"
                            : "text-green-700 bg-green-100"
                        }`}
                      >
                        {v.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {phase === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center my-4"
              >
                <div className="w-full max-w-[600px] relative h-12 flex items-center justify-center overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-[3px] rounded-full ${
                      isDark
                        ? "bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400"
                        : "bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"
                    }`}
                  />
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <motion.div
                      key={idx}
                      initial={{ left: "0%", opacity: 0 }}
                      animate={{
                        left: ["0%", "100%"],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 1.2,
                        delay: 0.3 + idx * 0.18,
                        ease: "easeInOut",
                      }}
                      className={`absolute w-2.5 h-2.5 rounded-full ${
                        isDark ? "bg-cyan-400" : "bg-blue-400"
                      }`}
                      style={{
                        filter: isDark
                          ? "drop-shadow(0 0 8px rgba(34,211,238,0.8))"
                          : "drop-shadow(0 0 6px rgba(59,130,246,0.6))",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                  ))}
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-sm mt-2 ${
                    isDark ? "text-cyan-300/80" : "text-blue-700"
                  }`}
                >
                  Passing Encoder Context Vectors to Decoder...
                </motion.p>
              </motion.div>
            )}
          </div>
        )}

        {phase === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-bold mb-2 ${
                isDark ? "text-purple-300" : "text-purple-700"
              }`}
            >
              Decoder Visualization
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-xs mb-5 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              The decoder will now generate the output sequence step by step
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`w-full max-w-[720px] rounded-xl border p-5 ${
                isDark
                  ? "border-purple-400/40 bg-purple-400/5"
                  : "border-purple-300 bg-purple-50"
              }`}
            >
              <p
                className={`text-sm leading-6 text-center mb-4 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                The encoder has finished understanding the input sentence and
                sent its contextual memory vectors to the decoder. The decoder
                will use these vectors — along with its own generated tokens — to
                produce the output sequence one token at a time.
              </p>

              <div
                className={`text-[10px] uppercase tracking-wide text-center mb-3 ${
                  isDark ? "text-purple-300/70" : "text-purple-600"
                }`}
              >
                Encoder Memory Vectors (now available to decoder)
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {rows.map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className={`px-3 py-1.5 rounded-lg border text-xs ${
                      isDark
                        ? "border-purple-400/50 text-purple-300 bg-purple-400/10"
                        : "border-purple-300 text-purple-700 bg-purple-100"
                    }`}
                  >
                    {row.word}: [{row.output.map((v) => v.toFixed(2)).join(", ")}
                    ]
                  </motion.div>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className={`text-xs text-center mt-4 ${
                  isDark ? "text-slate-500" : "text-slate-600"
                }`}
              >
                These encoder memory vectors will be used in Cross-Attention
                (Decoder Step 6) to help the decoder understand the input.
              </motion.p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className={`text-sm mt-6 ${
                isDark ? "text-cyan-300/70" : "text-blue-600"
              }`}
            >
              Press Next to begin the Decoder steps →
            </motion.p>
          </motion.div>
        )}
      </div>

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>The encoder's output vectors are the decoder's "memory" of the input. Without this transfer, the decoder would have no knowledge of what to translate. These vectors will be used as Keys and Values in cross-attention.</p>
      </div>
    </motion.div>
  );
}

export default DecoderTransitionStep;
