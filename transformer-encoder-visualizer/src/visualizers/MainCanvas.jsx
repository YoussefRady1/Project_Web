import { motion, AnimatePresence } from "framer-motion";

import TokenStep from "../steps/TokenStep";
import EmbeddingStep from "../steps/EmbeddingStep";
import PositionalStep from "../steps/PositionalStep";
import EncoderStackStep from "../steps/EncoderStackStep";
import EncoderOutputStep from "../steps/EncoderOutputStep";
import EncoderQuizStep from "../steps/EncoderQuizStep";
import TransformerIntroStep from "../steps/TransformerIntroStep";

const stepComponents = [
  TransformerIntroStep,
  TokenStep,
  EmbeddingStep,
  PositionalStep,
  EncoderStackStep,
  EncoderOutputStep,
  EncoderQuizStep,
];

const stepTitles = [
  "What is Transformer?",
  "Tokenization",
  "Embedding",
  "Positional Encoding",
  "Encoder Stack",
  "Encoder Output",
  "Encoder Quiz",
];

function MainCanvas({ step, setStep, tokens, theme }) {
  const StepComponent = stepComponents[step];
  const progress = ((step + 1) / stepComponents.length) * 100;
  const isDark = theme === "dark";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[700px] mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={isDark ? "text-slate-400 text-sm" : "text-slate-700 text-sm"}>
            Step {step + 1} of {stepComponents.length}
          </span>

          <span className={isDark ? "text-cyan-300 font-semibold" : "text-blue-800 font-semibold"}>
            {stepTitles[step]}
          </span>
        </div>

        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-300"}`}>
          <motion.div
            className="h-full bg-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="w-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="w-full flex items-center justify-center"
          >
            <StepComponent active tokens={tokens} setStep={setStep} theme={theme} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MainCanvas;