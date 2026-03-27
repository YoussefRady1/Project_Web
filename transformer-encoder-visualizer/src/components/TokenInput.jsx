import { useEffect, useState } from "react";

function TokenInput({ setTokens }) {
  const [sentence, setSentence] = useState("");

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
      className="w-[500px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-black text-center"
    />

    <div className="flex gap-2 flex-wrap justify-center">
      {sentence.split(" ").filter(Boolean).map((t, i) => (
        <span
          key={i}
          className="px-3 py-1 bg-cyan-500/10 border border-cyan-400 text-cyan-300 rounded-full text-sm"
        >
          {t}
        </span>
      ))}
    </div>
  </div>
);
}

export default TokenInput;