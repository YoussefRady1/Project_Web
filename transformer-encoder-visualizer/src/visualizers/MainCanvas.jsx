import { motion, AnimatePresence } from "framer-motion";

import TransformerIntroStep from "../steps/TransformerIntroStep";
import PreQuizStep from "../steps/PreQuizStep";
import TransformerArchitectureStep from "../steps/TransformerArchitectureStep";
import TokenStep from "../steps/TokenStep";
import EmbeddingStep from "../steps/EmbeddingStep";
import PositionalStep from "../steps/PositionalStep";
import EncoderStackStep from "../steps/EncoderStackStep";
import EncoderOutputStep from "../steps/EncoderOutputStep";
import EncoderQuizStep from "../steps/EncoderQuizStep";

const PAGE_CONFIG = [
  { component: TransformerIntroStep, title: "Transformer Overview", label: "Overview" },
  { component: PreQuizStep, title: "Pre-Quiz", label: "Pre-Quiz" },
  { component: TransformerArchitectureStep, title: "Architecture Overview", label: "Architecture" },
  { component: TokenStep, title: "Step 1: Tokenization", label: "Step 1 of 5" },
  { component: EmbeddingStep, title: "Step 2: Embedding", label: "Step 2 of 5" },
  { component: PositionalStep, title: "Step 3: Positional Encoding", label: "Step 3 of 5" },
  { component: EncoderStackStep, title: "Step 4: Encoder Stack", label: "Step 4 of 5" },
  { component: EncoderOutputStep, title: "Step 5: Encoder Output", label: "Step 5 of 5" },
  { component: EncoderQuizStep, title: "Post-Quiz", label: "Final Quiz" },
];

export const TOTAL_PAGES = PAGE_CONFIG.length;

export const FIRST_PAGE_NEEDING_TOKENS = 3;

function MainCanvas({
  step,
  setStep,
  tokens,
  theme,
  userName,
  setUserName,
  preQuizCompleted,
  postQuizCompleted,
  preQuizScore,
  postQuizScore,
  submitPreQuiz,
  submitPostQuiz,
}) {
  const config = PAGE_CONFIG[step];
  const StepComponent = config.component;
  const progress = ((step + 1) / TOTAL_PAGES) * 100;
  const isDark = theme === "dark";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[700px] mb-6">
        <div className="flex justify-between items-center mb-2">
          <span
            className={
              isDark ? "text-slate-400 text-sm" : "text-slate-700 text-sm"
            }
          >
            {config.label}
          </span>

          <span
            className={
              isDark
                ? "text-cyan-300 font-semibold"
                : "text-blue-800 font-semibold"
            }
          >
            {config.title}
          </span>
        </div>

        <div
          className={`w-full h-2 rounded-full overflow-hidden ${
            isDark ? "bg-slate-800" : "bg-slate-300"
          }`}
        >
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
            <StepComponent
              active
              tokens={tokens}
              setStep={setStep}
              theme={theme}
              userName={userName}
              setUserName={setUserName}
              preQuizCompleted={preQuizCompleted}
              postQuizCompleted={postQuizCompleted}
              preQuizScore={preQuizScore}
              postQuizScore={postQuizScore}
              submitPreQuiz={submitPreQuiz}
              submitPostQuiz={submitPostQuiz}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MainCanvas;
