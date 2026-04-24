import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import encoderQuiz from "../data/encoderQuiz";

const STEP_INDEX_TO_PAGE = { 0: 3, 1: 4, 2: 5, 3: 6, 4: 7 };
const POST_QUIZ_ANSWERS_KEY = "postQuizAnswers";

function CountUp({ value, isDark, delay = 0, duration = 1.4 }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [value, delay, duration, mv]);
  return (
    <span className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
      <motion.span>{rounded}</motion.span>
      <span className={`text-base ml-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>%</span>
    </span>
  );
}

function EncoderQuizStep({ active, setStep, theme, preQuizScore, postQuizCompleted, postQuizScore, submitPostQuiz }) {
  const isDark = theme === "dark";
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(POST_QUIZ_ANSWERS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const selectedQuestions = useMemo(() => encoderQuiz, []);

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

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    selectedQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct += 1;
    });
    const percentage = Math.round((correct / selectedQuestions.length) * 100);
    try {
      localStorage.setItem(POST_QUIZ_ANSWERS_KEY, JSON.stringify(answers));
    } catch {}
    submitPostQuiz(percentage);
  };

  if (postQuizCompleted) {
    const pre = Number(preQuizScore) || 0;
    const post = Number(postQuizScore) || 0;
    const growth = post - pre;
    const growthPct = pre > 0 ? Math.round(((post - pre) / pre) * 100) : post;
    const isImprovement = growth > 0;
    const isSame = growth === 0;

    const reviewWrong = encoderQuiz.filter(
      (q) => answers[q.id] !== undefined && answers[q.id] !== q.correctAnswer
    );
    const isPerfect = post >= 100 || reviewWrong.length === 0;

    let message = "";
    let emoji = "";
    let badge = "";
    if (isImprovement && growth >= 30) {
      message = "Outstanding growth! You've made a huge leap in understanding.";
      emoji = "🚀";
      badge = "Transformer Master";
    } else if (isImprovement && growth >= 10) {
      message = "Great progress! The visualizations clearly helped you.";
      emoji = "📈";
      badge = "Rising Star";
    } else if (isImprovement) {
      message = "Nice improvement! Every bit of learning counts.";
      emoji = "✨";
      badge = "Steady Learner";
    } else if (isSame) {
      message = "You maintained your knowledge — consistency is key.";
      emoji = "💡";
      badge = "Consistent Performer";
    } else {
      message = "Learning isn't always linear. Revisit the steps to reinforce concepts.";
      emoji = "🔄";
      badge = "Reviewer in Training";
    }

    const accentText = isImprovement
      ? isDark ? "text-green-300" : "text-green-700"
      : isSame
      ? isDark ? "text-slate-300" : "text-slate-700"
      : isDark ? "text-amber-300" : "text-amber-700";
    const accentBorder = isImprovement
      ? isDark ? "border-green-400/40" : "border-green-300"
      : isSame
      ? isDark ? "border-slate-600" : "border-slate-300"
      : isDark ? "border-amber-400/40" : "border-amber-300";
    const accentBg = isImprovement
      ? isDark ? "bg-green-400/5" : "bg-green-50"
      : isSame
      ? isDark ? "bg-slate-900/60" : "bg-slate-50"
      : isDark ? "bg-amber-400/5" : "bg-amber-50";

    const RingChart = ({ value, label, sublabel, accent, delay }) => {
      const R = 52;
      const C = 2 * Math.PI * R;
      return (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay, type: "spring", stiffness: 200, damping: 22 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-[140px] h-[140px]">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
              <circle
                cx="70" cy="70" r={R}
                fill="none"
                strokeWidth="10"
                className={isDark ? "stroke-slate-800" : "stroke-slate-200"}
              />
              <motion.circle
                cx="70" cy="70" r={R}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                className={accent}
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: C - (C * value) / 100 }}
                transition={{ duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{
                scale: [0.85, 1.05, 1],
                opacity: 1,
              }}
              transition={{
                delay: delay + 0.3,
                duration: 0.7,
                times: [0, 0.6, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <CountUp
                value={value}
                isDark={isDark}
                delay={delay + 0.2}
                duration={1.6}
              />
              <span className={`text-[10px] uppercase tracking-wider mt-0.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                {sublabel}
              </span>
            </motion.div>
          </div>
          <div className={`mt-3 text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {label}
          </div>
        </motion.div>
      );
    };

    return (
      <motion.div
        animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
        transition={{ duration: 0.3 }}
        className={`relative p-10 border rounded-3xl w-[980px] min-h-[620px] overflow-hidden ${
          isDark
            ? "border-cyan-500/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            : "border-blue-300 bg-gradient-to-br from-white via-blue-50/40 to-white"
        }`}
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className={`pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl ${
            isDark ? "bg-cyan-500" : "bg-blue-300"
          }`}
        />
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.3, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className={`pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full blur-3xl ${
            isImprovement ? (isDark ? "bg-green-500" : "bg-green-300")
            : isSame ? (isDark ? "bg-slate-500" : "bg-slate-300")
            : isDark ? "bg-amber-500" : "bg-amber-300"
          }`}
        />

        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.1 }}
            className="text-7xl mb-3 drop-shadow-lg"
          >
            {emoji}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-3 border ${accentBorder} ${accentBg} ${accentText}`}
          >
            {badge}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${
              isDark ? "from-cyan-300 via-cyan-200 to-blue-300" : "from-blue-800 via-blue-600 to-cyan-600"
            }`}
          >
            Your Learning Analysis
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-sm text-center mb-8 max-w-[620px] ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {message}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`w-full rounded-2xl border backdrop-blur-sm p-8 mb-6 ${
              isDark ? "border-slate-700/70 bg-slate-900/60" : "border-slate-200 bg-white/70"
            }`}
          >
            <div className="grid grid-cols-3 gap-6 items-center">
              <RingChart
                value={pre}
                label="Before Learning"
                sublabel="Pre-Quiz"
                accent={isDark ? "stroke-slate-400" : "stroke-slate-500"}
                delay={0.7}
              />

              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    y: [0, -4, 0],
                  }}
                  transition={{
                    opacity: { delay: 1.0, duration: 0.45 },
                    scale: { delay: 1.0, type: "spring", stiffness: 180, damping: 12 },
                    rotate: { delay: 1.0, type: "spring", stiffness: 180, damping: 12 },
                    y: { delay: 1.6, duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className={`text-7xl font-extrabold leading-none ${accentText}`}
                >
                  {isImprovement ? "↑" : isSame ? "→" : "↓"}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 220, damping: 22 }}
                  className="mt-2 flex items-baseline gap-1"
                >
                  <span className={`text-4xl font-extrabold ${accentText}`}>
                    {isImprovement ? "+" : ""}{growth}
                  </span>
                  <span className={`text-base font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    pts
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className={`text-[11px] uppercase tracking-wider mt-1 ${
                    isDark ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Growth
                </motion.div>
              </div>

              <RingChart
                value={post}
                label="After Learning"
                sublabel="Post-Quiz"
                accent={isDark ? "stroke-cyan-400" : "stroke-blue-500"}
                delay={0.9}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 }}
            className={`w-full rounded-2xl border p-5 flex items-center justify-between gap-4 ${accentBorder} ${accentBg}`}
          >
            <div>
              <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${accentText}`}>
                Insight
              </div>
              <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {isImprovement
                  ? `That's a ${growthPct}% relative improvement — the visualizations are working for you.`
                  : isSame
                  ? "You held steady from start to finish — your prior knowledge is solid."
                  : `${Math.abs(growthPct)}% relative dip — try revisiting the attention and encoder steps.`}
              </div>
            </div>
            <div className={`text-3xl font-bold ${accentText}`}>
              {isImprovement ? "+" : ""}{growthPct}%
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className={`text-xs mt-6 flex items-center gap-1.5 ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isDark ? "bg-green-400" : "bg-green-500"}`} />
            Your results have been saved
          </motion.p>

          {!isPerfect && showReview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`w-full mt-8 rounded-2xl border p-6 ${
                isDark
                  ? "border-slate-700/70 bg-slate-900/60"
                  : "border-slate-200 bg-white/80"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div
                    className={`text-lg font-semibold ${
                      isDark ? "text-cyan-300" : "text-blue-800"
                    }`}
                  >
                    Review Mistakes
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isDark ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    {reviewWrong.length} question{reviewWrong.length === 1 ? "" : "s"} to revisit — jump back to the matching step to study it again.
                  </div>
                </div>
                <button
                  onClick={() => setShowReview(false)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    isDark
                      ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                      : "border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Hide
                </button>
              </div>

              <div className="space-y-4">
                {reviewWrong.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-950/60"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDark
                            ? "bg-red-400/10 border border-red-400/40 text-red-300"
                            : "bg-red-100 border border-red-300 text-red-700"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        {q.question}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 ml-10">
                      <div
                        className={`rounded-lg border px-3 py-2 ${
                          isDark
                            ? "border-red-400/30 bg-red-400/5"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div
                          className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${
                            isDark ? "text-red-400" : "text-red-700"
                          }`}
                        >
                          Your answer
                        </div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-red-200" : "text-red-800"
                          }`}
                        >
                          {answers[q.id] || "No answer"}
                        </div>
                      </div>
                      <div
                        className={`rounded-lg border px-3 py-2 ${
                          isDark
                            ? "border-green-400/30 bg-green-400/5"
                            : "border-green-200 bg-green-50"
                        }`}
                      >
                        <div
                          className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${
                            isDark ? "text-green-400" : "text-green-700"
                          }`}
                        >
                          Correct answer
                        </div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-green-200" : "text-green-800"
                          }`}
                        >
                          {q.correctAnswer}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-xs mb-3 ml-10 leading-5 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {q.explanation}
                    </div>

                    <div className="ml-10">
                      <button
                        onClick={() =>
                          setStep(STEP_INDEX_TO_PAGE[q.stepIndex] ?? q.stepIndex)
                        }
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                          isDark
                            ? "border-cyan-400/60 text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20"
                            : "border-blue-400 text-blue-800 bg-blue-50 hover:bg-blue-100"
                        }`}
                      >
                        <span>Revisit {q.stepLabel}</span>
                        <span aria-hidden>→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {!isPerfect && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.7 }}
            onClick={() => setShowReview((v) => !v)}
            className={`absolute bottom-5 left-5 z-10 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition ${
              isDark
                ? "border-slate-700 text-slate-300 bg-slate-900/70 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 bg-white/80 hover:bg-slate-100"
            }`}
          >
            {showReview ? "Hide Mistakes" : `Review Mistakes (${reviewWrong.length})`}
          </motion.button>
        )}
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
        Post-Quiz: Test Your Understanding
      </h2>

      <p
        className={`text-xs text-center mb-3 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        Now that you've explored every step, let's see how much you've learned!
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
          onClick={handleSubmit}
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
                      onClick={() => setStep(STEP_INDEX_TO_PAGE[q.stepIndex] ?? q.stepIndex)}
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
        </div>
      )}
    </motion.div>
  );
}

export default EncoderQuizStep;
