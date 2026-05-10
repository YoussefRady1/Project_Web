import { motion, useAnimation } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function DecoderTokenStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [showExplanation, setShowExplanation] = useState(false);
  const [phase, setPhase] = useState(0);
  const thinkControls = useAnimation();

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 4) : ["hello"]),
    [tokens]
  );

  const sequence = useMemo(
    () => ["<START>", ...safeTokens, "<END>"],
    [safeTokens]
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!active) return;
      while (!cancelled) {
        setPhase(0);
        await sleep(900);
        for (let i = 1; i <= sequence.length; i++) {
          if (cancelled) return;
          await thinkControls.start({
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
            transition: { duration: 0.9, repeat: 1, ease: "easeInOut" },
          });
          if (cancelled) return;
          setPhase(i);
          await sleep(900);
        }
        await sleep(1400);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [active, sequence.length, thinkControls]);

  const visibleTokens = sequence.slice(0, phase);
  const isThinking = phase > 0 && phase < sequence.length;
  const nextLabel =
    phase === 0
      ? "Decoder is ready to begin"
      : phase < sequence.length
      ? "Decoder predicts the next token..."
      : "Generation complete";

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[680px] min-h-[460px] flex flex-col items-center justify-start ${
        isDark ? "border-cyan-500" : "border-blue-400/80 bg-white shadow-sm"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        Output Tokenization
      </h2>
      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        The decoder builds its output one token at a time
      </p>

      <div
        className={`w-full max-w-[520px] mb-5 rounded-xl border p-3 ${
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
          The decoder begins with a special &lt;START&gt; token, then predicts each
          next token one at a time, feeding it back into itself until it
          produces &lt;END&gt;.
        </p>
      </div>

      <div className="relative w-full flex-1 flex flex-col items-center justify-start gap-4 mt-1">
        <div className="min-h-[60px] flex flex-wrap gap-2 justify-center items-center">
          {visibleTokens.map((tok, i) => {
            const isStart = tok === "<START>";
            const isEnd = tok === "<END>";
            return (
              <motion.div
                key={tok + i}
                initial={{ opacity: 0, y: 14, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                  isStart
                    ? isDark
                      ? "border-cyan-400 text-cyan-300 bg-cyan-400/10"
                      : "border-blue-400 text-blue-800 bg-blue-100"
                    : isEnd
                    ? isDark
                      ? "border-purple-400 text-purple-300 bg-purple-400/10"
                      : "border-purple-400 text-purple-700 bg-purple-100"
                    : isDark
                    ? "border-green-400 text-green-300 bg-green-400/10"
                    : "border-green-400 text-green-700 bg-green-100"
                }`}
              >
                {tok}
              </motion.div>
            );
          })}

          {isThinking && (
            <motion.div
              animate={thinkControls}
              className={`px-3 py-2 rounded-lg border-2 border-dashed text-sm ${
                isDark
                  ? "border-slate-600 text-slate-500"
                  : "border-slate-400 text-slate-500"
              }`}
            >
              ...
            </motion.div>
          )}
        </div>

        <div
          className={`text-[11px] italic h-5 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {nextLabel}
        </div>

        <div
          className={`text-[10px] flex items-center gap-3 mt-1 ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          <span className="flex items-center gap-1">
            <span
              className={`w-2.5 h-2.5 rounded-sm border ${
                isDark ? "border-cyan-400 bg-cyan-400/20" : "border-blue-400 bg-blue-100"
              }`}
            />
            start signal
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`w-2.5 h-2.5 rounded-sm border ${
                isDark ? "border-green-400 bg-green-400/20" : "border-green-400 bg-green-100"
              }`}
            />
            predicted
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`w-2.5 h-2.5 rounded-sm border ${
                isDark ? "border-purple-400 bg-purple-400/20" : "border-purple-400 bg-purple-100"
              }`}
            />
            end of sequence
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowExplanation((v) => !v)}
        className={`mt-4 text-[11px] font-medium underline underline-offset-2 ${
          isDark
            ? "text-cyan-300 hover:text-cyan-200"
            : "text-blue-700 hover:text-blue-800"
        }`}
      >
        {showExplanation ? "Hide explanation" : "Show explanation"}
      </button>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-[560px] mt-3 rounded-xl border p-3 text-[11px] leading-5 ${
            isDark
              ? "border-slate-700 bg-slate-900/70 text-slate-300"
              : "border-slate-300 bg-slate-50 text-slate-700"
          }`}
        >
          <p className="mb-2">
            The decoder cannot generate all tokens at once. It produces one
            token, then re-runs itself with that token added to the input, this
            is called <strong>autoregressive generation</strong>.
          </p>
          <p>
            The &lt;START&gt; token is the seed that kicks off the loop. The
            &lt;END&gt; token is how the decoder signals that it's finished.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default DecoderTokenStep;
