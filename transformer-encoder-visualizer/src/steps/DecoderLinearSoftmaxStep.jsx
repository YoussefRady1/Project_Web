import { motion } from "framer-motion";
import { useState, useMemo } from "react";

const BASE_VOCAB = [
  "le", "la", "les", "des", "de", "du", "et", "est", "un", "une",
  "Je", "suis", "bon", "beau", "soleil", "temps", "monde", "chat",
  "adore", "journées",
];

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

function buildVocab(translationTokens) {
  const set = new Set(translationTokens);
  const result = [...translationTokens];
  for (const w of BASE_VOCAB) {
    if (!set.has(w) && result.length < 20) {
      result.push(w);
      set.add(w);
    }
  }
  return result;
}

function generateLogits(sentence, position, targetWord, vocab) {
  const s = hashStr(sentence, position * 1000);
  return vocab.map((word, i) => {
    if (word === targetWord) return 4.8 + prand(s + i) * 1.2;
    const r = prand(s + i * 7);
    if (r > 0.85) return 2.0 + prand(s + i * 13) * 1.5;
    if (r > 0.6) return 0.5 + prand(s + i * 11) * 1.0;
    return -3.0 + prand(s + i * 3) * 3.5;
  });
}

function DecoderLinearSoftmaxStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [selectedPos, setSelectedPos] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const sentence = tokens.length ? tokens.join(" ") : "I love sunny days";
  const inputWords = sentence.split(/\s+/);
  const translation = useMemo(() => getTranslation(sentence), [sentence]);
  const vocab = useMemo(() => buildVocab(translation), [translation]);

  const demoData = useMemo(() => {
    const targetWord =
      translation[selectedPos] || translation[translation.length - 1];
    const logits = generateLogits(sentence, selectedPos, targetWord, vocab);

    const maxLogit = Math.max(...logits);
    const exps = logits.map((z) => Math.exp(z - maxLogit));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map((e) => e / sumExp);

    const candidates = vocab
      .map((word, i) => ({
        word,
        prob: probs[i],
      }))
      .sort((a, b) => b.prob - a.prob);

    return {
      candidates,
      maxProb: candidates[0]?.prob || 0,
    };
  }, [sentence, selectedPos, translation, vocab]);

  const { candidates, maxProb } = demoData;

  const FLOW = [
    {
      num: 1,
      label: "Decoder Vector",
      sub: "the decoder's 512-number summary",
      color: isDark ? "border-cyan-500/50 bg-cyan-500/10" : "border-blue-400 bg-blue-50",
    },
    {
      num: 2,
      label: "Linear Layer",
      sub: "gives every word a score",
      color: isDark ? "border-amber-500/50 bg-amber-500/10" : "border-amber-400 bg-amber-50",
    },
    {
      num: 3,
      label: "Logits",
      sub: `${vocab.length} raw scores — not % yet`,
      color: isDark ? "border-orange-500/50 bg-orange-500/10" : "border-orange-400 bg-orange-50",
    },
    {
      num: 4,
      label: "Softmax",
      sub: "turns the scores into %",
      color: isDark ? "border-purple-500/50 bg-purple-500/10" : "border-purple-400 bg-purple-50",
    },
    {
      num: 5,
      label: "Probabilities",
      sub: "a % per word, adding up to 100%",
      color: isDark ? "border-green-500/50 bg-green-500/10" : "border-green-400 bg-green-50",
    },
  ];

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
        Linear + Softmax
      </h2>
      <p
        className={`text-xs text-center mb-1 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        Converts decoder output into vocabulary probabilities
      </p>
      <p
        className={`text-[10px] text-center mb-4 ${
          isDark ? "text-slate-500" : "text-slate-500"
        }`}
      >
        This step runs after the full decoder stack, it is not part of the
        decoder layers
      </p>

      <button
        onClick={() => setShowExplanation((v) => !v)}
        className={`mb-4 text-[11px] font-medium underline underline-offset-2 ${
          isDark ? "text-cyan-300 hover:text-cyan-200" : "text-blue-700 hover:text-blue-800"
        }`}
      >
        {showExplanation ? "Hide explanation" : "Show explanation"}
      </button>

      {/* Visual flow pipeline */}
      <div
        className={`text-[10px] text-center mb-2 font-medium ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}
      >
        Follow the 5 steps: one decoder vector → a probability for every word
      </div>
      <div className="flex items-center justify-center gap-1.5 mb-5 flex-wrap">
        {FLOW.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className={`relative px-3 py-2 rounded-lg border text-center min-w-[120px] ${item.color}`}
            >
              <div
                className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                  isDark
                    ? "bg-slate-900 border-slate-600 text-white"
                    : "bg-white border-slate-400 text-slate-800"
                }`}
              >
                {item.num}
              </div>
              <div
                className={`text-[11px] font-semibold ${
                  isDark ? "text-white" : "text-slate-800"
                }`}
              >
                {item.label}
              </div>
              <div
                className={`text-[9px] leading-3 mt-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {item.sub}
              </div>
            </div>
            {i < FLOW.length - 1 && (
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
      </div>

      {/* How it works panel, only when explanation is shown */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-[760px] rounded-xl border p-4 mb-5 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-400/70 bg-slate-50"
          }`}
        >
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              The <strong>linear layer</strong> scores every vocabulary word by multiplying
              the decoder output vector (512 numbers) by a weight matrix to produce one raw
              score (<em>logit</em>) per word. <strong>Softmax</strong> then converts these
              logits into probabilities between 0 and 1 that sum to exactly 1.
            </p>
            <div className="flex gap-3">
              <div
                className={`flex-1 rounded-lg border p-2.5 text-center font-mono text-[11px] ${
                  isDark
                    ? "border-slate-700 bg-slate-950/70 text-white"
                    : "border-slate-400/70 bg-white text-slate-900"
                }`}
              >
                logits = decoder_output × W<sub>vocab</sub>
              </div>
              <div
                className={`flex-1 rounded-lg border p-2.5 text-center font-mono text-[11px] ${
                  isDark
                    ? "border-slate-700 bg-slate-950/70 text-white"
                    : "border-slate-400/70 bg-white text-slate-900"
                }`}
              >
                P(word) = e<sup>logit</sup> / Σ e<sup>all logits</sup>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Position selector */}
      <div className="w-full mb-4">
        <div
          className={`text-sm font-semibold mb-2 text-center ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Decoder output position
        </div>
        <div
          className={`text-[10px] text-center mb-3 ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          Click a position to see which word the decoder predicts there
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          {translation.map((tok, i) => (
            <button
              key={i}
              onClick={() => setSelectedPos(i)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                selectedPos === i
                  ? isDark
                    ? "border-cyan-400 text-cyan-300 bg-cyan-400/15 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                    : "border-blue-500 text-blue-800 bg-blue-100 shadow-sm"
                  : isDark
                  ? "border-slate-700 text-slate-400 bg-slate-800 hover:border-slate-500"
                  : "border-slate-300 text-slate-600 bg-white hover:border-slate-400"
              }`}
            >
              Position {i}
              <span
                className={`ml-1.5 ${
                  selectedPos === i
                    ? isDark
                      ? "text-cyan-400"
                      : "text-blue-600"
                    : isDark
                    ? "text-slate-600"
                    : "text-slate-400"
                }`}
              >
                → {inputWords[i] || tok}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Probability bars */}
      <div
        className={`w-full rounded-xl border p-4 ${
          isDark
            ? "border-slate-700 bg-slate-900/70"
            : "border-slate-400/70 bg-slate-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-1 text-center ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Vocabulary probabilities, position {selectedPos}
        </div>
        <div
          className={`text-[10px] text-center mb-4 ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          Top 5 candidates (a real model scores all 32,128 vocabulary tokens)
        </div>

        <div className="space-y-2.5">
          {candidates.slice(0, 5).map((item, i) => {
            const isTop = i === 0;
            const barWidth = maxProb > 0 ? (item.prob / maxProb) * 100 : 0;

            return (
              <motion.div
                key={item.word + selectedPos}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: active ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3"
              >
                <div
                  className={`text-[12px] font-medium w-28 text-right truncate ${
                    isTop
                      ? isDark
                        ? "text-green-300"
                        : "text-green-700"
                      : isDark
                      ? "text-slate-300"
                      : "text-slate-700"
                  }`}
                >
                  {item.word}
                </div>

                <div className="flex-1 relative h-6 flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`h-full rounded-md ${
                      isTop
                        ? isDark
                          ? "bg-gradient-to-r from-green-500/60 to-green-400/40"
                          : "bg-gradient-to-r from-green-400/50 to-green-300/30"
                        : isDark
                        ? "bg-gradient-to-r from-slate-700/60 to-slate-600/40"
                        : "bg-gradient-to-r from-slate-300/50 to-slate-200/30"
                    }`}
                    style={
                      isTop
                        ? {
                            boxShadow: isDark
                              ? "0 0 16px rgba(74,222,128,0.3)"
                              : "0 0 12px rgba(34,197,94,0.2)",
                          }
                        : {}
                    }
                  />
                </div>

                <motion.div
                  animate={
                    active && isTop ? { scale: [1, 1.05, 1] } : {}
                  }
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className={`text-[12px] font-mono w-16 text-right ${
                    isTop
                      ? isDark
                        ? "text-green-300 font-bold"
                        : "text-green-700 font-bold"
                      : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  {(item.prob * 100).toFixed(1)}%
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: 0.6 }}
          className={`mt-4 rounded-lg border p-3 text-center ${
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
            Predicted token at position {selectedPos}: "
            {candidates[0]?.word}"
          </span>
          <span
            className={`text-xs ml-2 ${
              isDark ? "text-green-300/60" : "text-green-600"
            }`}
          >
            ({(candidates[0]?.prob * 100).toFixed(1)}%)
          </span>
        </motion.div>

        <div
          className={`mt-3 text-[10px] text-center italic ${
            isDark ? "text-cyan-400/60" : "text-blue-600"
          }`}
        >
          Showing top 5 from a demo vocabulary, a real T5 model scores all
          32,128 vocabulary tokens the same way.
        </div>
      </div>

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>This is where the decoder makes its final prediction. The linear layer evaluates every word in the vocabulary (32,128 words for T5), and softmax amplifies the highest score so one word clearly wins. The entire decoder stack exists to produce the single vector that feeds into this step.</p>
      </div>
    </motion.div>
  );
}

export default DecoderLinearSoftmaxStep;
