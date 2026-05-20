import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import decoderPreQuiz from "../data/decoderPreQuiz";

function DecoderPreQuizStep({
  active, theme,
  decoderPreCompleted, decoderPreScore,
  submitDecoderPreQuiz,
}) {
  const isDark = theme === "dark";
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(() => decoderPreQuiz, []);

  const scoreData = useMemo(() => {
    let correct = 0;
    questions.forEach((q) => { if (answers[q.id] === q.correctAnswer) correct += 1; });
    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  }, [answers, questions]);

  const wrongQuestions = questions.filter(
    (q) => submitted && answers[q.id] !== q.correctAnswer
  );

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    questions.forEach((q) => { if (answers[q.id] === q.correctAnswer) correct += 1; });
    const percentage = Math.round((correct / questions.length) * 100);
    submitDecoderPreQuiz(percentage);
  };

  if (decoderPreCompleted) {
    return (
      <motion.div animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }} transition={{ duration: 0.3 }}
        className={`p-6 border rounded-2xl w-[980px] min-h-[400px] flex flex-col items-center justify-center ${isDark ? "border-cyan-500 bg-transparent" : "border-blue-400/80 bg-white shadow-sm"}`}>
        <div className={`text-5xl mb-4 ${isDark ? "text-cyan-400" : "text-blue-600"}`}>✓</div>
        <h2 className={`text-xl font-semibold mb-3 ${isDark ? "text-cyan-300" : "text-blue-800"}`}>Decoder Pre-Quiz Already Completed</h2>
        <div className="text-3xl font-bold mb-2">
          <span className={isDark ? "text-white" : "text-slate-900"}>Your score: {decoderPreScore}%</span>
        </div>
        <p className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>You have already submitted this quiz. Use the Next button to continue.</p>
      </motion.div>
    );
  }

  return (
    <motion.div animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }} transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[1100px] min-h-[760px] flex flex-col items-center ${isDark ? "border-cyan-500 bg-transparent" : "border-blue-400/80 bg-white shadow-sm"}`}>
      <h2 className={`font-semibold text-center ${isDark ? "text-cyan-300" : "text-blue-800"}`}>Decoder Pre-Quiz: What Do You Already Know?</h2>
      <p className={`text-xs text-center mb-1 ${isDark ? "text-slate-400" : "text-slate-700"}`}>Test your intuition about the decoder before exploring it.</p>
      <p className={`text-[11px] text-center mb-4 max-w-[700px] leading-5 ${isDark ? "text-slate-500" : "text-slate-600"}`}>
        Don't worry if you don't know the answers yet this quiz is designed to activate your thinking before you explore the decoder steps in detail.
      </p>

      <div className="w-full space-y-4">
        {questions.map((q, index) => (
          <div key={q.id} className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-400/70 bg-slate-50"}`}>
            <div className={`font-medium mb-3 ${isDark ? "text-cyan-300" : "text-blue-800"}`}>{index + 1}. {q.question}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((option) => {
                const isSelected = answers[q.id] === option;
                const isCorrect = submitted && option === q.correctAnswer;
                const isWrongSelected = submitted && isSelected && option !== q.correctAnswer;
                return (
                  <button key={option} onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                    className={`text-left px-4 py-3 rounded-lg border transition ${isCorrect ? isDark ? "border-green-400 text-green-300 bg-green-400/10" : "border-green-500 text-green-700 bg-green-100" : isWrongSelected ? isDark ? "border-red-400 text-red-300 bg-red-400/10" : "border-red-400 text-red-700 bg-red-100" : isSelected ? isDark ? "border-cyan-400 text-cyan-300 bg-cyan-400/10" : "border-blue-400 text-blue-800 bg-blue-100" : isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                    disabled={submitted}>{option}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} className={`mt-6 px-6 py-2 rounded-lg border transition ${isDark ? "border-cyan-400 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20" : "border-blue-400 text-blue-800 bg-blue-100 hover:bg-blue-200"}`}>Submit Decoder Pre-Quiz</button>
      ) : (
        <div className="w-full mt-6 space-y-5">
          <div className={`rounded-xl border p-5 text-center ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-400/70 bg-slate-50"}`}>
            <div className={`text-lg font-semibold mb-2 ${isDark ? "text-cyan-300" : "text-blue-800"}`}>Your Decoder Pre-Quiz Score</div>
            <div className="text-3xl font-bold"><span className={isDark ? "text-white" : "text-slate-900"}>{scoreData.correct} / {scoreData.total}</span></div>
            <div className={`mt-2 text-lg ${isDark ? "text-cyan-300" : "text-blue-800"}`}>{scoreData.percentage}%</div>
            <p className={`mt-3 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {scoreData.percentage >= 70
                ? "Great foundation! Let's see how the decoder visualizations deepen your understanding."
                : "No worries the upcoming decoder steps will teach you everything. Press Next to continue!"}
            </p>
          </div>
          {wrongQuestions.length > 0 && (
            <div className={`rounded-xl border p-5 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-400/70 bg-slate-50"}`}>
              <div className={`text-lg font-semibold mb-4 ${isDark ? "text-cyan-300" : "text-blue-800"}`}>Review Answers</div>
              <div className="space-y-4">
                {wrongQuestions.map((q) => (
                  <div key={q.id} className={`rounded-lg border p-4 ${isDark ? "border-slate-700 bg-slate-950/70" : "border-slate-400/70 bg-white"}`}>
                    <div className={isDark ? "text-red-300 font-medium mb-2" : "text-red-700 font-medium mb-2"}>{q.question}</div>
                    <div className={`text-sm mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Your answer: <span className={isDark ? "text-red-300" : "text-red-700"}>{answers[q.id] || "No answer"}</span></div>
                    <div className={`text-sm mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Correct answer: <span className={isDark ? "text-green-300" : "text-green-700"}>{q.correctAnswer}</span></div>
                    <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{q.explanation}</div>
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

export default DecoderPreQuizStep;
