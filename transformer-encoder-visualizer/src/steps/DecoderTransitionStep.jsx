import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";

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

const STAGES = [
  { id: "why", label: "Why" },
  { id: "before", label: "Before" },
  { id: "transfer", label: "Transfer" },
  { id: "after", label: "After" },
];

function DecoderTransitionStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [showExplanation, setShowExplanation] = useState(false);
  const [stage, setStage] = useState(0);
  const [transferDone, setTransferDone] = useState(false);

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

  // Run animation when user enters the transfer stage, then auto-advance to stage 4
  useEffect(() => {
    if (stage === 2) {
      setTransferDone(false);
      const doneTimer = setTimeout(() => setTransferDone(true), 3500);
      const advanceTimer = setTimeout(() => setStage(3), 4500);
      return () => {
        clearTimeout(doneTimer);
        clearTimeout(advanceTimer);
      };
    }
  }, [stage]);

  const goNext = () => setStage((s) => Math.min(s + 1, STAGES.length - 1));
  const goPrev = () => setStage((s) => Math.max(s - 1, 0));
  const restart = () => {
    setStage(0);
    setTransferDone(false);
  };

  const nextDisabled = stage === 2 && !transferDone;

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
        className={`text-xs text-center mb-3 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        Passing contextual memory from the encoder to the decoder
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
          className={`w-full max-w-[720px] mb-4 rounded-xl border p-3 text-[11px] leading-5 ${
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

      {/* Stage progress indicator */}
      <div className="flex items-center gap-2 mb-5">
        {STAGES.map((s, i) => {
          const isCurrent = i === stage;
          const isDone = i < stage;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => i <= stage && setStage(i)}
                disabled={i > stage}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium transition ${
                  isCurrent
                    ? isDark
                      ? "border-cyan-400 text-cyan-300 bg-cyan-400/15 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                      : "border-blue-500 text-blue-800 bg-blue-100"
                    : isDone
                    ? isDark
                      ? "border-green-400/60 text-green-300 bg-green-400/10 cursor-pointer hover:bg-green-400/20"
                      : "border-green-400 text-green-700 bg-green-50 cursor-pointer hover:bg-green-100"
                    : isDark
                    ? "border-slate-700 text-slate-500 bg-slate-900/40 cursor-not-allowed"
                    : "border-slate-300 text-slate-400 bg-slate-50 cursor-not-allowed"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono ${
                    isCurrent
                      ? isDark
                        ? "bg-cyan-400 text-slate-900"
                        : "bg-blue-600 text-white"
                      : isDone
                      ? isDark
                        ? "bg-green-400/80 text-slate-900"
                        : "bg-green-500 text-white"
                      : isDark
                      ? "bg-slate-800 text-slate-500"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                {s.label}
              </button>
              {i < STAGES.length - 1 && (
                <span
                  className={`text-xs ${
                    i < stage
                      ? isDark
                        ? "text-green-400/60"
                        : "text-green-500"
                      : isDark
                      ? "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage content */}
      <div className="w-full flex-1 min-h-[340px]">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="why"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col items-center"
            >
              <div className={`w-full max-w-[760px] rounded-xl border p-4 ${isDark ? "border-cyan-400/30 bg-cyan-400/5" : "border-blue-200 bg-blue-50"}`}>
                <div className={`text-sm font-semibold mb-2 ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
                  Why does this transfer happen?
                </div>
                <div className={`text-[12px] leading-5 space-y-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <p>
                    The encoder has read your entire sentence and computed a rich vector for each word — capturing its meaning <em>in context</em>. These vectors encode the <strong>"understanding"</strong> of the input.
                  </p>
                  <p>
                    The decoder cannot access this on its own. These vectors become <strong>Keys (K)</strong> and <strong>Values (V)</strong> in cross-attention, letting the decoder <em>"look back"</em> at the input while generating each output word.
                  </p>
                </div>
              </div>

              <div className={`mt-4 grid grid-cols-3 gap-2 w-full max-w-[760px]`}>
                <div className={`rounded-lg border p-2 text-center ${isDark ? "border-green-400/40 bg-green-400/5" : "border-green-300 bg-green-50"}`}>
                  <div className={`text-[10px] font-semibold ${isDark ? "text-green-300" : "text-green-700"}`}>Source</div>
                  <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>Encoder output</div>
                </div>
                <div className={`rounded-lg border p-2 text-center ${isDark ? "border-cyan-400/40 bg-cyan-400/5" : "border-blue-300 bg-blue-50"}`}>
                  <div className={`text-[10px] font-semibold ${isDark ? "text-cyan-300" : "text-blue-700"}`}>Carries</div>
                  <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>K &amp; V vectors</div>
                </div>
                <div className={`rounded-lg border p-2 text-center ${isDark ? "border-violet-400/40 bg-violet-400/5" : "border-violet-300 bg-violet-50"}`}>
                  <div className={`text-[10px] font-semibold ${isDark ? "text-violet-300" : "text-violet-700"}`}>Destination</div>
                  <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>Decoder cross-attention</div>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div
              key="before"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <div className={`text-[11px] text-center mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                The encoder has finished processing. The decoder is waiting for its memory.
              </div>

              <div className="flex gap-3 w-full items-stretch">
                {/* Encoder side */}
                <div className={`flex-1 rounded-xl border p-3 ${isDark ? "border-green-400/50 bg-green-400/5 shadow-[0_0_18px_rgba(74,222,128,0.08)]" : "border-green-300 bg-green-50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-xs font-bold ${isDark ? "text-green-300" : "text-green-700"}`}>ENCODER</div>
                    <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? "bg-green-400/20 text-green-300" : "bg-green-200 text-green-800"}`}>
                      ✓ Done
                    </div>
                  </div>
                  <div className={`text-[10px] mb-2 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    Understood your input sentence
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {rows.map((row, i) => (
                      <div key={i} className={`rounded border px-2 py-1 flex items-center justify-between ${isDark ? "border-green-400/20 bg-slate-900/60" : "border-green-200 bg-white"}`}>
                        <span className={`text-[10px] font-medium ${isDark ? "text-green-300" : "text-green-700"}`}>{row.word}</span>
                        <span className={`text-[9px] ml-2 font-mono ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                          [{row.output.map((v) => v.toFixed(2)).join(", ")}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center arrow column */}
                <div className="flex flex-col items-center justify-center gap-2 px-2">
                  {[0, 1, 2].map((idx) => (
                    <motion.div
                      key={idx}
                      animate={{ x: [0, 8, 0], opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: idx * 0.35 }}
                      className={`text-2xl ${isDark ? "text-cyan-400" : "text-blue-500"}`}
                    >
                      →
                    </motion.div>
                  ))}
                  <div className={`text-[9px] text-center ${isDark ? "text-slate-500" : "text-slate-500"}`}>K, V</div>
                </div>

                {/* Decoder side */}
                <div className={`flex-1 rounded-xl border p-3 opacity-70 ${isDark ? "border-slate-600 bg-slate-900/40" : "border-slate-300 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>DECODER</div>
                    <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
                      ⏳ Waiting
                    </div>
                  </div>
                  <div className={`text-[10px] mb-2 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    Needs encoder's understanding
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`rounded border px-2 py-1.5 ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-white"}`}>
                        <span className={`text-[10px] italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          awaiting encoder K, V…
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col items-center"
            >
              <div className={`text-xs mb-3 text-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Encoder output vectors flowing into the decoder
              </div>

              <div className="flex flex-wrap gap-3 justify-center mb-5">
                {rows.map((row, i) => (
                  <motion.div
                    key={row.word + i}
                    initial={{ scale: 1, opacity: 1, x: 0 }}
                    animate={{
                      scale: 0.85,
                      opacity: transferDone ? 0 : 1,
                      x: transferDone ? 320 : 0,
                      boxShadow: isDark
                        ? "0 0 20px rgba(34,211,238,0.35)"
                        : "0 0 16px rgba(59,130,246,0.3)",
                    }}
                    transition={{
                      duration: transferDone ? 1.1 : 0.6,
                      delay: i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`px-3 py-2 rounded-lg border ${
                      isDark
                        ? "border-green-400/60 bg-slate-900/80"
                        : "border-green-400 bg-white"
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isDark ? "text-cyan-300" : "text-blue-800"}`}>
                      {row.word}
                    </div>
                    <div className="flex gap-1">
                      {row.output.map((v, j) => (
                        <span
                          key={j}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
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

              <div className="w-full max-w-[640px] relative h-12 flex items-center justify-center overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3.2, ease: [0.16, 1, 0.3, 1] }}
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
                    animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 1.3,
                      delay: 0.3 + idx * 0.2,
                      ease: "easeInOut",
                      repeat: transferDone ? 0 : Infinity,
                    }}
                    className={`absolute w-2.5 h-2.5 rounded-full ${isDark ? "bg-cyan-400" : "bg-blue-400"}`}
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

              <p className={`text-sm mt-2 ${isDark ? "text-cyan-300/80" : "text-blue-700"}`}>
                {transferDone
                  ? "Vectors delivered to the decoder."
                  : "Passing encoder context vectors to decoder…"}
              </p>
            </motion.div>
          )}

          {stage === 3 && (
            <motion.div
              key="after"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="w-full flex flex-col items-center"
            >
              <div className={`text-xl font-bold mb-1 ${isDark ? "text-green-300" : "text-green-700"}`}>
                Transfer Complete ✓
              </div>
              <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                The decoder now has the encoder's understanding — it can start generating
              </p>

              <div className={`w-full max-w-[760px] rounded-xl border p-4 ${isDark ? "border-green-400/30 bg-green-400/5" : "border-green-300 bg-green-50"}`}>
                <div className={`text-sm font-semibold mb-3 text-center ${isDark ? "text-green-300" : "text-green-700"}`}>
                  What the decoder received — and how it uses these vectors
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className={`rounded-lg border p-2 ${isDark ? "border-pink-400/30 bg-pink-400/5" : "border-pink-200 bg-pink-50"}`}>
                    <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-pink-300" : "text-pink-700"}`}>
                      Used as Keys (K) in Cross-Attention
                    </div>
                    <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      The decoder compares its Query against these to score relevance — <em>"which input word matters most right now?"</em>
                    </div>
                  </div>
                  <div className={`rounded-lg border p-2 ${isDark ? "border-lime-400/30 bg-lime-400/5" : "border-lime-200 bg-lime-50"}`}>
                    <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-lime-300" : "text-lime-700"}`}>
                      Used as Values (V) in Cross-Attention
                    </div>
                    <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Blended by attention weights, these give the decoder the actual <em>content</em> from relevant input words.
                    </div>
                  </div>
                </div>

                <div className={`text-[10px] uppercase tracking-wide text-center mb-2 ${isDark ? "text-green-300/70" : "text-green-600"}`}>
                  Encoder Memory Vectors (K &amp; V source in every cross-attention layer)
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {rows.map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${isDark ? "border-green-400/50 text-green-300 bg-green-400/10" : "border-green-300 text-green-700 bg-green-100"}`}
                    >
                      {row.word}: [{row.output.map((v) => v.toFixed(2)).join(", ")}]
                    </motion.div>
                  ))}
                </div>
              </div>

              <p className={`text-sm mt-5 ${isDark ? "text-cyan-300/70" : "text-blue-600"}`}>
                Press <strong>Next</strong> on the main controller to begin the Decoder steps →
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage navigation */}
      <div className="w-full flex items-center justify-between mt-5 pt-4 border-t border-dashed border-slate-700/30">
        <button
          onClick={goPrev}
          disabled={stage === 0}
          className={`px-4 py-1.5 text-xs rounded-lg border transition ${
            stage === 0
              ? isDark
                ? "border-slate-800 text-slate-700 cursor-not-allowed"
                : "border-slate-200 text-slate-300 cursor-not-allowed"
              : isDark
              ? "border-slate-600 text-slate-300 hover:bg-slate-800"
              : "border-slate-300 text-slate-700 hover:bg-slate-100"
          }`}
        >
          ← Previous
        </button>

        <div className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          Stage {stage + 1} of {STAGES.length} — <span className={isDark ? "text-cyan-300" : "text-blue-700"}>{STAGES[stage].label}</span>
        </div>

        {stage < STAGES.length - 1 ? (
          <button
            onClick={goNext}
            disabled={nextDisabled}
            className={`px-5 py-1.5 text-xs font-semibold rounded-lg border transition ${
              nextDisabled
                ? isDark
                  ? "border-slate-700 text-slate-600 cursor-not-allowed"
                  : "border-slate-200 text-slate-400 cursor-not-allowed"
                : isDark
                ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                : "border-blue-500 text-blue-800 bg-blue-100 hover:bg-blue-200"
            }`}
          >
            {stage === 1 ? "Start Transfer →" : nextDisabled ? "Transferring…" : "Next →"}
          </button>
        ) : (
          <button
            onClick={restart}
            className={`px-4 py-1.5 text-xs rounded-lg border transition ${
              isDark
                ? "border-slate-600 text-slate-300 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            ↻ Replay
          </button>
        )}
      </div>

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          The encoder's output vectors are the decoder's "memory" of the input. Without this transfer, the decoder would have no knowledge of what to translate. These vectors will be used as Keys and Values in cross-attention.
        </p>
      </div>
    </motion.div>
  );
}

export default DecoderTransitionStep;
