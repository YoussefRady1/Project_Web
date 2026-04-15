function AnimationController({ step, setStep, theme }) {
  const isDark = theme === "dark";

  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={() => setStep((s) => Math.max(s - 1, 0))}
        className={`px-4 py-2 rounded transition ${
          isDark
            ? "bg-slate-800 text-white hover:bg-slate-700"
            : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-100"
        }`}
      >
        Prev
      </button>

      <button
        onClick={() => setStep((s) => Math.min(s + 1, 6))}
        className={`px-4 py-2 rounded transition ${
          isDark
            ? "bg-cyan-500 text-black hover:bg-cyan-400"
            : "bg-blue-600 text-white hover:bg-blue-500"
        }`}
      >
        Next →
      </button>
    </div>
  );
}

export default AnimationController;