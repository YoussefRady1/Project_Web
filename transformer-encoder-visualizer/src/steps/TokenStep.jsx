import { motion, useAnimation } from "framer-motion";
import { useEffect, useMemo } from "react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function TokenStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const sentenceControls = useAnimation();
  const tokenControls = useAnimation();

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 10) : ["hello"]),
    [tokens]
  );

  const positions = useMemo(() => {
    const count = safeTokens.length;
    const center = (count - 1) / 2;

    let spacing = 100;
    if (count >= 6) spacing = 82;
    if (count >= 8) spacing = 66;
    if (count >= 10) spacing = 56;

    return safeTokens.map((_, index) => ({
      x: (index - center) * spacing,
      y: 58,
    }));
  }, [safeTokens]);

  useEffect(() => {
    let cancelled = false;

    const loop = async () => {
      if (!active) {
        await sentenceControls.set({ opacity: 0 });
        await tokenControls.set(() => ({ opacity: 0, x: 0, y: 0, scale: 0.95 }));
        return;
      }

      while (!cancelled) {
        // Sentence breathes in
        await sentenceControls.set({ opacity: 0, y: 8, scale: 0.96 });
        await tokenControls.set(() => ({ opacity: 0, x: 0, y: 0, scale: 0.92 }));
        await sentenceControls.start({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        });
        if (cancelled) return;
        await sleep(2700);
        if (cancelled) return;

        // Sentence drops away with subtle fade
        await sentenceControls.start({
          opacity: 0,
          y: -6,
          scale: 0.97,
          transition: { duration: 0.32, ease: [0.4, 0, 0.7, 0.2] },
        });
        if (cancelled) return;

        // Tokens spring outward with stagger and a tiny pop on landing
        await tokenControls.set(() => ({ opacity: 1, x: 0, y: 0, scale: 1 }));
        await tokenControls.start((i) => ({
          x: positions[i].x,
          y: positions[i].y,
          scale: [1, 1.18, 1],
          transition: {
            x: { type: "spring", stiffness: 170, damping: 18, mass: 0.85, delay: i * 0.05 },
            y: { type: "spring", stiffness: 170, damping: 18, mass: 0.85, delay: i * 0.05 },
            scale: { duration: 0.55, times: [0, 0.55, 1], delay: i * 0.05 + 0.25 },
          },
        }));
        if (cancelled) return;
        await sleep(2900);
        if (cancelled) return;

        // Combine: tokens slide back with a slight squash, then fade together
        await tokenControls.start((i) => ({
          x: 0,
          y: 0,
          scale: [1, 0.94, 1],
          transition: {
            x: { duration: 0.55, ease: [0.65, 0, 0.35, 1], delay: i * 0.025 },
            y: { duration: 0.55, ease: [0.65, 0, 0.35, 1], delay: i * 0.025 },
            scale: { duration: 0.55, times: [0, 0.7, 1], delay: i * 0.025 },
          },
        }));
        if (cancelled) return;
        await tokenControls.start({
          opacity: 0,
          transition: { duration: 0.25, ease: "easeOut" },
        });
        if (cancelled) return;
      }
    };

    loop();

    return () => {
      cancelled = true;
    };
  }, [active, positions, sentenceControls, tokenControls]);

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[680px] h-[430px] flex flex-col items-center justify-start overflow-hidden ${
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

      <div className="relative w-full flex-1 flex items-start justify-center mt-2">
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
            className={`absolute top-0 px-3 py-2 border rounded-lg text-sm whitespace-nowrap will-change-transform ${
  isDark
    ? "bg-slate-900 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.18)]"
    : "bg-white border-blue-300 text-blue-800 shadow-[0_4px_14px_rgba(59,130,246,0.12)]"
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