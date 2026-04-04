import { useState } from "react";
import { motion } from "framer-motion";

// stable educational vector based on the word's letters
const generateVector = (word) => {
  const cleanWord = (word || "").toLowerCase();

  if (!cleanWord) return ["0.00", "0.00", "0.00", "0.00"];

  const chars = cleanWord.split("");
  const codes = chars.map((char) => char.charCodeAt(0));

  const sum = codes.reduce((acc, code) => acc + code, 0);
  const first = codes[0] || 0;
  const last = codes[codes.length - 1] || 0;
  const length = cleanWord.length;

  const vowelCount = chars.filter((char) =>
    ["a", "e", "i", "o", "u"].includes(char)
  ).length;

  // 4 stable dimensions for visualization only
  const v1 = ((sum % 100) / 100).toFixed(2);
  const v2 = (((first * length) % 100) / 100).toFixed(2);
  const v3 = (((last + vowelCount * 7) % 100) / 100).toFixed(2);
  const v4 = ((((sum + first + last + length) * 3) % 100) / 100).toFixed(2);

  return [v1, v2, v3, v4];
};

function EmbeddingStep({ active, tokens }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const sampleWord = tokens[0] || "hello";
  const sampleVector = generateVector(sampleWord);
  const cleanSample = sampleWord.toLowerCase();
  const sampleChars = cleanSample.split("");
  const sampleCodes = sampleChars.map((char) => char.charCodeAt(0));
  const vowelCount = sampleChars.filter((char) =>
    ["a", "e", "i", "o", "u"].includes(char)
  ).length;

  const sumCodes = sampleCodes.reduce((acc, code) => acc + code, 0);
  const firstCode = sampleCodes[0] || 0;
  const lastCode = sampleCodes[sampleCodes.length - 1] || 0;
  const wordLength = cleanSample.length;

  const calc1Raw = sumCodes % 100;
  const calc2Raw = (firstCode * wordLength) % 100;
  const calc3Raw = (lastCode + vowelCount * 7) % 100;
  const calc4Raw = ((sumCodes + firstCode + lastCode + wordLength) * 3) % 100;
  const letterCodePairs = sampleChars.map(
    (char, index) => `${char} → ${sampleCodes[index]}`
  );

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className="p-6 border border-cyan-500 rounded-2xl w-[700px] min-h-[260px] flex flex-col items-center"
    >
      <h2 className="text-cyan-300 font-semibold text-center">
        Embedding
      </h2>

      <p className="text-xs text-slate-400 text-center mb-4">
        converts each word into a vector
      </p>

      <div className="w-full grid grid-cols-[1.4fr_1fr] gap-6 items-start">
        {/* LEFT: WORD TO VECTOR */}
        <div className="flex flex-col gap-4 mt-1">
          {tokens.map((word, index) => {
            const vector = generateVector(word);

            return (
              <div key={index} className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: active ? 1 : 0.3,
                    x: active ? 0 : -10,
                  }}
                  transition={{ delay: index * 0.15 }}
                  className="text-cyan-300 text-sm w-16 text-right font-medium"
                >
                  {word}
                </motion.div>

                <motion.div
                  animate={{
                    x: active ? [0, 6, 0] : 0,
                    opacity: active ? 1 : 0,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.15,
                  }}
                  className="text-cyan-400"
                >
                  →
                </motion.div>

                <div className="flex flex-col gap-1">
                  <div className="text-[10px] text-slate-500">letter-based demo vector</div>

                  <div className="flex gap-1 bg-slate-900 px-2 py-1 rounded border border-cyan-400">
                    {vector.map((v, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: active ? 1 : 0,
                          y: active ? 0 : 10,
                        }}
                        transition={{
                          delay: index * 0.15 + i * 0.08,
                          duration: 0.25,
                        }}
                        className="text-white text-xs"
                      >
                        {v}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: SIMPLE EXPLANATION */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{
            opacity: active ? 1 : 0.2,
            x: active ? 0 : 10,
          }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"
        >
          <div className="mb-4 flex justify-center">
  <button
    onClick={() => setShowExplanation((prev) => !prev)}
    className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-400/20"
  >
    {showExplanation ? "Hide Embedding Explanation" : "Show Embedding Explanation"}
  </button>
</div>
          {showExplanation && (
  <>
          <div className="mb-3 rounded-lg border border-cyan-400/40 bg-cyan-400/5 p-3 text-[11px] text-slate-300 leading-5">
  <span className="text-cyan-300 font-medium">Why convert words to vectors?</span>
  <br />
  Computers cannot understand words directly, so we turn each word into numbers.
  These numbers allow the model to compare words, measure similarity, and perform calculations.
</div>
          <h3 className="text-sm font-semibold text-cyan-300 mb-3">
  How is the vector made here?
</h3>

<div className="space-y-3 text-xs text-slate-300">
  <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
    <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
      Sample word
    </div>
    <div className="text-cyan-300 font-medium text-sm">
      {sampleWord}
    </div>
  </div>

    <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
    <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">
      What we read from the word
    </div>

    <div className="space-y-1 text-[11px] leading-5">
  <div>
    Letters: <span className="text-white">{sampleChars.join(" , ")}</span>
  </div>
  <div>
    <div>
  Each letter has a fixed number (character code):
</div>

<div>
  <span className="text-white">{letterCodePairs.join(" , ")}</span>
</div>
  </div>
  <div>
    Length: <span className="text-cyan-300">{wordLength}</span>
  </div>
  <div>
    First letter code:{" "}
    <span className="text-cyan-300">
      {sampleChars[0] || "-"} → {firstCode}
    </span>
  </div>
  <div>
    Last letter code:{" "}
    <span className="text-cyan-300">
      {sampleChars[sampleChars.length - 1] || "-"} → {lastCode}
    </span>
  </div>
  <div>
    Vowels (a, e, i, o, u): <span className="text-cyan-300">{vowelCount}</span>
  </div>
  <div>
    Total letter codes:{" "}
    <span className="text-cyan-300">
      {sampleCodes.join(" + ")} = {sumCodes}
    </span>
  </div>
</div>


  </div>

  <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
    <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">
      How each output is calculated
    </div>

    <div className="space-y-2 text-[11px] leading-5 text-slate-300">
      <div className="rounded-md border border-slate-800 bg-slate-900/70 p-2">
        <span className="text-cyan-300 font-medium">1st value</span>{" "}
        = total codes % 100
        <div className="text-white mt-1">
          {sumCodes} % 100 = {calc1Raw} → {(calc1Raw / 100).toFixed(2)}
        </div>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900/70 p-2">
        <span className="text-cyan-300 font-medium">2nd value</span>{" "}
        = (first code × length) % 100
        <div className="text-white mt-1">
          ({firstCode} × {wordLength}) % 100 = {calc2Raw} → {(calc2Raw / 100).toFixed(2)}
        </div>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900/70 p-2">
        <span className="text-cyan-300 font-medium">3rd value</span>{" "}
        = (last code + vowels × 7) % 100
        <div className="text-white mt-1">
          ({lastCode} + {vowelCount} × 7) % 100 = {calc3Raw} → {(calc3Raw / 100).toFixed(2)}
        </div>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900/70 p-2">
        <span className="text-cyan-300 font-medium">4th value</span>{" "}
        = ((total + first + last + length) × 3) % 100
        <div className="text-white mt-1">
          (({sumCodes} + {firstCode} + {lastCode} + {wordLength}) × 3) % 100 = {calc4Raw} → {(calc4Raw / 100).toFixed(2)}
        </div>
      </div>
    </div>
  </div>

  <div className="rounded-lg border border-cyan-400/40 bg-cyan-400/5 p-3">

  
    <div className="text-[10px] uppercase tracking-wide text-cyan-300/80 mb-2">
      Final demo vector
    </div>

    <div className="flex gap-1 flex-wrap">
      {sampleVector.map((value, i) => (
        <span
          key={i}
          className="text-white text-xs px-2 py-1 rounded bg-slate-900 border border-cyan-400/40"
        >
          {value}
        </span>
      ))}
    </div>

    <p className="mt-2 text-[11px] text-slate-300 leading-5">
      Same word → same inputs → same vector.
    </p>
  </div>

</div>
  </>
)}
        </motion.div>
      </div>
      
    </motion.div>
  );
}

export default EmbeddingStep;