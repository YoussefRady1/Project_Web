import { motion, AnimatePresence } from "framer-motion";

import TransformerIntroStep from "../steps/TransformerIntroStep";
import PreQuizStep from "../steps/PreQuizStep";
import TransformerArchitectureStep from "../steps/TransformerArchitectureStep";
import TokenStep from "../steps/TokenStep";
import EmbeddingStep from "../steps/EmbeddingStep";
import PositionalStep from "../steps/PositionalStep";
import EncoderStackStep from "../steps/EncoderStackStep";
import EncoderOutputStep from "../steps/EncoderOutputStep";
import DecoderTransitionStep from "../steps/DecoderTransitionStep";
import DecoderTokenStep from "../steps/DecoderTokenStep";
import DecoderEmbeddingStep from "../steps/DecoderEmbeddingStep";
import DecoderPositionalStep from "../steps/DecoderPositionalStep";
import DecoderStackStep from "../steps/DecoderStackStep";
import DecoderLinearSoftmaxStep from "../steps/DecoderLinearSoftmaxStep";
import DecoderOutputStep from "../steps/DecoderOutputStep";
import EncoderPostQuizStep from "../steps/EncoderPostQuizStep";
import DecoderPreQuizStep from "../steps/DecoderPreQuizStep";
import DecoderPostQuizStep from "../steps/DecoderPostQuizStep";

const PAGE_CONFIG = [
  { component: TransformerIntroStep, title: "Transformer Overview", label: "Overview", section: "overview", keywords: "intro welcome start what is transformer introduction" },
  { component: PreQuizStep, title: "Encoder Pre-Quiz", label: "Pre-Quiz", section: "overview", keywords: "prequiz assessment baseline before encoder" },
  { component: TransformerArchitectureStep, title: "Architecture Overview", label: "Architecture", section: "architecture", keywords: "t5 model translation full diagram architecture" },
  { component: TokenStep, title: "Step 1: Tokenization", label: "Encoder 1 of 5", section: "encoder", keywords: "tokens splitting words pieces tokenize" },
  { component: EmbeddingStep, title: "Step 2: Embedding", label: "Encoder 2 of 5", section: "encoder", keywords: "vector word embedding numeric representation" },
  { component: PositionalStep, title: "Step 3: Positional Encoding", label: "Encoder 3 of 5", section: "encoder", keywords: "position order sine cosine positional" },
  { component: EncoderStackStep, title: "Step 4: Encoder Stack", label: "Encoder 4 of 5", section: "encoder", keywords: "self-attention feed forward add norm layers encoder layer stack" },
  { component: EncoderOutputStep, title: "Step 5: Encoder Output", label: "Encoder 5 of 5", section: "encoder", keywords: "encoder output context vectors final" },
  { component: EncoderPostQuizStep, title: "Encoder Post-Quiz", label: "Encoder Quiz", section: "encoder-quiz", keywords: "encoder quiz post test" },
  { component: DecoderPreQuizStep, title: "Decoder Pre-Quiz", label: "Decoder Pre-Quiz", section: "decoder-quiz", keywords: "decoder pre quiz" },
  { component: DecoderTransitionStep, title: "Encoder → Decoder Transfer", label: "Transition", section: "decoder", keywords: "transition transfer bridge memory k v keys values" },
  { component: DecoderTokenStep, title: "Step 1: Output Tokenization", label: "Decoder 1 of 4", section: "decoder", keywords: "start token autoregressive decoder tokens output tokenization" },
  { component: DecoderEmbeddingStep, title: "Step 2: Output Embedding", label: "Decoder 2 of 4", section: "decoder", keywords: "decoder embedding output embedding start vector" },
  { component: DecoderPositionalStep, title: "Step 3: Positional Encoding", label: "Decoder 3 of 4", section: "decoder", keywords: "decoder positional position" },
  { component: DecoderStackStep, title: "Step 4: Decoder Stack", label: "Decoder 4 of 4", section: "decoder", keywords: "masked attention cross attention decoder layer feed forward add norm" },
  { component: DecoderLinearSoftmaxStep, title: "Linear + Softmax", label: "Linear + Softmax", section: "linear", keywords: "probabilities softmax vocab vocabulary linear projection" },
  { component: DecoderOutputStep, title: "Output Prediction", label: "Output", section: "output", keywords: "generation output tokens predict prediction final" },
  { component: DecoderPostQuizStep, title: "Decoder Post-Quiz", label: "Final Quiz", section: "final-quiz", keywords: "final quiz decoder post" },
];

export { PAGE_CONFIG };

const SECTION_MAP = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "encoder", label: "Encoder" },
  { id: "encoder-quiz", label: "Encoder Quiz" },
  { id: "decoder-quiz", label: "Decoder Quiz" },
  { id: "decoder", label: "Decoder" },
  { id: "linear", label: "Linear + Softmax" },
  { id: "output", label: "Output" },
  { id: "final-quiz", label: "Final Quiz" },
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
  encoderPostCompleted,
  encoderPostScore,
  submitEncoderPostQuiz,
  decoderPreCompleted,
  decoderPreScore,
  submitDecoderPreQuiz,
  decoderPostCompleted,
  decoderPostScore,
  submitDecoderPostQuiz,
  resetSession,
}) {
  const config = PAGE_CONFIG[step];
  const StepComponent = config.component;
  const progress = ((step + 1) / TOTAL_PAGES) * 100;
  const isDark = theme === "dark";
  const currentSection = config.section;

  const sectionOrder = SECTION_MAP.map((s) => s.id);
  const currentIdx = sectionOrder.indexOf(currentSection);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 right-3 z-20">
        <div
          className={`rounded-xl border px-3 py-3 backdrop-blur-sm transition-colors duration-300 ${
            isDark
              ? "border-slate-700/60 bg-slate-900/85"
              : "border-slate-400/60 bg-white/90 shadow-md"
          }`}
        >
          {SECTION_MAP.map((sec, i) => {
            const secIdx = sectionOrder.indexOf(sec.id);
            const isActive = sec.id === currentSection;
            const isPast = secIdx < currentIdx;

            return (
              <div key={sec.id}>
                <button
                  onClick={() => {
                    const target = PAGE_CONFIG.findIndex(
                      (p) => p.section === sec.id
                    );
                    if (target >= 0) setStep(target);
                  }}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? "bg-cyan-400/15 text-cyan-300"
                        : "bg-blue-100 text-blue-800 font-bold"
                      : isPast
                      ? isDark
                        ? "text-green-400/80 hover:bg-green-400/10"
                        : "text-green-700 hover:bg-green-50"
                      : isDark
                      ? "text-slate-500 hover:bg-slate-800"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]"
                          : "bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.4)]"
                        : isPast
                        ? isDark
                          ? "bg-green-400/60"
                          : "bg-green-600"
                        : isDark
                        ? "bg-slate-600"
                        : "bg-slate-400"
                    }`}
                  />
                  {sec.label}
                </button>
                {i < SECTION_MAP.length - 1 && (
                  <div className="flex justify-start pl-3 py-0.5">
                    <div
                      className={`w-px h-2 transition-colors duration-200 ${
                        isPast
                          ? isDark
                            ? "bg-green-400/30"
                            : "bg-green-500/40"
                          : isDark
                          ? "bg-slate-700"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[700px] mb-5">
          <div className="flex justify-between items-center mb-2">
            <span
              className={
                isDark ? "text-slate-400 text-sm" : "text-slate-700 text-sm font-medium"
              }
            >
              {config.label}
            </span>

            <span
              className={
                isDark
                  ? "text-cyan-300 font-semibold"
                  : "text-blue-800 font-bold"
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
                  : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500"
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
                encoderPostCompleted={encoderPostCompleted}
                encoderPostScore={encoderPostScore}
                submitEncoderPostQuiz={submitEncoderPostQuiz}
                decoderPreCompleted={decoderPreCompleted}
                decoderPreScore={decoderPreScore}
                submitDecoderPreQuiz={submitDecoderPreQuiz}
                decoderPostCompleted={decoderPostCompleted}
                decoderPostScore={decoderPostScore}
                submitDecoderPostQuiz={submitDecoderPostQuiz}
                resetSession={resetSession}
                {...(config.props || {})}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default MainCanvas;
