import { useEffect, useState } from "react";

function TokenInput({ setTokens, theme }) {
  const [sentence, setSentence] = useState("");
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

      <div className="flex gap-2 flex-wrap justify-center">
        {sentence.split(" ").filter(Boolean).map((t, i) => (
          <span
            key={i}
            className={`px-3 py-1 rounded-full text-sm border ${
              isDark
                ? "bg-cyan-500/10 border-cyan-400 text-cyan-300"
                : "bg-blue-100 border-blue-300 text-blue-800"
            }`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TokenInput;