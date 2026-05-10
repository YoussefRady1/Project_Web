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
              key="initial-view"
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {/* Why this transfer happens */}
              <div className={`rounded-xl border p-3 mb-4 ${isDark ? "border-cyan-400/20 bg-cyan-400/5" : "border-blue-200 bg-blue-50"}`}>
                <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-800"}`}>Why does this transfer happen?</div>
                <div className={`text-[10px] leading-4 space-y-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <p>The encoder has read your entire sentence and computed a rich vector for each word — capturing its meaning in context. These vectors encode the <strong>"understanding"</strong> of the input.</p>
                  <p>The decoder cannot access this on its own. These vectors become <strong>Keys (K)</strong> and <strong>Values (V)</strong> in cross-attention, letting the decoder "look back" at the input while generating each output word.</p>
                </div>
              </div>

              {/* Split screen: Encoder | Arrow | Decoder */}
              <div className="flex gap-3 w-full mb-4">
                {/* ENCODER side — done */}
                <div className={`flex-1 rounded-xl border p-3 ${isDark ? "border-green-400/50 bg-green-400/5 shadow-[0_0_18px_rgba(74,222,128,0.08)]" : "border-green-300 bg-green-50"}`}>
                  <div className={`text-xs font-bold mb-0.5 ${isDark ? "text-green-300" : "text-green-700"}`}>ENCODER ✓ Done</div>
                  <div className={`text-[10px] mb-2 ${isDark ? "text-slate-500" : "text-slate-500"}`}>Understood your input sentence</div>
                  <div className="flex flex-col gap-1.5">
                    {rows.slice(0, 5).map((row, i) => (
                      <div key={i} className={`rounded border px-2 py-1 flex items-center justify-between ${isDark ? "border-green-400/20 bg-slate-900/60" : "border-green-200 bg-white"}`}>
                        <span className={`text-[10px] font-medium ${isDark ? "text-green-300" : "text-green-700"}`}>{row.word}</span>
                        <span className={`text-[9px] ml-2 ${isDark ? "text-slate-600" : "text-slate-400"}`}>[{row.output.map(v => v.toFixed(2)).join(", ")}]</span>
                      </div>
                    ))}
                    {rows.length > 5 && (
                      <div className={`text-[9px] text-center ${isDark ? "text-slate-700" : "text-slate-400"}`}>+ {rows.length - 5} more tokens</div>
                    )}
                  </div>
                </div>

                {/* Center arrows */}
                <div className="flex flex-col items-center justify-center gap-1 px-1">
                  {[0, 1, 2].map(idx => (
                    <motion.div
                      key={idx}
                      animate={{ x: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: idx * 0.4 }}
                      className={`text-xl ${isDark ? "text-cyan-400" : "text-blue-500"}`}
                    >→</motion.div>
                  ))}
                  <div className={`text-[9px] text-center mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>vectors</div>
                </div>

                {/* DECODER side — waiting */}
                <div className={`flex-1 rounded-xl border p-3 opacity-55 ${isDark ? "border-slate-600 bg-slate-900/40" : "border-slate-300 bg-slate-50"}`}>
                  <div className={`text-xs font-bold mb-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>DECODER ⏳ Waiting</div>
                  <div className={`text-[10px] mb-2 ${isDark ? "text-slate-600" : "text-slate-500"}`}>Needs encoder's understanding</div>
                  <div className="flex flex-col gap-1.5">
                    {["Awaiting encoder K, V...", "Awaiting encoder K, V...", "Awaiting encoder K, V..."].map((txt, i) => (
                      <div key={i} className={`rounded border px-2 py-1.5 ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-white"}`}>
                        <span className={`text-[10px] ${isDark ? "text-slate-700" : "text-slate-400"}`}>{txt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`text-[11px] text-center ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                Click <strong>"Transfer Context to Decoder"</strong> above to watch the vectors move
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
              className={`text-xl font-bold mb-1 ${isDark ? "text-green-300" : "text-green-700"}`}
            >
              Transfer Complete ✓
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              The decoder now has the encoder's understanding — it can start generating
            </motion.p>

            {/* How these vectors are used */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`w-full max-w-[720px] rounded-xl border p-4 mb-4 ${isDark ? "border-green-400/30 bg-green-400/5" : "border-green-300 bg-green-50"}`}
            >
              <div className={`text-sm font-semibold mb-3 text-center ${isDark ? "text-green-300" : "text-green-700"}`}>
                What the decoder received — and how it uses these vectors
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className={`rounded-lg border p-2 ${isDark ? "border-pink-400/30 bg-pink-400/5" : "border-pink-200 bg-pink-50"}`}>
                  <div className={`text-[10px] font-semibold mb-1 ${isDark ? "text-pink-300" : "text-pink-700"}`}>Used as Keys (K) in Cross-Attention</div>
                  <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>The decoder compares its Query against these to score relevance — "which input word matters most right now?"</div>
                </div>
                <div className={`rounded-lg border p-2 ${isDark ? "border-lime-400/30 bg-lime-400/5" : "border-lime-200 bg-lime-50"}`}>
                  <div className={`text-[10px] font-semibold mb-1 ${isDark ? "text-lime-300" : "text-lime-700"}`}>Used as Values (V) in Cross-Attention</div>
                  <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>Blended by attention weights, these give the decoder the actual content from relevant input words</div>
                </div>
              </div>

              <div className={`text-[10px] uppercase tracking-wide text-center mb-2 ${isDark ? "text-green-300/70" : "text-green-600"}`}>
                Encoder Memory Vectors (K &amp; V source in every cross-attention layer)
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {rows.map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.08 }}
                    className={`px-3 py-1.5 rounded-lg border text-xs ${isDark ? "border-green-400/50 text-green-300 bg-green-400/10" : "border-green-300 text-green-700 bg-green-100"}`}
                  >
                    {row.word}: [{row.output.map((v) => v.toFixed(2)).join(", ")}]
                  </motion.div>
                ))}
              </div>
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
