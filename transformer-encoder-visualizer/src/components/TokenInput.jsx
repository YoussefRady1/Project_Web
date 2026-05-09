import { useEffect, useState } from "react";

const DEFAULT_SENTENCE = "I love sunny days";

function TokenInput({ setTokens, theme }) {
  const [sentence, setSentence] = useState(DEFAULT_SENTENCE);
  const isDark = theme === "dark";

  useEffect(() => {
    const cleanedTokens = sentence
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    setTokens(cleanedTokens);
  }, [sentence, setTokens]);

  return (
    <input
      type="text"
      value={sentence}
      onChange={(e) => setSentence(e.target.value)}
      placeholder="Type a sentence..."
      className={`w-[460px] rounded-xl border px-4 py-2.5 text-center transition-all duration-300 outline-none ${
        isDark
          ? "border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-cyan-400/60"
          : "border-slate-400 bg-white text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500"
      }`}
    />
  );
}

export default TokenInput;