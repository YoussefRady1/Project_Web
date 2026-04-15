import { motion } from "framer-motion";

function TransformerIntroStep({ active, theme }) {
  const isDark = theme === "dark";

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[980px] min-h-[620px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-300 bg-white"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        What is a Transformer?
      </h2>

      <p
        className={`text-xs text-center mb-5 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        A Transformer is a deep learning architecture used to understand and generate sequences such as text.
      </p>

      <div
        className={`w-full max-w-[760px] mb-5 rounded-xl border p-4 ${
          isDark
            ? "border-cyan-400/30 bg-cyan-400/5"
            : "border-blue-300 bg-blue-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-2 ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          What it does
        </div>

        <p
          className={`text-[11px] leading-5 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          The Transformer takes an input sequence, builds contextual understanding of it,
          and then can generate an output sequence. It is widely used in translation,
          summarization, question answering, and many other language tasks.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div
          className={`rounded-xl border p-5 ${
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
            Encoder
          </div>

          <p
            className={`text-[11px] leading-5 mb-3 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            The encoder reads the input sentence and creates contextual representations
            for all input words.
          </p>

          <div className="space-y-2 text-xs">
            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              Input sentence
            </div>
            <div className={`text-center ${isDark ? "text-cyan-400" : "text-blue-600"}`}>↓</div>
            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              Context-aware encoder outputs
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 ${
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
            Decoder
          </div>

          <p
            className={`text-[11px] leading-5 mb-3 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            The decoder uses the encoder outputs as memory and generates the output
            sequence step by step.
          </p>

          <div className="space-y-2 text-xs">
            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              Encoder memory + previous output tokens
            </div>
            <div className={`text-center ${isDark ? "text-cyan-400" : "text-blue-600"}`}>↓</div>
            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-700 bg-slate-950/60 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              Generated output sequence
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border p-4 ${
          isDark
            ? "border-slate-700 bg-slate-900/70"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-2 ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Transformer flow
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <div
            className={`px-3 py-2 rounded-lg border ${
              isDark
                ? "border-slate-700 bg-slate-950/60 text-white"
                : "border-slate-300 bg-white text-slate-900"
            }`}
          >
            Input
          </div>

          <span className={isDark ? "text-cyan-400" : "text-blue-600"}>→</span>

          <div
            className={`px-3 py-2 rounded-lg border ${
              isDark
                ? "border-slate-700 bg-slate-950/60 text-white"
                : "border-slate-300 bg-white text-slate-900"
            }`}
          >
            Encoder
          </div>

          <span className={isDark ? "text-cyan-400" : "text-blue-600"}>→</span>

          <div
            className={`px-3 py-2 rounded-lg border ${
              isDark
                ? "border-slate-700 bg-slate-950/60 text-white"
                : "border-slate-300 bg-white text-slate-900"
            }`}
          >
            Decoder
          </div>

          <span className={isDark ? "text-cyan-400" : "text-blue-600"}>→</span>

          <div
            className={`px-3 py-2 rounded-lg border ${
              isDark
                ? "border-slate-700 bg-slate-950/60 text-white"
                : "border-slate-300 bg-white text-slate-900"
            }`}
          >
            Output
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TransformerIntroStep;