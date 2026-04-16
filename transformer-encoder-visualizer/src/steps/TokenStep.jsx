import { motion, useAnimation } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function TokenStep({ active, tokens = [], theme }) {
    const isDark = theme === "dark";
  const [isSplit, setIsSplit] = useState(false);
  const sentenceControls = useAnimation();
  const tokenControls = useAnimation();

  const safeTokens = tokens.length ? tokens.slice(0, 10) : ["hello"];

  const positions = useMemo(() => {
    const count = safeTokens.length;
    const center = (count - 1) / 2;

    let spacing = 70;
    if (count >= 7) spacing = 52;
    if (count >= 9) spacing = 44;

    return safeTokens.map((_, index) => ({
      x: (index - center) * spacing,
      y: 58,
    }));
  }, [safeTokens]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!active) {
        await sentenceControls.set({ opacity: 0 });
        await tokenControls.set(() => ({
          opacity: 0,
          x: 0,
          y: 0,
          scale: 0.95,
        }));
        return;
      }

      // ✅ ONLY RUN WHEN BUTTON CLICKED
      if (!isSplit) {
        await sentenceControls.set({
          opacity: 1,
          y: 0,
          scale: 1,
        });
        await tokenControls.set(() => ({
          opacity: 0,
          x: 0,
          y: 0,
          scale: 0.95,
        }));
        return;
      }

      // 1) show sentence
      await sentenceControls.set({
        opacity: 1,
        y: 0,
        scale: 1,
      });

      await sleep(1500);
      if (cancelled) return;

      // 2) hide sentence
      await sentenceControls.start({
        opacity: 0,
        transition: { duration: 0.12 },
      });

      await sleep(80);
      if (cancelled) return;

      // 3) show tokens
      await tokenControls.set(() => ({
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }));

      // 4) split animation
      await tokenControls.start((i) => ({
        x: positions[i].x,
        y: positions[i].y,
        transition: {
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        },
      }));

      if (cancelled) return;
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [active, isSplit, safeTokens, positions, sentenceControls, tokenControls]);

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[520px] h-[340px] flex flex-col items-center justify-start overflow-hidden ${
  isDark ? "border-cyan-500" : "border-blue-300 bg-white"
}`}
    >
      <h2 className={`${isDark ? "text-cyan-300" : "text-blue-800"} font-semibold text-center`}>
  Tokenization
</h2>
<p
  className={`text-xs text-center mb-4 ${
    isDark ? "text-slate-400" : "text-slate-700"
  }`}
>
  Splits the sentence into individual words
</p>
<div
  className={`w-full max-w-[420px] mb-6 rounded-xl border p-3 ${
    isDark
      ? "border-cyan-400/30 bg-cyan-400/5"
      : "border-blue-300 bg-blue-50"
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
    We use tokenization to break the sentence into smaller units that the Transformer can process one by one instead of treating the whole sentence as raw text.
  </p>
</div>

      {/* 🔥 BUTTONS */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setIsSplit(true)}
          className={`px-4 py-1 text-xs border rounded transition ${
  isDark
    ? "border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
    : "border-blue-400 text-blue-800 hover:bg-blue-100"
}`}
        >
          Split
        </button>

        <button
          onClick={() => setIsSplit(false)}
          className={`px-4 py-1 text-xs border rounded transition ${
  isDark
    ? "border-red-400 text-red-300 hover:bg-red-400/10"
    : "border-red-400 text-red-700 hover:bg-red-100"
}`}
        >
          Combine
        </button>
      </div>

      <div className="relative w-full h-[170px] flex items-start justify-center">
        {/* Sentence */}
        <motion.div
          animate={sentenceControls}
          initial={{ opacity: 0 }}
          className={`absolute top-0 px-4 py-2 border rounded-lg text-sm max-w-[340px] text-center ${
  isDark
    ? "bg-slate-800 border-cyan-400 text-white"
    : "bg-blue-50 border-blue-300 text-slate-900"
}`}
        >
          {safeTokens.join(" ")}
        </motion.div>

        {/* Tokens */}
        {safeTokens.map((word, index) => (
          <motion.div
            key={`${word}-${index}`}
            custom={index}
            animate={tokenControls}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.95 }}
            className={`absolute top-0 px-3 py-2 border rounded-lg text-sm whitespace-nowrap ${
  isDark
    ? "bg-slate-900 border-cyan-400 text-cyan-300"
    : "bg-white border-blue-300 text-blue-800"
}`}
          >
            {word}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default TokenStep;