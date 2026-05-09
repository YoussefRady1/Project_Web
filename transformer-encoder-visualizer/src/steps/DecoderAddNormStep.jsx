import { motion } from "framer-motion";
import { useMemo } from "react";

function generateEmbeddingVector(word) {
  const cleanWord = (word || "").toLowerCase();
  if (!cleanWord) return [0, 0, 0, 0];
  const chars = cleanWord.split("");
  const codes = chars.map((c) => c.charCodeAt(0));
  const sum = codes.reduce((a, c) => a + c, 0);
  const first = codes[0] || 0;
  const last = codes[codes.length - 1] || 0;
  const length = cleanWord.length;
  const vowelCount = chars.filter((c) => "aeiou".includes(c)).length;
  return [
    Number(((sum % 100) / 100).toFixed(2)),
    Number((((first * length) % 100) / 100).toFixed(2)),
    Number((((last + vowelCount * 7) % 100) / 100).toFixed(2)),
    Number(((((sum + first + last + length) * 3) % 100) / 100).toFixed(2)),
  ];
}

const START_VECTOR = [0.2, 0.7, 0.1, 0.4];

function getDecoderEmbedding(token) {
  if (token === "<START>") return START_VECTOR;
  return generateEmbeddingVector(token);
}

function generatePositionVector(position) {
  const pos = position + 1;
  return [
    Number(((pos * 0.1) % 1).toFixed(2)),
    Number(((pos * 0.2) % 1).toFixed(2)),
    Number(((pos * 0.3) % 1).toFixed(2)),
    Number(((pos * 0.4) % 1).toFixed(2)),
  ];
}

function addVectors(a, b) {
  return a.map((v, i) => Number((v + b[i]).toFixed(2)));
}

function normalizeVector(vec) {
  const mean = vec.reduce((a, v) => a + v, 0) / vec.length;
  const variance =
    vec.reduce((a, v) => a + (v - mean) ** 2, 0) / vec.length;
  const std = Math.sqrt(variance + 0.001);
  return vec.map((v) => Number(((v - mean) / std).toFixed(2)));
}

const VARIANT_CONFIG = {
  "masked-attention": {
    title: "Add & Normalize (after Masked Self-Attention)",
    subtitle: "Residual connection + layer normalization after masked attention",
    prevStep: "Masked Self-Attention",
    explanation:
      "After masked self-attention, we add the original input back (residual connection) and normalize. This preserves the original token information while incorporating the attention-refined context from past tokens.",
    sublayerShift: [0.08, -0.05, 0.12, -0.03],
  },
  "cross-attention": {
    title: "Add & Normalize (after Cross-Attention)",
    subtitle:
      "Residual connection + layer normalization after encoder-decoder attention",
    prevStep: "Cross-Attention",
    explanation:
      "After cross-attention with the encoder outputs, we again add the input back and normalize. This stabilizes the vector that now contains information from both the decoder's own context and the encoder's understanding of the input.",
    sublayerShift: [0.11, -0.07, 0.04, -0.09],
  },
  "feed-forward": {
    title: "Add & Normalize (after Feed Forward)",
    subtitle:
      "Residual connection + layer normalization after the feed-forward network",
    prevStep: "Feed Forward",
    explanation:
      "After the feed-forward transformation, we add the input back and normalize one final time. This produces the final decoder layer output — a stable, well-conditioned vector ready for the next layer or the output projection.",
    sublayerShift: [0.06, -0.11, 0.09, -0.02],
  },
};

function DecoderAddNormStep({ active, tokens = [], theme, variant = "masked-attention" }) {
  const isDark = theme === "dark";
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG["masked-attention"];

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 6) : ["token"]),
    [tokens]
  );

  const decoderTokens = useMemo(
    () => ["<START>", ...safeTokens],
    [safeTokens]
  );

  const rows = useMemo(
    () =>
      decoderTokens.map((tok, i) => {
        const emb = getDecoderEmbedding(tok);
        const pos = generatePositionVector(i);
        const input = addVectors(emb, pos);
        const sublayerOutput = input.map((v, j) =>
          Number((v + config.sublayerShift[j]).toFixed(2))
        );
        const residual = addVectors(input, sublayerOutput);
        const normalized = normalizeVector(residual);
        return { token: tok, input, sublayerOutput, residual, normalized };
      }),
    [decoderTokens, config.sublayerShift]
  );

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[980px] min-h-[620px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-400/80 bg-white shadow-sm"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        {config.title}
      </h2>

      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        {config.subtitle}
      </p>

      <div
        className={`w-full max-w-[760px] mb-5 rounded-xl border p-3 ${
          isDark
            ? "border-cyan-400/30 bg-cyan-400/5"
            : "border-blue-400 bg-blue-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-1 ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Why we use this step
        </div>
        <p
          className={`text-[11px] leading-5 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {config.explanation}
        </p>
        <p className={`text-[10px] italic mt-2 pt-2 ${isDark ? "border-t border-slate-700/50 text-cyan-300/70" : "border-t border-slate-300/50 text-blue-600/80"}`}>
          {variant === "masked-attention"
            ? "Like keeping a photocopy of your original draft before editing — if the edits go wrong, you still have the original."
            : variant === "cross-attention"
            ? "Like reviewing your notes after a meeting — you combine what you already knew with what you just learned."
            : "Like proofreading a paragraph — you keep the structure but polish the details."}
        </p>
      </div>

      {/* Data flow */}
      <div className="w-full max-w-[760px] mb-5 grid grid-cols-3 gap-2">
        <div className={`rounded-xl border p-3 ${isDark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-400 bg-emerald-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>From previous step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {variant === "masked-attention"
              ? "Both the original input vectors (before masked attention) AND the masked self-attention output. Two separate data streams arrive here."
              : variant === "cross-attention"
              ? "Both the vectors before cross-attention AND the cross-attention output. Again, two streams — the skip connection preserves the original signal."
              : "Both the vectors before feed-forward AND the feed-forward output. The third and final Add & Normalize in each decoder layer."}
          </p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-cyan-500/30 bg-cyan-500/5" : "border-blue-400 bg-blue-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-700"}`}>What happens here</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {variant === "masked-attention"
              ? "The residual connection adds the original input to the attention output (input + sublayer). Then layer normalization standardizes the values. This prevents the signal from degrading as it flows through layers."
              : variant === "cross-attention"
              ? "Same Add & Normalize process: residual addition then normalization. The residual connection ensures that even if cross-attention adds noise, the original information is preserved."
              : "Residual addition + layer normalization one final time. This completes one full decoder layer. In T5-small, there are 6 such layers stacked on top of each other."}
          </p>
        </div>
        <div className={`rounded-xl border p-3 ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-400 bg-amber-50"}`}>
          <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Goes to next step</div>
          <p className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {variant === "masked-attention"
              ? "Normalized vectors proceed to Cross-Attention, where the decoder will consult the encoder's understanding of the input sentence."
              : variant === "cross-attention"
              ? "Normalized vectors proceed to the Feed-Forward Network, which applies non-linear transformations to refine each token's representation."
              : "If more decoder layers remain, the output feeds into the next layer's Masked Self-Attention. After the final layer, the output goes to Linear + Softmax for word prediction."}
          </p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
        <div
          className={`rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-400/70 bg-slate-50"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            Residual connection
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              The original input to the sub-layer is{" "}
              <span className={isDark ? "text-white" : "text-slate-900"}>
                added back
              </span>{" "}
              to the sub-layer's output.
            </p>
            <div
              className={`rounded-lg border p-3 text-center text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-950/70 text-white"
                  : "border-slate-400/70 bg-white text-slate-900"
              }`}
            >
              output = input + {config.prevStep}(input)
            </div>
            <p>
              This helps gradients flow during training and preserves the
              original information.
            </p>
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-400/70 bg-slate-50"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            Layer normalization
          </h3>
          <div
            className={`text-[11px] leading-5 space-y-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <p>
              After adding, we normalize the result so values are balanced.
            </p>
            <div
              className={`rounded-lg border p-3 text-center text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-950/70 text-white"
                  : "border-slate-400/70 bg-white text-slate-900"
              }`}
            >
              norm(x) = (x − mean) / std
            </div>
            <p>
              This stabilizes learning and prevents values from growing too large
              or too small.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4">
        {rows.map((row, rIdx) => (
          <motion.div
            key={row.token + rIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: active ? 1 : 0.3, y: 0 }}
            transition={{ delay: rIdx * 0.08 }}
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-900/70"
                : "border-slate-400/70 bg-white"
            }`}
          >
            <div
              className={`text-sm font-medium mb-3 ${
                isDark ? "text-cyan-300" : "text-blue-800"
              }`}
            >
              {row.token}
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-[10px] min-w-[80px] ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Input:
              </span>
              {row.input.map((v, i) => (
                <span
                  key={`in-${rIdx}-${i}`}
                  className={`px-2 py-0.5 text-[11px] rounded border ${
                    isDark
                      ? "border-cyan-400 text-cyan-300"
                      : "border-blue-400 text-blue-800 bg-blue-100"
                  }`}
                >
                  {v.toFixed(2)}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-[10px] min-w-[80px] ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Sub-layer:
              </span>
              {row.sublayerOutput.map((v, i) => (
                <span
                  key={`sub-${rIdx}-${i}`}
                  className={`px-2 py-0.5 text-[11px] rounded border ${
                    isDark
                      ? "border-purple-400 text-purple-300"
                      : "border-violet-300 text-violet-700 bg-violet-100"
                  }`}
                >
                  {v.toFixed(2)}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-[10px] min-w-[80px] ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Add (residual):
              </span>
              <motion.span
                animate={
                  active
                    ? { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
                    : {}
                }
                transition={{ duration: 1.4, repeat: Infinity }}
                className={isDark ? "text-cyan-400 text-xs" : "text-blue-600 text-xs"}
              >
                +
              </motion.span>
              {row.residual.map((v, i) => (
                <span
                  key={`res-${rIdx}-${i}`}
                  className={`px-2 py-0.5 text-[11px] rounded border ${
                    isDark
                      ? "border-amber-400 text-amber-300"
                      : "border-amber-300 text-amber-700 bg-amber-100"
                  }`}
                >
                  {v.toFixed(2)}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] min-w-[80px] ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Normalized:
              </span>
              {row.normalized.map((v, i) => (
                <motion.span
                  key={`norm-${rIdx}-${i}`}
                  animate={
                    active
                      ? {
                          y: [0, -2, 0],
                          boxShadow: isDark
                            ? [
                                "0 0 0px rgba(74,222,128,0)",
                                "0 0 12px rgba(74,222,128,0.35)",
                                "0 0 0px rgba(74,222,128,0)",
                              ]
                            : "none",
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className={`px-2 py-0.5 text-[11px] rounded border ${
                    isDark
                      ? "border-green-400 text-green-300"
                      : "border-green-400 text-green-700 bg-green-100"
                  }`}
                >
                  {v.toFixed(2)}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <p
        className={`text-[11px] text-center mt-5 max-w-[700px] leading-5 ${
          isDark ? "text-slate-500" : "text-slate-600"
        }`}
      >
        Add &amp; Normalize is applied after every sub-layer in the decoder —
        after masked self-attention, after cross-attention, and after the
        feed-forward network.
      </p>

      <div className={`w-full max-w-[760px] mt-5 rounded-xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-400 bg-violet-50"}`}>
        <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-violet-300" : "text-violet-700"}`}>Key insight</div>
        <p className={`text-[10px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Residual connections prevent information loss through deep networks. Layer normalization keeps values stable so training converges. This Add &amp; Normalize pattern repeats three times in every decoder layer — it is the glue that holds each sub-layer together.</p>
      </div>
    </motion.div>
  );
}

export default DecoderAddNormStep;
