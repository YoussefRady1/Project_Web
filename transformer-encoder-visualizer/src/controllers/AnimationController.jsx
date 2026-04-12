function AnimationController({ step, setStep }) {
  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={() => setStep((s) => Math.max(s - 1, 0))}
        className="px-4 py-2 bg-slate-800 rounded"
      >
        Prev
      </button>

      <button
        onClick={() => setStep((s) => Math.min(s + 1, 4))}
        className="px-4 py-2 bg-cyan-500 text-black rounded"
      >
        Next →
      </button>
    </div>
  );
}

export default AnimationController;