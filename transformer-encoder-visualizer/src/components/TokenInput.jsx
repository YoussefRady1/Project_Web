import { useEffect, useState } from "react";

const DEFAULT_SENTENCE = "The transformer reads the sentence";

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
    <div className="flex flex-col items-center gap-4">
      <input
        type="text"
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        placeholder="Type a sentence..."
        className={`w-[500px] rounded-xl border px-4 py-3 text-center transition ${
          isDark
            ? "border-slate-300 bg-white text-black"
            : "border-slate-400 bg-white text-slate-900"
        }`}
      />
    </div>
  );
}

export default TokenInput;