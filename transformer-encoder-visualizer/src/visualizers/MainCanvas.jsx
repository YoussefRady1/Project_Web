import { motion, AnimatePresence } from "framer-motion";

import TokenStep from "../steps/TokenStep";
import EmbeddingStep from "../steps/EmbeddingStep";
import PositionalStep from "../steps/PositionalStep";
import AttentionStep from "../steps/AttentionStep";
import EncoderStackStep from "../steps/EncoderStackStep";
import FeedForwardStep from "../steps/FeedForwardStep";

const stepComponents = [
  TokenStep,
  EmbeddingStep,
  PositionalStep,
  AttentionStep,
  EncoderStackStep,
  FeedForwardStep,
];

const stepTitles = [
  "Tokenization",
  "Embedding",
  "Positional Encoding",
  "Self-Attention",
  "Encoder Stack",
  "Feed Forward",
];

function MainCanvas({ step, tokens }) {
  const StepComponent = stepComponents[step];
  const progress = ((step + 1) / stepComponents.length) * 100;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6">

      {/* 🔥 HEADER */}
      <div className="w-full max-w-[700px] mb-6">

        {/* STEP TEXT */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm">
            Step {step + 1} of {stepComponents.length}
          </span>

          <span className="text-cyan-300 font-semibold">
            {stepTitles[step]}
          </span>
        </div>

        {/* 🔥 PROGRESS BAR */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* 🔥 STEP CONTENT */}
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
            <StepComponent active tokens={tokens} />
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

export default MainCanvas;