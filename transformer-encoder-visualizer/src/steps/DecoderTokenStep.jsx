import { motion } from "framer-motion";
import { useMemo } from "react";

function DecoderTokenStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 6) : ["token"]),
    [tokens]
  );

  const decoderSequence = useMemo(
    () => ["<START>", ...safeTokens],
    [safeTokens]
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
        Output Tokenization
      </h2>

      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        The decoder starts generation using a special start token
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
          The decoder generates output one token at a time. It needs a starting
          signal — a special &lt;START&gt; token — to know where to begin
          generation. Without it, the decoder has no initial input to work with.
        </p>
        <p className={`text-[10px] italic mt-2 pt-2 ${isDark ? "border-t border-slate-700/50 text-cyan-300/70" : "border-t border-slate-300/50 text-blue-600/80"}`}>
          Like starting an essay with a blank page — the &lt;START&gt; token tells the decoder "begin writing here."
        </p>
      </div>

      {/* Data flow */}
      <div className="w-full max-w-[760px] mb-5 grid grid-cols-3 gap-2">
        <div className={`rounded-xl border p-3 ${isDark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-400 bg-emerald-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>From previous step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>The encoder has finished processing. Its output vectors are stored in memory. Now the decoder needs its own input tokens to begin generating.</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-cyan-500/30 bg-cyan-500/5" : "border-blue-400 bg-blue-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-700"}`}>What happens here</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>The decoder starts with a special &lt;START&gt; token as its first input. During generation, each predicted token is appended to build the growing input sequence.</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-400 bg-amber-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Goes to next step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>These text tokens must be converted to numerical vectors the decoder can process — that happens in the Embedding step.</p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
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
            What is the &lt;START&gt; token?
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              It is a special token that tells the decoder: "Begin generating
              output now."
            </p>
            <p>
              In real Transformers, this is often called{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                &lt;BOS&gt;
              </span>{" "}
              (Beginning of Sequence) or{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                &lt;START&gt;
              </span>
              .
            </p>
            <p>
              The decoder uses this token as the first input and then generates
              output tokens one at a time, each time feeding the previous output
              back as input.
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
            Autoregressive generation
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              The decoder generates tokens{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                one at a time
              </span>
              , from left to right.
            </p>
            <p>
              After predicting each token, that token is added to the input
              sequence and the decoder runs again to predict the next one.
            </p>
            <p>This process is called autoregressive generation.</p>
          </div>
        </div>
      </div>

      <div
        className={`w-full max-w-[700px] rounded-xl border p-5 mb-6 ${
          isDark
            ? "border-slate-700 bg-slate-900/70"
            : "border-slate-400/70 bg-slate-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-4 text-center ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Decoder Input Sequence (builds up over time)
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {decoderSequence.map((tok, i) => (
            <motion.div
              key={tok + i}
              initial={{ opacity: 0, y: 20, scale: 0.7 }}
              animate={{
                opacity: active ? 1 : 0.3,
                y: 0,
                scale: 1,
              }}
              transition={{
                delay: i * 0.2,
                type: "spring",
                stiffness: 260,
                damping: 22,
              }}
              className="flex flex-col items-center gap-1"
            >
              <motion.div
                animate={
                  active && i === 0
                    ? {
                        boxShadow: isDark
                          ? [
                              "0 0 0px rgba(34,211,238,0)",
                              "0 0 22px rgba(34,211,238,0.5)",
                              "0 0 0px rgba(34,211,238,0)",
                            ]
                          : [
                              "0 0 0px rgba(59,130,246,0)",
                              "0 0 18px rgba(59,130,246,0.35)",
                              "0 0 0px rgba(59,130,246,0)",
                            ],
                      }
                    : {}
                }
                transition={
                  i === 0
                    ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                    : {}
                }
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                  i === 0
                    ? isDark
                      ? "border-cyan-400 text-cyan-300 bg-cyan-400/10"
                      : "border-blue-400 text-blue-800 bg-blue-100"
                    : isDark
                    ? "border-slate-600 text-slate-300 bg-slate-800/80"
                    : "border-slate-300 text-slate-700 bg-white"
                }`}
              >
                {tok}
              </motion.div>

              <span
                className={`text-[10px] ${
                  isDark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                {i === 0 ? "start signal" : `predicted #${i}`}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: decoderSequence.length * 0.2 + 0.3 }}
          className={`mt-4 text-center text-[11px] leading-5 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          At each step, the decoder sees all previously generated tokens (shown
          above) and predicts the next one. The &lt;START&gt; token is always the
          first input.
        </motion.div>
      </div>

      <div
        className={`w-full max-w-[700px] rounded-xl border p-4 ${
          isDark
            ? "border-cyan-400/30 bg-cyan-400/5"
            : "border-blue-400 bg-blue-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-2 text-center ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Generation timeline
        </div>

        <div className="space-y-2">
          {decoderSequence.map((_, step) => {
            const visibleTokens = decoderSequence.slice(0, step + 1);
            const nextToken =
              step < decoderSequence.length - 1
                ? decoderSequence[step + 1]
                : "<END>";

            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: active ? 1 : 0.3, x: 0 }}
                transition={{ delay: step * 0.15 + 0.5 }}
                className={`flex items-center gap-3 rounded-lg border p-2 ${
                  isDark
                    ? "border-slate-700 bg-slate-900/60"
                    : "border-slate-300 bg-white"
                }`}
              >
                <span
                  className={`text-[10px] font-mono w-14 shrink-0 ${
                    isDark ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Step {step}
                </span>

                <div className="flex gap-1 flex-wrap flex-1">
                  {visibleTokens.map((t, j) => (
                    <span
                      key={j}
                      className={`text-[11px] px-2 py-0.5 rounded ${
                        j === 0
                          ? isDark
                            ? "text-cyan-300 bg-cyan-400/10 border border-cyan-400/40"
                            : "text-blue-800 bg-blue-100 border border-blue-300"
                          : isDark
                          ? "text-slate-300 bg-slate-800 border border-slate-600"
                          : "text-slate-700 bg-slate-100 border border-slate-300"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <span
                  className={isDark ? "text-cyan-400 text-xs" : "text-blue-600 text-xs"}
                >
                  →
                </span>

                <span
                  className={`text-[11px] font-medium ${
                    isDark ? "text-green-300" : "text-green-700"
                  }`}
                >
                  {nextToken}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>The decoder builds its output sequence one token at a time. Each predicted word gets added to the input for predicting the next word — this is called autoregressive generation.</p>
      </div>
    </motion.div>
  );
}

export default DecoderTokenStep;
