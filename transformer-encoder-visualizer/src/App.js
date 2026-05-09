import { useState, useEffect } from "react";
import TokenInput from "./components/TokenInput";
import AnimationController from "./controllers/AnimationController";
import MainCanvas, { FIRST_PAGE_NEEDING_TOKENS } from "./visualizers/MainCanvas";
import { getModel } from "./steps/TransformerArchitectureStep";
import logoLight from "./assets/transformer-nexus-logo.svg";
import logoDark from "./assets/transformer-nexus-logo-dark.svg";

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

  const [encoderPostCompleted, setEncoderPostCompleted] = useState(
    () => localStorage.getItem("encoderPostCompleted") === "true"
  );
  const [encoderPostScore, setEncoderPostScore] = useState(
    () => Number(localStorage.getItem("encoderPostScore")) || 0
  );
  const [decoderPreCompleted, setDecoderPreCompleted] = useState(
    () => localStorage.getItem("decoderPreCompleted") === "true"
  );
  const [decoderPreScore, setDecoderPreScore] = useState(
    () => Number(localStorage.getItem("decoderPreScore")) || 0
  );
  const [decoderPostCompleted, setDecoderPostCompleted] = useState(
    () => localStorage.getItem("decoderPostCompleted") === "true"
  );
  const [decoderPostScore, setDecoderPostScore] = useState(
    () => Number(localStorage.getItem("decoderPostScore")) || 0
  );

  const resetSession = () => {
    setDbRecordId(null);
    setPreQuizCompleted(false);
    setPreQuizScore(0);
    setPostQuizCompleted(false);
    setPostQuizScore(0);
    setEncoderPostCompleted(false);
    setEncoderPostScore(0);
    setDecoderPreCompleted(false);
    setDecoderPreScore(0);
    setDecoderPostCompleted(false);
    setDecoderPostScore(0);

    [
      "dbRecordId",
      "preQuizCompleted", "preQuizScore",
      "postQuizCompleted", "postQuizScore",
      "encoderPostCompleted", "encoderPostScore",
      "decoderPreCompleted", "decoderPreScore",
      "decoderPostCompleted", "decoderPostScore",
      "postQuizAnswers",
      "encoderPostQuizAnswers",
      "decoderPostQuizAnswers",
    ].forEach((key) => localStorage.removeItem(key));
  };

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

  const submitEncoderPostQuiz = async (score) => {
    setEncoderPostScore(score);
    setEncoderPostCompleted(true);
    localStorage.setItem("encoderPostCompleted", "true");
    localStorage.setItem("encoderPostScore", String(score));
    setPostQuizScore(score);
    setPostQuizCompleted(true);
    localStorage.setItem("postQuizCompleted", "true");
    localStorage.setItem("postQuizScore", String(score));
    try {
      await fetch("/api/save-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dbRecordId, quizType: "encoderPostScore", score }),
      });
    } catch (_) {}
  };

  const submitDecoderPreQuiz = async (score) => {
    setDecoderPreScore(score);
    setDecoderPreCompleted(true);
    localStorage.setItem("decoderPreCompleted", "true");
    localStorage.setItem("decoderPreScore", String(score));
    try {
      await fetch("/api/save-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dbRecordId, quizType: "decoderPreScore", score }),
      });
    } catch (_) {}
  };

  const submitDecoderPostQuiz = async (score) => {
    setDecoderPostScore(score);
    setDecoderPostCompleted(true);
    localStorage.setItem("decoderPostCompleted", "true");
    localStorage.setItem("decoderPostScore", String(score));
    try {
      await fetch("/api/save-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dbRecordId, quizType: "decoderPostScore", score }),
      });
    } catch (_) {}
  };

  const isDark = theme === "dark";
  const showTokenInput = step >= FIRST_PAGE_NEEDING_TOKENS;

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
            src={isDark ? logoDark : logoLight}
            alt="Transformer Logo"
            className={`h-14 w-14 object-contain rounded-xl transition-shadow duration-300 ${
              isDark
                ? "ring-1 ring-cyan-400/30 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                : "ring-2 ring-white/50 bg-white/10 shadow-[0_0_14px_rgba(255,255,255,0.25)]"
            }`}
          />

          <span
            className={`font-bold text-base tracking-wide ${
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

      <div
        className={`p-3 border-b transition-colors duration-300 ${
          isDark ? "border-slate-800" : "border-slate-400/60"
        }`}
      >
        <AnimationController step={step} setStep={setStep} theme={theme} />
      </div>

      <div
        className={`flex justify-center py-2 border-b transition-all duration-300 ${
          isDark ? "border-slate-800" : "border-slate-400/60"
        } ${showTokenInput ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <TokenInput setTokens={setTokens} theme={theme} />
      </div>

      <div className="flex-1 flex items-center justify-center">
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
          resetSession={resetSession}
          encoderPostCompleted={encoderPostCompleted}
          encoderPostScore={encoderPostScore}
          submitEncoderPostQuiz={submitEncoderPostQuiz}
          decoderPreCompleted={decoderPreCompleted}
          decoderPreScore={decoderPreScore}
          submitDecoderPreQuiz={submitDecoderPreQuiz}
          decoderPostCompleted={decoderPostCompleted}
          decoderPostScore={decoderPostScore}
          submitDecoderPostQuiz={submitDecoderPostQuiz}
        />
      </div>
    </div>
  );
}

export default App;
