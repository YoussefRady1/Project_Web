import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import preQuiz from "../data/preQuiz";

function PreQuizStep({ active, theme, userName, setUserName, preQuizCompleted, preQuizScore, submitPreQuiz }) {
  const isDark = theme === "dark";
  const [nameInput, setNameInput] = useState(userName || "");
  const [nameError, setNameError] = useState(false);
  const [nameConfirmed, setNameConfirmed] = useState(!!userName);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(() => preQuiz, []);

  const scoreData = useMemo(() => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct += 1;
    });
    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  }, [answers, questions]);

  const wrongQuestions = questions.filter(
    (q) => submitted && answers[q.id] !== q.correctAnswer
  );

  const handleNameConfirm = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setUserName(trimmed);
    localStorage.setItem("userName", trimmed);
    setNameConfirmed(true);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct += 1;
    });
    const percentage = Math.round((correct / questions.length) * 100);
    submitPreQuiz(percentage);
  };

  if (preQuizCompleted) {
    return (
      <motion.div
        animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
        transition={{ duration: 0.3 }}
        className={`p-6 border rounded-2xl w-[980px] min-h-[400px] flex flex-col items-center justify-center ${
          isDark ? "border-cyan-500 bg-transparent" : "border-blue-300 bg-white"
        }`}
      >
        <div
          className={`text-5xl mb-4 ${isDark ? "text-cyan-400" : "text-blue-600"}`}
        >
          ✓
        </div>
        <h2
          className={`text-xl font-semibold mb-3 ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Pre-Quiz Already Completed
        </h2>
        <div className="text-3xl font-bold mb-2">
          <span className={isDark ? "text-white" : "text-slate-900"}>
            Your score: {preQuizScore}%
          </span>
        </div>
        <p
          className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          You have already submitted this quiz. Use the Next button to continue.
        </p>
      </motion.div>
    );
  }

  if (!nameConfirmed) {
    return (
      <motion.div
        animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
        transition={{ duration: 0.3 }}
        className={`p-6 border rounded-2xl w-[980px] min-h-[400px] flex flex-col items-center justify-center ${
          isDark ? "border-cyan-500 bg-transparent" : "border-blue-300 bg-white"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-2 ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Pre-Quiz: What Do You Already Know?
        </h2>
        <p
          className={`text-xs text-center mb-6 ${
            isDark ? "text-slate-400" : "text-slate-700"
          }`}
        >
          Please enter your name before starting the quiz.
        </p>

        <div
          className={`w-full max-w-[400px] rounded-xl border p-5 ${
            isDark
              ? "border-cyan-400/30 bg-cyan-400/5"
              : "border-blue-300 bg-blue-50"
          }`}
        >
          <label
            className={`block text-sm font-semibold mb-2 text-center ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            Your Name
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (nameError) setNameError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleNameConfirm()}
            placeholder="Enter your name..."
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition outline-none ${
              isDark
                ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400"
            } ${nameError ? (isDark ? "border-red-400" : "border-red-500") : ""}`}
          />
          {nameError && (
            <p className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
              Please enter your name to continue.
            </p>
          )}
        </div>

        <button
          onClick={handleNameConfirm}
          className={`mt-5 px-6 py-2.5 rounded-full text-sm font-bold transition ${
            isDark
              ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              : "bg-blue-600 text-white hover:bg-blue-500"
          }`}
        >
          Start Quiz
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[1100px] min-h-[760px] flex flex-col items-center ${
        isDark ? "border-cyan-500 bg-transparent" : "border-blue-300 bg-white"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        Pre-Quiz: What Do You Already Know?
      </h2>

      <p
        className={`text-xs text-center mb-1 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        Test your intuition before diving into the visualizations.
      </p>

      <p
        className={`text-[11px] text-center mb-4 max-w-[700px] leading-5 ${
          isDark ? "text-slate-500" : "text-slate-600"
        }`}
      >
        Don't worry if you don't know the answers yet — this quiz is designed to
        activate your thinking before you explore each step in detail.
      </p>

      <div className="w-full space-y-4">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-900/70"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <div
              className={`font-medium mb-3 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              {index + 1}. {q.question}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((option) => {
                const isSelected = answers[q.id] === option;
                const isCorrect = submitted && option === q.correctAnswer;
                const isWrongSelected =
                  submitted && isSelected && option !== q.correctAnswer;

                return (
                  <button
                    key={option}
                    onClick={() =>
                      !submitted &&
                      setAnswers((prev) => ({ ...prev, [q.id]: option }))
                    }
                    className={`text-left px-4 py-3 rounded-lg border transition ${
                      isCorrect
                        ? isDark
                          ? "border-green-400 text-green-300 bg-green-400/10"
                          : "border-green-500 text-green-700 bg-green-100"
                        : isWrongSelected
                        ? isDark
                          ? "border-red-400 text-red-300 bg-red-400/10"
                          : "border-red-400 text-red-700 bg-red-100"
                        : isSelected
                        ? isDark
                          ? "border-cyan-400 text-cyan-300 bg-cyan-400/10"
                          : "border-blue-400 text-blue-800 bg-blue-100"
                        : isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                    disabled={submitted}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className={`mt-6 px-6 py-2 rounded-lg border transition ${
            isDark
              ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
              : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
          }`}
        >
          Submit Pre-Quiz
        </button>
      ) : (
        <div className="w-full mt-6 space-y-5">
          <div
            className={`rounded-xl border p-5 text-center ${
              isDark
                ? "border-slate-700 bg-slate-900/80"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <div
              className={`text-lg font-semibold mb-2 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              Your Pre-Quiz Score
            </div>
            <div className="text-3xl font-bold">
              <span className={isDark ? "text-white" : "text-slate-900"}>
                {scoreData.correct} / {scoreData.total}
              </span>
            </div>
            <div
              className={`mt-2 text-lg ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              {scoreData.percentage}%
            </div>
            <p
              className={`mt-3 text-sm ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {scoreData.percentage >= 70
                ? "Great foundation! Let's see how the visualizations deepen your understanding."
                : "No worries — the upcoming steps will teach you everything. Press Next to continue!"}
            </p>
          </div>

          {wrongQuestions.length > 0 && (
            <div
              className={`rounded-xl border p-5 ${
                isDark
                  ? "border-slate-700 bg-slate-900/80"
                  : "border-slate-300 bg-slate-50"
              }`}
            >
              <div
                className={`text-lg font-semibold mb-4 ${
                  isDark ? "text-cyan-300" : "text-blue-800"
                }`}
              >
                Review Answers
              </div>

              <div className="space-y-4">
                {wrongQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-950/70"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className={
                        isDark
                          ? "text-red-300 font-medium mb-2"
                          : "text-red-700 font-medium mb-2"
                      }
                    >
                      {q.question}
                    </div>

                    <div
                      className={`text-sm mb-1 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Your answer:{" "}
                      <span className={isDark ? "text-red-300" : "text-red-700"}>
                        {answers[q.id] || "No answer"}
                      </span>
                    </div>

                    <div
                      className={`text-sm mb-2 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Correct answer:{" "}
                      <span
                        className={isDark ? "text-green-300" : "text-green-700"}
                      >
                        {q.correctAnswer}
                      </span>
                    </div>

                    <div
                      className={`text-sm ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default PreQuizStep;
