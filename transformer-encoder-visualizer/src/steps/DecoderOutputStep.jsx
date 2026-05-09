import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

const SENTENCE_TRANSLATIONS = {
  "i love sunny days": ["J'aime", "les", "jours", "ensoleillés"],
  "i love you": ["Je", "t'aime"],
  "the cat is big": ["le", "chat", "est", "grand"],
  "hello world": ["bonjour", "le", "monde"],
  "i am happy": ["Je", "suis", "heureux"],
  "the dog is small": ["le", "chien", "est", "petit"],
  "i like cats": ["J'aime", "les", "chats"],
  "good morning": ["bonjour"],
  "she is beautiful": ["elle", "est", "belle"],
  "we are friends": ["nous", "sommes", "amis"],
};

const WORD_TO_FRENCH = {
  i: "Je", love: "aime", you: "toi", the: "le", a: "un",
  is: "est", are: "sont", big: "grand", small: "petit",
  cat: "chat", dog: "chien", sunny: "ensoleillé", days: "jours",
  day: "jour", hello: "bonjour", world: "monde", good: "bon",
  bad: "mauvais", beautiful: "beau", house: "maison", book: "livre",
  my: "mon", we: "nous", happy: "heureux", sad: "triste",
  new: "nouveau", friend: "ami", life: "vie", time: "temps",
  like: "aime", she: "elle", he: "il", morning: "matin",
};

const RUNNER_POOL = [
  "le", "la", "les", "des", "de", "du", "et", "est", "un", "une",
  "Je", "suis", "bon", "beau", "bien", "très", "pas", "avec",
  "dans", "pour", "sur", "qui", "que", "mais", "ou", "donc",
];

function getTranslation(sentence) {
  const key = sentence.trim().toLowerCase();
  if (SENTENCE_TRANSLATIONS[key]) return SENTENCE_TRANSLATIONS[key];
  return sentence
    .split(/\s+/)
    .map((w) => WORD_TO_FRENCH[w.toLowerCase()] || w);
}

function hashStr(str, n = 0) {
  let h = n;
  for (let i = 0; i < str.length; i++)
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return h;
}

function prand(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 43758.5453;
  return x - Math.floor(x);
}

function buildGenerationSteps(sentence, translation) {
  const s = hashStr(sentence);
  const builtSoFar = [];
  const steps = [];

  for (let i = 0; i < translation.length; i++) {
    const predicted = translation[i];
    const mainProb = 0.72 + prand(s + i * 100) * 0.22;
    builtSoFar.push(predicted);

    const others = RUNNER_POOL.filter((w) => w !== predicted);
    const r1Idx = Math.abs(hashStr(sentence, i * 200)) % others.length;
    let r2Idx = Math.abs(hashStr(sentence, i * 300)) % others.length;
    if (r2Idx === r1Idx) r2Idx = (r2Idx + 1) % others.length;
    const rest = 1 - mainProb;
    const r1Share = 0.4 + prand(s + i * 50) * 0.3;

    steps.push({
      step: i,
      predicted,
      prob: mainProb,
      topK: [
        { word: predicted, prob: mainProb },
        { word: others[r1Idx], prob: rest * r1Share },
        { word: others[r2Idx], prob: rest * (1 - r1Share) },
      ],
      output: [...builtSoFar],
    });
  }

  steps.push({
    step: translation.length,
    predicted: "<END>",
    prob: 1,
    topK: [],
    output: [...builtSoFar, "<END>"],
  });

  return steps;
}

function DecoderOutputStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [revealCount, setRevealCount] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);

  const sentence = tokens.length ? tokens.join(" ") : "I love sunny days";
  const translation = useMemo(() => getTranslation(sentence), [sentence]);
  const generationSteps = useMemo(
    () => buildGenerationSteps(sentence, translation),
    [sentence, translation]
  );

  useEffect(() => {
    setRevealCount(0);
    setAutoPlaying(false);
  }, [sentence]);

  const visibleSteps = generationSteps.slice(0, revealCount + 1);
  const currentStep = visibleSteps[visibleSteps.length - 1];
  const isComplete = revealCount >= generationSteps.length - 1;

  useEffect(() => {
    if (!autoPlaying || isComplete) {
      setAutoPlaying(false);
      return;
    }
    const id = setTimeout(() => {
      setRevealCount((c) => Math.min(c + 1, generationSteps.length - 1));
    }, 1200);
    return () => clearTimeout(id);
  }, [autoPlaying, revealCount, isComplete, generationSteps.length]);

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[980px] min-h-[620px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-400/80 bg-white shadow-sm"
      }`}
    >
      <h2
        className={`text-lg font-bold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        Output Prediction
      </h2>
      <p
        className={`text-xs text-center mb-1 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        The decoder generates tokens one at a time autoregressively
      </p>
      <p
        className={`text-[10px] text-center mb-4 ${
          isDark ? "text-slate-500" : "text-slate-500"
        }`}
      >
        Translating "{sentence}" → French, one word at a time
      </p>

      {/* Why box */}
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
          After the linear + softmax layer selects the most probable word, that
          word becomes the predicted token. It is then fed back into the decoder
          as part of the input for predicting the <em>next</em> token. This loop
          continues until the model predicts a special &lt;END&gt; token. This is
          called <strong>autoregressive generation</strong>, the model generates
          its own input, one step at a time.
        </p>
        <p className={`text-[10px] italic mt-2 pt-2 ${isDark ? "border-t border-slate-700/50 text-cyan-300/70" : "border-t border-slate-300/50 text-blue-600/80"}`}>
          Like writing a sentence word by word — each word you write influences what comes next, and you stop when the thought is complete.
        </p>
      </div>

      {/* Data flow */}
      <div className="w-full max-w-[760px] mb-5 grid grid-cols-3 gap-2">
        <div className={`rounded-xl border p-3 ${isDark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-400 bg-emerald-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>From previous step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>The probability distribution from Linear + Softmax. The highest-probability word has been selected as the prediction for this position.</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-cyan-500/30 bg-cyan-500/5" : "border-blue-400 bg-blue-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-700"}`}>What happens here</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>The predicted token is added to the decoder's input sequence. The entire decoder then runs again with this longer sequence to predict the next token. This repeats until &lt;END&gt; is predicted.</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-400 bg-amber-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Goes to next step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{"Each new prediction feeds back to Decoder Step 1 (Token → Embed → Position → full decoder stack). The loop continues until generation is complete."}</p>
        </div>
      </div>

      {/* Autoregressive loop diagram */}
      <div className="flex items-center justify-center gap-1.5 mb-5 flex-wrap">
        {[
          {
            label: "<START>",
            sub: "initial input",
            color: isDark
              ? "border-purple-500/50 bg-purple-500/10"
              : "border-purple-400 bg-purple-50",
          },
          {
            label: "Full Decoder",
            sub: "all layers",
            color: isDark
              ? "border-cyan-500/50 bg-cyan-500/10"
              : "border-blue-400 bg-blue-50",
          },
          {
            label: "Linear + Softmax",
            sub: "pick highest prob",
            color: isDark
              ? "border-amber-500/50 bg-amber-500/10"
              : "border-amber-400 bg-amber-50",
          },
          {
            label: "Next Token",
            sub: "feed back as input",
            color: isDark
              ? "border-green-500/50 bg-green-500/10"
              : "border-green-400 bg-green-50",
          },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className={`px-3 py-2 rounded-lg border text-center ${item.color}`}
            >
              <div
                className={`text-[11px] font-semibold ${
                  isDark ? "text-white" : "text-slate-800"
                }`}
              >
                {item.label}
              </div>
              <div
                className={`text-[9px] ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {item.sub}
              </div>
            </div>
            {i < 3 && (
              <span
                className={`text-lg font-bold ${
                  isDark ? "text-slate-600" : "text-slate-400"
                }`}
              >
                →
              </span>
            )}
          </div>
        ))}
        <span
          className={`text-lg font-bold ${
            isDark ? "text-amber-500/60" : "text-amber-500"
          }`}
        >
          ↩
        </span>
      </div>

      {/* Explanation panels */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
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
            Autoregressive loop
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>1. Start with &lt;START&gt; as the only input token.</p>
            <p>2. Run the full decoder to predict the next token.</p>
            <p>3. Add that predicted token to the input sequence.</p>
            <p>4. Repeat until &lt;END&gt; is predicted.</p>
            <p>
              Each iteration runs through all decoder layers: masked attention →
              add&norm → cross attention → add&norm → feed forward → add&norm →
              linear → softmax.
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
            When does generation stop?
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              Generation stops when the model predicts the special{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                &lt;END&gt;
              </span>{" "}
              (or &lt;EOS&gt;) token.
            </p>
            <p>
              In practice, there is also a maximum length limit to prevent
              infinite generation.
            </p>
            <p>
              The final output sequence is everything between &lt;START&gt; and
              &lt;END&gt;.
            </p>
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => {
            if (isComplete) {
              setRevealCount(0);
              setAutoPlaying(false);
            } else {
              setRevealCount((c) =>
                Math.min(c + 1, generationSteps.length - 1)
              );
            }
          }}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
            isDark
              ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
              : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
          }`}
        >
          {isComplete ? "Reset" : "Reveal Next Token"}
        </button>

        {!isComplete && (
          <button
            onClick={() => setAutoPlaying(!autoPlaying)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              autoPlaying
                ? isDark
                  ? "border-red-400 text-red-300 bg-red-400/10 hover:bg-red-400/20"
                  : "border-red-400 text-red-700 bg-red-100 hover:bg-red-200"
                : isDark
                ? "border-green-400 text-green-300 bg-green-400/10 hover:bg-green-400/20"
                : "border-green-400 text-green-700 bg-green-100 hover:bg-green-200"
            }`}
          >
            {autoPlaying ? "Pause" : "Auto-Reveal"}
          </button>
        )}
      </div>

      {/* Token-by-token generation */}
      <div
        className={`w-full rounded-xl border p-5 mb-5 ${
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
          Token-by-token generation
        </div>

        <div className="space-y-3">
          {visibleSteps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-slate-700 bg-slate-900/60"
                  : "border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span
                  className={`text-[10px] font-mono shrink-0 ${
                    isDark ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Step {step.step + 1}
                </span>

                <motion.span
                  animate={active ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={
                    isDark ? "text-cyan-400 text-xs" : "text-blue-600 text-xs"
                  }
                >
                  →
                </motion.span>

                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    boxShadow:
                      step.predicted === "<END>"
                        ? isDark
                          ? "0 0 16px rgba(168,85,247,0.4)"
                          : "0 0 12px rgba(139,92,246,0.3)"
                        : isDark
                        ? "0 0 16px rgba(74,222,128,0.4)"
                        : "0 0 12px rgba(34,197,94,0.3)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={`px-3 py-1 rounded-lg border text-sm font-semibold ${
                    step.predicted === "<END>"
                      ? isDark
                        ? "border-purple-400 text-purple-300 bg-purple-400/15"
                        : "border-purple-400 text-purple-700 bg-purple-100"
                      : isDark
                      ? "border-green-400 text-green-300 bg-green-400/15"
                      : "border-green-400 text-green-700 bg-green-100"
                  }`}
                >
                  {step.predicted}
                </motion.span>

                {step.predicted !== "<END>" && (
                  <span
                    className={`text-[10px] font-mono ${
                      isDark ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    ({(step.prob * 100).toFixed(1)}% confidence)
                  </span>
                )}
              </div>

              {step.topK.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[9px] ${
                      isDark ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    Runner-up:
                  </span>
                  {step.topK.slice(1, 3).map((alt, ai) => (
                    <span
                      key={ai}
                      className={`text-[9px] px-1.5 py-0.5 rounded border ${
                        isDark
                          ? "border-slate-700 text-slate-500 bg-slate-800"
                          : "border-slate-200 text-slate-500 bg-slate-50"
                      }`}
                    >
                      {alt.word}{" "}
                      <span className="opacity-60">
                        {(alt.prob * 100).toFixed(1)}%
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Translation so far */}
      {currentStep && (
        <motion.div
          key={revealCount}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/70"
              : "border-slate-400/70 bg-slate-50"
          }`}
        >
          <div
            className={`text-sm font-semibold mb-3 text-center ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            Translation so far
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {currentStep.output
              .filter((t) => t !== "<END>")
              .map((tok, i) => {
                const nonEnd = currentStep.output.filter(
                  (t) => t !== "<END>"
                );
                const isLast = i === nonEnd.length - 1;
                return (
                  <motion.div
                    key={tok + i}
                    initial={
                      isLast ? { opacity: 0, y: 12, scale: 0.7 } : {}
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                      delay: isLast ? 0.15 : 0,
                    }}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                      isDark
                        ? "border-green-400 text-green-300 bg-green-400/10"
                        : "border-green-400 text-green-700 bg-green-100"
                    }`}
                  >
                    {tok}
                  </motion.div>
                );
              })}
          </div>

          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`mt-4 text-center rounded-lg border p-3 ${
                isDark
                  ? "border-green-400/30 bg-green-400/5"
                  : "border-green-300 bg-green-50"
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  isDark ? "text-green-300" : "text-green-700"
                }`}
              >
                Translation complete!
              </span>
              <p
                className={`text-[11px] mt-1 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                "{sentence}" →{" "}
                <strong>
                  "
                  {currentStep.output
                    .filter((t) => t !== "<END>")
                    .join(" ")}
                  "
                </strong>
              </p>
              <p
                className={`text-[10px] mt-1 italic ${
                  isDark ? "text-cyan-400/60" : "text-blue-600"
                }`}
              >
                This demonstrates the autoregressive generation process — each
                token is predicted one at a time, then fed back as input.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Autoregressive generation is the heart of how transformers produce text. The entire decoder runs once per output token — all layers, all attention, all feed-forward — just to predict one word. Then it repeats for the next word. This is why generation is slower than encoding.</p>
      </div>
    </motion.div>
  );
}

export default DecoderOutputStep;
