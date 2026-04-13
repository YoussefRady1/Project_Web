import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import encoderQuiz from "../data/encoderQuiz";

function shuffleQuestions(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function EncoderQuizStep({ active, setStep, theme }) {
  const isDark = theme === "dark";
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizSeed, setQuizSeed] = useState(0);

  const selectedQuestions = useMemo(() => {
    return shuffleQuestions(encoderQuiz).slice(0, 12);
  }, [quizSeed]);

  const scoreData = useMemo(() => {
    let correct = 0;

    selectedQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct += 1;
      }
    });

    const total = selectedQuestions.length;
    const percentage = Math.round((correct / total) * 100);

    return { correct, total, percentage };
  }, [answers, selectedQuestions]);

  const wrongQuestions = selectedQuestions.filter(
    (q) => submitted && answers[q.id] !== q.correctAnswer
  );

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
        Encoder Quiz
      </h2>

      <p
        className={`text-xs text-center mb-3 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
         
      </p>

      

    

      <div className="w-full space-y-4">
        {selectedQuestions.map((q, index) => (
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
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: option,
                      }))
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
          onClick={() => setSubmitted(true)}
          className={`mt-6 px-6 py-2 rounded-lg border transition ${
            isDark
              ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
              : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
          }`}
        >
          Submit Quiz
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
              Your Grade
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
                Review Wrong Answers
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
                    <div className={isDark ? "text-red-300 font-medium mb-2" : "text-red-700 font-medium mb-2"}>
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
                      <span className={isDark ? "text-green-300" : "text-green-700"}>
                        {q.correctAnswer}
                      </span>
                    </div>

                    <div
                      className={`text-sm mb-3 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {q.explanation}
                    </div>

                    <button
                      onClick={() => setStep(q.stepIndex)}
                      className={`px-4 py-2 rounded-lg border transition text-sm ${
                        isDark
                          ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
                          : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
                      }`}
                    >
                      Go to {q.stepLabel} Again
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className={`px-5 py-2 rounded-lg border transition ${
                isDark
                  ? "border-slate-600 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Try Same Quiz Again
            </button>

            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
                setQuizSeed((prev) => prev + 1);
              }}
              className={`px-5 py-2 rounded-lg border transition ${
                isDark
                  ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
                  : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"
              }`}
            >
              Generate New 12 Questions
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default EncoderQuizStep;