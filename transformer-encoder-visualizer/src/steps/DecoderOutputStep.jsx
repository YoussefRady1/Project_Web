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

function getTranslation(sentence) {
  const key = sentence.trim().toLowerCase();
  if (SENTENCE_TRANSLATIONS[key]) return SENTENCE_TRANSLATIONS[key];
  return sentence
    .split(/\s+/)
    .map((w) => WORD_TO_FRENCH[w.toLowerCase()] || w);
}

function DecoderOutputStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [stepIdx, setStepIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const sentence = tokens.length ? tokens.join(" ") : "I love sunny days";
  const translation = useMemo(() => getTranslation(sentence), [sentence]);
  const totalSteps = translation.length + 1; // +1 for <END>

  useEffect(() => {
    setStepIdx(0);
    setAutoPlay(false);
    setThinking(false);
  }, [sentence]);

  useEffect(() => {
    if (!autoPlay) return;
    if (stepIdx >= totalSteps) {
      setAutoPlay(false);
      return;
    }
    setThinking(true);
    const t1 = setTimeout(() => setThinking(false), 800);
    const t2 = setTimeout(() => setStepIdx((s) => s + 1), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [autoPlay, stepIdx, totalSteps]);

  const isComplete = stepIdx >= totalSteps;

  const handleNext = () => {
    if (isComplete) {
      setStepIdx(0);
      setAutoPlay(false);
      setThinking(false);
      return;
    }
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setStepIdx((s) => s + 1);
    }, 600);
  };

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[860px] min-h-[560px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-400/80 bg-white shadow-sm"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
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
        Each click runs the whole decoder once and produces one new token
      </p>
      <div
        className={`mb-4 px-5 py-2.5 rounded-xl border text-center ${
          isDark
            ? "border-cyan-500/40 bg-cyan-500/10"
            : "border-blue-300 bg-blue-50"
        }`}
      >
        <div
          className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${
            isDark ? "text-cyan-400/70" : "text-blue-500"
          }`}
        >
          Task
        </div>
        <div
          className={`text-lg font-bold ${
            isDark ? "text-cyan-200" : "text-blue-800"
          }`}
        >
          Translating <span className="italic">"{sentence}"</span>
          <span className={isDark ? "text-cyan-400" : "text-blue-500"}> → French</span>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-4">
        {/* Current decoder input - grows with each run */}
        <div
          className={`w-full max-w-[680px] rounded-xl border p-4 ${
            isDark ? "border-slate-700 bg-slate-900/60" : "border-slate-300 bg-slate-50"
          }`}
        >
          <div
            className={`text-[10px] uppercase tracking-wider font-semibold mb-3 ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            Decoder input for next run
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["<START>", ...translation.slice(0, stepIdx)].map((tok, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                  tok === "<START>"
                    ? isDark
                      ? "border-purple-400 text-purple-300 bg-purple-400/10"
                      : "border-purple-400 text-purple-700 bg-purple-100"
                    : isDark
                    ? "border-green-400 text-green-300 bg-green-400/10"
                    : "border-green-400 text-green-700 bg-green-100"
                }`}
              >
                {tok}
              </motion.span>
            ))}
            {!isComplete && (
              <span
                className={`px-2.5 py-1 rounded-lg text-xs border border-dashed ${
                  isDark ? "border-slate-600 text-slate-500" : "border-slate-300 text-slate-400"
                }`}
              >
                → ?
              </span>
            )}
          </div>
          {stepIdx > 0 && !isComplete && (
            <p
              className={`mt-2 text-[10px] ${
                isDark ? "text-slate-500" : "text-slate-500"
              }`}
            >
              Run {stepIdx} predicted{" "}
              <strong
                className={isDark ? "text-green-300" : "text-green-700"}
              >
                {translation[stepIdx - 1]}
              </strong>{" "}
              - now feeding it back in and running again
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={handleNext}
            disabled={thinking}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition disabled:opacity-50 ${
              isDark
                ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
                : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
            }`}
          >
            {isComplete ? "Reset" : stepIdx === 0 ? "Run Decoder" : "Run Again"}
          </button>
          {!isComplete && (
            <button
              onClick={() => setAutoPlay((p) => !p)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                autoPlay
                  ? isDark
                    ? "border-red-400 text-red-300 bg-red-400/10 hover:bg-red-400/20"
                    : "border-red-400 text-red-700 bg-red-100 hover:bg-red-200"
                  : isDark
                  ? "border-green-400 text-green-300 bg-green-400/10 hover:bg-green-400/20"
                  : "border-green-400 text-green-700 bg-green-100 hover:bg-green-200"
              }`}
            >
              {autoPlay ? "Pause" : "Auto Run"}
            </button>
          )}
        </div>

        {/* Final translation */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-[680px] mt-2 rounded-xl border p-4 text-center ${
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
              Translation complete
            </span>
            <p
              className={`text-[11px] mt-1 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              "{sentence}" → <strong>"{translation.join(" ")}"</strong>
            </p>
          </motion.div>
        )}
      </div>

      <button
        onClick={() => setShowExplanation((v) => !v)}
        className={`mt-5 text-[11px] font-medium underline underline-offset-2 ${
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
          className={`w-full max-w-[700px] mt-3 rounded-xl border p-3 text-[11px] leading-5 ${
            isDark
              ? "border-slate-700 bg-slate-900/70 text-slate-300"
              : "border-slate-300 bg-slate-50 text-slate-700"
          }`}
        >
          <p className="mb-2">
            <strong>Token-by-token generation</strong> means the decoder runs
            its <em>entire</em> stack of layers (masked attention, cross-attention,
            feed-forward) <strong>once per output token</strong> and each run
            produces just <strong>one</strong> new word.
          </p>
          <p className="mb-2">
            After predicting a word, that word is appended to the input and the
            whole decoder runs again to predict the next word. This loop is
            called <strong>autoregressive generation</strong>.
          </p>
          <p>
            Generation stops when the model predicts the special &lt;END&gt;
            token. This is also why text generation feels slower than encoding -
            the decoder cannot produce all tokens in parallel.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default DecoderOutputStep;
