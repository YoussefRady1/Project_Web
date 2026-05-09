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

  const sentence = tokens.length ? tokens.join(" ") : "I love sunny days";
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
        logit: logits[i],
        prob: probs[i],
        shifted: logits[i] - maxLogit,
        exp: exps[i],
      }))
      .sort((a, b) => b.prob - a.prob);

    const top5 = candidates.slice(0, 5);
    const wLogits = top5.map((c) => c.logit);
    const wMax = Math.max(...wLogits);
    const wExps = wLogits.map((z) => Math.exp(z - wMax));
    const wSum = wExps.reduce((a, b) => a + b, 0);
    const wProbs = wExps.map((e) => e / wSum);

    return {
      candidates,
      maxProb: candidates[0]?.prob || 0,
      walkthrough: {
        tokens: top5,
        logits: wLogits,
        maxLogit: wMax,
        shifted: wLogits.map((z) => z - wMax),
        exps: wExps,
        sumExp: wSum,
        probs: wProbs,
      },
    };
  }, [sentence, selectedPos, translation, vocab]);

  const { candidates, maxProb, walkthrough } = demoData;

  const FLOW = [
    {
      label: "Decoder Vector",
      sub: "512 dimensions",
      color: isDark ? "border-cyan-500/50 bg-cyan-500/10" : "border-blue-400 bg-blue-50",
    },
    {
      label: "Linear Layer",
      sub: "× weight matrix",
      color: isDark ? "border-amber-500/50 bg-amber-500/10" : "border-amber-400 bg-amber-50",
    },
    {
      label: "Logits",
      sub: `${vocab.length} raw scores`,
      color: isDark ? "border-orange-500/50 bg-orange-500/10" : "border-orange-400 bg-orange-50",
    },
    {
      label: "Softmax",
      sub: "e^z / Σe^z",
      color: isDark ? "border-purple-500/50 bg-purple-500/10" : "border-purple-400 bg-purple-50",
    },
    {
      label: "Probabilities",
      sub: "sum to 1",
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
        This step runs after the full decoder stack — it is not part of the
        decoder layers
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
          The decoder produces a 512-dimensional vector for each output position.
          The <strong>linear layer</strong> multiplies it by a weight matrix (512
          × vocab_size) to give one raw score (<em>logit</em>) per vocabulary
          word. Then <strong>softmax</strong> converts those logits into
          probabilities that sum to 1. The word with the highest probability
          becomes the prediction.
        </p>
        <p className={`text-[10px] italic mt-2 pt-2 ${isDark ? "border-t border-slate-700/50 text-cyan-300/70" : "border-t border-slate-300/50 text-blue-600/80"}`}>
          Like a multiple-choice exam — the linear layer scores every possible answer in the vocabulary, and softmax converts those scores into confidence percentages.
        </p>
      </div>

      {/* Data flow */}
      <div className="w-full max-w-[760px] mb-5 grid grid-cols-3 gap-2">
        <div className={`rounded-xl border p-3 ${isDark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-400 bg-emerald-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>From previous step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>The final decoder output vector &mdash; it has passed through all decoder layers (masked attention &rarr; add&amp;norm &rarr; cross attention &rarr; add&amp;norm &rarr; feed forward &rarr; add&amp;norm), repeated 6 times in T5-small.</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-cyan-500/30 bg-cyan-500/5" : "border-blue-400 bg-blue-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-700"}`}>What happens here</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>The linear layer multiplies each 512-dim vector by a weight matrix (512 &times; vocab_size) to produce one raw score (logit) per vocabulary word. Softmax then converts logits to probabilities that sum to 1.</p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-400 bg-amber-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Goes to next step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>The word with the highest probability is selected as the prediction. This feeds into the Output Prediction step, where it becomes part of the decoder's growing input sequence.</p>
        </div>
      </div>

      {/* Visual flow pipeline */}
      <div className="flex items-center justify-center gap-1.5 mb-5 flex-wrap">
        {FLOW.map((item, i) => (
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

      {/* Step 1 + Step 2 panels */}
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
            Step 1: Linear projection → logits
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              Each decoder output vector (512 numbers) is multiplied by a large
              weight matrix to produce one score for <em>every</em> word in the
              vocabulary.
            </p>
            <div
              className={`rounded-lg border p-3 text-center font-mono text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-950/70 text-white"
                  : "border-slate-400/70 bg-white text-slate-900"
              }`}
            >
              logits = decoder_output × W<sub>vocab</sub>
              <div
                className={`text-[10px] mt-1 font-sans ${
                  isDark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                shape: (512) × (512 × vocab_size) → (vocab_size scores)
              </div>
            </div>
            <p>
              A higher logit means the model thinks that word is more likely.
              These are raw numbers, they can be negative, zero, or very large.
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
            Step 2: Softmax → probabilities
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              Softmax converts raw logits into probabilities between 0 and 1
              that add up to exactly 1:
            </p>
            <div
              className={`rounded-lg border p-3 text-center font-mono text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-950/70 text-white"
                  : "border-slate-400/70 bg-white text-slate-900"
              }`}
            >
              P(word) = e<sup>logit</sup> / Σ e<sup>all logits</sup>
            </div>
            <p>
              Softmax <strong>amplifies differences</strong>: a logit of 5.0 vs
              3.0 doesn't give 5/8 vs 3/8, it gives ~88% vs ~12%. The highest
              logit dominates.
            </p>
          </div>
        </div>
      </div>

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
                → {tok}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Softmax walkthrough table */}
      <div
        className={`w-full rounded-xl border p-4 mb-5 ${
          isDark
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-amber-400 bg-amber-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-1 ${
            isDark ? "text-amber-300" : "text-amber-700"
          }`}
        >
          Softmax walkthrough — position {selectedPos}
        </div>
        <div
          className={`text-[11px] leading-5 mb-3 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          How softmax picks "
          <span className="font-semibold">
            {walkthrough.tokens[0]?.word}
          </span>
          " from the top 5 candidates (renormalized over these 5 for clarity):
        </div>

        <div className="overflow-x-auto mb-3">
          <table className="w-full text-[11px]">
            <thead>
              <tr
                className={`border-b ${
                  isDark ? "border-slate-700" : "border-slate-300"
                }`}
              >
                <th
                  className={`text-left py-1.5 pr-3 font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-800"
                  }`}
                >
                  Token
                </th>
                <th
                  className={`text-right py-1.5 px-3 font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-800"
                  }`}
                >
                  Logit (z)
                </th>
                <th
                  className={`text-right py-1.5 px-3 font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-800"
                  }`}
                >
                  z − max
                </th>
                <th
                  className={`text-right py-1.5 px-3 font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-800"
                  }`}
                >
                  e<sup>(z−max)</sup>
                </th>
                <th
                  className={`text-right py-1.5 pl-3 font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-800"
                  }`}
                >
                  Probability
                </th>
              </tr>
            </thead>
            <tbody>
              {walkthrough.tokens.map((t, i) => (
                <tr
                  key={i}
                  className={`border-b ${
                    i === 0
                      ? isDark
                        ? "border-green-400/30 bg-green-400/5"
                        : "border-green-300 bg-green-50"
                      : isDark
                      ? "border-slate-800"
                      : "border-slate-200"
                  }`}
                >
                  <td
                    className={`py-1.5 pr-3 font-medium ${
                      i === 0
                        ? isDark
                          ? "text-green-300"
                          : "text-green-700"
                        : isDark
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}
                  >
                    {t.word}
                  </td>
                  <td
                    className={`py-1.5 px-3 text-right font-mono ${
                      isDark ? "text-cyan-300" : "text-blue-800"
                    }`}
                  >
                    {walkthrough.logits[i].toFixed(2)}
                  </td>
                  <td
                    className={`py-1.5 px-3 text-right font-mono ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {walkthrough.shifted[i].toFixed(2)}
                  </td>
                  <td
                    className={`py-1.5 px-3 text-right font-mono ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {walkthrough.exps[i].toFixed(4)}
                  </td>
                  <td
                    className={`py-1.5 pl-3 text-right font-mono font-semibold ${
                      i === 0
                        ? isDark
                          ? "text-green-300"
                          : "text-green-700"
                        : isDark
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}
                  >
                    {(walkthrough.probs[i] * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className={`rounded-lg border p-3 font-mono text-[11px] mb-2 ${
            isDark
              ? "border-slate-700 bg-slate-900 text-cyan-300"
              : "border-slate-300 bg-white text-blue-800"
          }`}
        >
          P("{walkthrough.tokens[0]?.word}") = e
          <sup>{walkthrough.shifted[0]?.toFixed(2)}</sup> /{" "}
          {walkthrough.sumExp.toFixed(4)} ={" "}
          <span className="font-bold">
            {(walkthrough.probs[0] * 100).toFixed(1)}%
          </span>
        </div>

        <div className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          Renormalized over top 5 for clarity. In a real transformer, softmax
          runs over the entire vocabulary (e.g. 32,128 tokens for T5).
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
          Vocabulary probabilities — position {selectedPos}
        </div>
        <div
          className={`text-[10px] text-center mb-4 ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          Showing all {vocab.length} demo vocabulary words (a real model has
          32,000+)
        </div>

        <div className="space-y-2.5">
          {candidates.map((item, i) => {
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
          Demo vocabulary of {vocab.length} words for educational clarity — a
          real T5 model scores all 32,128 vocabulary tokens the same way.
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
