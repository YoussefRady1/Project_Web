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
          className={`relative w-full h-2 rounded-full overflow-hidden ${
            isDark ? "bg-slate-800" : "bg-slate-300"
          }`}
        >
          <motion.div
            className={`h-full ${
              isDark
                ? "bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-400"
                : "bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            aria-hidden
            className="absolute top-0 h-full w-16 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
              mixBlendMode: "overlay",
            }}
            animate={{ left: ["-10%", "110%"] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.6,
            }}
          />
        </div>
      </div>

      <div className="w-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 28, scale: 0.965, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -28, scale: 0.965, filter: "blur(8px)" }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
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
