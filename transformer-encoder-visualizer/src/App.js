import { useState, useEffect } from "react";
import TokenInput from "./components/TokenInput";
import AnimationController from "./controllers/AnimationController";
import MainCanvas, { FIRST_PAGE_NEEDING_TOKENS } from "./visualizers/MainCanvas";
import { getModel } from "./steps/TransformerArchitectureStep";
import logo from "./assets/logo.png";

function App() {
  useEffect(() => {
    getModel();
  }, []);

  const [tokens, setTokens] = useState([]);
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState("dark");

  const [userName, setUserName] = useState(
    () => localStorage.getItem("userName") || ""
  );
  const [dbRecordId, setDbRecordId] = useState(
    () => localStorage.getItem("dbRecordId") || null
  );
  const [preQuizCompleted, setPreQuizCompleted] = useState(
    () => localStorage.getItem("preQuizCompleted") === "true"
  );
  const [postQuizCompleted, setPostQuizCompleted] = useState(
    () => localStorage.getItem("postQuizCompleted") === "true"
  );
  const [preQuizScore, setPreQuizScore] = useState(
    () => Number(localStorage.getItem("preQuizScore")) || 0
  );
  const [postQuizScore, setPostQuizScore] = useState(
    () => Number(localStorage.getItem("postQuizScore")) || 0
  );

  const submitPreQuiz = async (score) => {
    setPreQuizScore(score);
    setPreQuizCompleted(true);
    localStorage.setItem("preQuizCompleted", "true");
    localStorage.setItem("preQuizScore", String(score));
    try {
      const res = await fetch("/api/save-pre-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, preQuizScore: score }),
      });
      const data = await res.json();
      if (data.id) {
        setDbRecordId(data.id);
        localStorage.setItem("dbRecordId", String(data.id));
      }
    } catch (_) {}
  };

  const submitPostQuiz = async (score) => {
    setPostQuizScore(score);
    setPostQuizCompleted(true);
    localStorage.setItem("postQuizCompleted", "true");
    localStorage.setItem("postQuizScore", String(score));
    try {
      await fetch("/api/save-post-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dbRecordId, postQuizScore: score }),
      });
    } catch (_) {}
  };

  const isDark = theme === "dark";
  const showTokenInput = step >= FIRST_PAGE_NEEDING_TOKENS;
  const needsTokens = step >= FIRST_PAGE_NEEDING_TOKENS;

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

        <div className="flex items-center gap-4">
          {userName && (
            <span
              className={`text-sm ${isDark ? "text-slate-400" : "text-white/80"}`}
            >
              Welcome, <span className="font-medium">{userName}</span>
            </span>
          )}
          <button
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
              isDark
                ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
                : "border-white/70 text-white bg-white/10 hover:bg-white/20"
            }`}
          >
            {isDark ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>

      {showTokenInput && (
        <div
          className={`p-6 border-b transition-colors duration-300 ${
            isDark ? "border-slate-800" : "border-slate-300"
          }`}
        >
          <TokenInput setTokens={setTokens} theme={theme} />
        </div>
      )}

      <div
        className={`p-4 border-b transition-colors duration-300 ${
          isDark ? "border-slate-800" : "border-slate-300"
        }`}
      >
        <AnimationController step={step} setStep={setStep} theme={theme} />
      </div>

      <div className="flex-1 flex items-center justify-center">
        {needsTokens && tokens.length === 0 ? (
          <div
            className={
              isDark
                ? "text-slate-400 text-center"
                : "text-slate-700 text-center"
            }
          >
            Enter a sentence above to start the visualization
          </div>
        ) : (
          <MainCanvas
            step={step}
            setStep={setStep}
            tokens={tokens}
            theme={theme}
            userName={userName}
            setUserName={setUserName}
            preQuizCompleted={preQuizCompleted}
            postQuizCompleted={postQuizCompleted}
            preQuizScore={preQuizScore}
            postQuizScore={postQuizScore}
            submitPreQuiz={submitPreQuiz}
            submitPostQuiz={submitPostQuiz}
          />
        )}
      </div>
    </div>
  );
}

export default App;
