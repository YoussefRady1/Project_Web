import { useState } from "react";
import TokenInput from "./components/TokenInput";
import AnimationController from "./controllers/AnimationController";
import MainCanvas from "./visualizers/MainCanvas";
import logo from "./assets/logo.png";

function App() {
  const [tokens, setTokens] = useState([]);
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState("dark");

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"
      }`}
    >
     <div
  className={`p-4 flex items-center justify-between border-b shadow-md transition-colors duration-300 ${
    isDark
      ? "bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 border-cyan-500/30"
      : "bg-gradient-to-r from-blue-800 via-blue-700 to-blue-900 border-blue-900"
  }`}
>
  <div className="flex items-center gap-3">
  <img
    src={logo}
    alt="Transformer Logo"
    className="h-10 w-auto object-contain"
  />

  <span
    className={`font-semibold text-sm ${
      isDark ? "text-cyan-300" : "text-white"
    }`}
  >
    Transformer Visualizer
  </span>
</div>
  <button
    onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
    className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
      isDark
        ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
        : "border-white/70 text-white bg-white/10 hover:bg-white/20"
    }`}
  >
    {isDark ? "☀ Light Mode" : "🌙 Dark Mode"}
  </button>
</div>

      <div
        className={`p-6 border-b transition-colors duration-300 ${
          isDark ? "border-slate-800" : "border-slate-300"
        }`}
      >
        <TokenInput setTokens={setTokens} theme={theme} />
      </div>

      <div
        className={`p-4 border-b transition-colors duration-300 ${
          isDark ? "border-slate-800" : "border-slate-300"
        }`}
      >
        <AnimationController step={step} setStep={setStep} theme={theme} />
      </div>

      <div className="flex-1 flex items-center justify-center">
        {tokens.length > 0 ? (
          <MainCanvas step={step} setStep={setStep} tokens={tokens} theme={theme} />
        ) : (
          <div className={isDark ? "text-slate-400 text-center" : "text-slate-700 text-center"}>
            Enter a sentence to start visualization
          </div>
        )}
      </div>
    </div>
  );
}

export default App;