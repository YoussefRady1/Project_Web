import { motion } from "framer-motion";
import { useMemo, useState } from "react";

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

function generateEncoderOutputVector(word, index, tokenCount) {
  const embedding = generateEmbeddingVector(word);
  const position = generatePositionVector(index);
  const encoderInput = addVectors(embedding, position);
  const contextBoost = [
    Number((((index + 1) * 0.08) % 1).toFixed(2)),
    Number((((tokenCount - index) * 0.05) % 1).toFixed(2)),
    Number((((word.length % 5) * 0.07) % 1).toFixed(2)),
    Number(((((index + 1) + word.length) * 0.04) % 1).toFixed(2)),
  ];
  return encoderInput.map((v, i) => Number((v + contextBoost[i]).toFixed(2)));
}

const WQ = [0.9, 0.3, 0.6, 0.2];
const Q_SHIFT = [0.03, 0.05, 0.02, 0.04];

function projectVector(input, weights, shift) {
  return input.map((v, i) =>
    Number(((v * weights[i] + shift[i]) % 1).toFixed(2))
  );
}

// Pedagogical attention rule: each decoder position aligns to its
// corresponding encoder position (decoder i ↔ encoder i-1), with a soft
// Gaussian falloff to neighbours. This mimics the diagonal alignment a
// trained translation model usually learns, so the pattern is interpretable.
function alignmentWeights(decIndex, encCount) {
  const target = decIndex === 0 ? 0 : decIndex - 1;
  const sigma = 1.0;
  const raw = Array.from({ length: encCount }, (_, encI) => {
    const dist = encI - target;
    return Math.exp(-(dist * dist) / (2 * sigma * sigma));
  });
  const sum = raw.reduce((s, v) => s + v, 0) || 1;
  return raw.map((v) => Number((v / sum).toFixed(2)));
}

function DecoderCrossAttentionStep({ active, tokens = [], theme }) {
  const isDark = theme === "dark";
  const [hoveredDecoder, setHoveredDecoder] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const safeTokens = useMemo(
    () => (tokens.length ? tokens.slice(0, 6) : ["token"]),
    [tokens]
  );

  const decoderTokens = useMemo(
    () => ["<START>", ...safeTokens],
    [safeTokens]
  );

  const encoderOutputs = useMemo(
    () =>
      safeTokens.map((word, i) => ({
        word,
        vector: generateEncoderOutputVector(word, i, safeTokens.length),
      })),
    [safeTokens]
  );

  const decoderVectors = useMemo(
    () =>
      decoderTokens.map((tok, i) => {
        const emb = getDecoderEmbedding(tok);
        const pos = generatePositionVector(i);
        const input = addVectors(emb, pos);
        const query = projectVector(input, WQ, Q_SHIFT);
        return { token: tok, query };
      }),
    [decoderTokens]
  );

  const crossMatrix = useMemo(
    () =>
      decoderTokens.map((_, decI) =>
        alignmentWeights(decI, encoderOutputs.length)
      ),
    [decoderTokens, encoderOutputs.length]
  );

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.2, scale: active ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[980px] min-h-[620px] flex flex-col items-center ${
        isDark ? "border-cyan-500" : "border-blue-800 bg-white shadow-sm"
      }`}
    >
      <h2
        className={`font-semibold text-center ${
          isDark ? "text-cyan-300" : "text-blue-900"
        }`}
      >
        Encoder–Decoder Attention (Cross-Attention)
      </h2>

      <p
        className={`text-xs text-center mb-4 ${
          isDark ? "text-slate-400" : "text-slate-700"
        }`}
      >
        The decoder consults encoder outputs to understand the original input
      </p>

      <button
        onClick={() => setShowExplanation((v) => !v)}
        className={`mb-3 text-[11px] font-medium underline underline-offset-2 ${
          isDark ? "text-cyan-300 hover:text-cyan-200" : "text-blue-900 hover:text-blue-900"
        }`}
      >
        {showExplanation ? "Hide explanation" : "Show explanation"}
      </button>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-[760px] mb-5 rounded-xl border p-3 text-[11px] leading-5 ${
            isDark ? "border-slate-700 bg-slate-900/70 text-slate-300" : "border-slate-500 bg-slate-50 text-slate-700"
          }`}
        >
          Cross-attention is the bridge between encoder and decoder. The decoder sends Queries from its own tokens, while the encoder provides Keys and Values from its output vectors. This lets the decoder "look at" the original input while generating each output token like a translator glancing back at the source text.
        </motion.div>
      )}

      {/* 4-step process guide */}
      <div className={`w-full max-w-[760px] mb-5 rounded-xl border p-4 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-600/70 bg-slate-50"}`}>
        <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-cyan-300" : "text-blue-900"}`}>
          How Cross-Attention Works 4 Steps
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className={`rounded-lg border p-2.5 ${isDark ? "border-amber-400/30 bg-amber-400/5" : "border-amber-500 bg-amber-100"}`}>
            <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>① Decoder creates Query (Q)</div>
            <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-800"}`}>Each decoder token asks: "What part of the input do I need to focus on right now?"</div>
          </div>
          <div className={`rounded-lg border p-2.5 ${isDark ? "border-pink-400/30 bg-pink-400/5" : "border-pink-500 bg-pink-100"}`}>
            <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-pink-300" : "text-pink-700"}`}>② Encoder provides Keys (K)</div>
            <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-800"}`}>Each encoder output says: "Here is what I represent." Q·K gives a relevance score for each pair.</div>
          </div>
          <div className={`rounded-lg border p-2.5 ${isDark ? "border-cyan-400/30 bg-cyan-400/5" : "border-blue-600 bg-blue-100"}`}>
            <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-900"}`}>③ Scores become attention weights</div>
            <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-800"}`}>High score = this encoder token is important. Softmax normalizes all scores so they sum to 1.</div>
          </div>
          <div className={`rounded-lg border p-2.5 ${isDark ? "border-lime-400/30 bg-lime-400/5" : "border-lime-500 bg-lime-100"}`}>
            <div className={`text-[11px] font-semibold mb-1 ${isDark ? "text-lime-300" : "text-lime-700"}`}>④ Encoder Values (V) are blended</div>
            <div className={`text-[10px] leading-4 ${isDark ? "text-slate-400" : "text-slate-800"}`}>Weighted mix of encoder Values becomes the decoder's new context what it "learned" from the input.</div>
          </div>
        </div>
        <div className={`rounded-lg p-2 text-center text-[10px] italic ${isDark ? "bg-slate-950/50 text-slate-400 border border-slate-800" : "bg-white text-slate-700 border border-slate-500"}`}>
          Analogy: Like a translator glancing back at the source text the decoder "looks at" encoder output for every word it generates
        </div>
      </div>

      {/* Where the encoder info comes from  data flow diagram */}
      <div className={`w-full max-w-[760px] mb-5 rounded-xl border p-4 ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-600/70 bg-slate-50"}`}>
        <h3 className={`text-sm font-semibold mb-1 ${isDark ? "text-cyan-300" : "text-blue-900"}`}>
          Where does the encoder info come from?
        </h3>
        <p className={`text-[11px] leading-5 mb-3 ${isDark ? "text-slate-400" : "text-slate-800"}`}>
          The decoder's cross-attention doesn't see raw words. It reaches back to the encoder and reads the encoder's <b>final processed output</b>, which is the result of the encoder's last Feed Forward + Add &amp; Norm layer. That output becomes the K and V the cross-attention uses.
        </p>

        {/* Visual flow */}
        <div className={`rounded-lg border p-3 mb-3 ${isDark ? "border-slate-700 bg-slate-950/60" : "border-slate-500 bg-white"}`}>
          <div className={`text-[9px] font-bold uppercase tracking-wider text-center mb-2 ${isDark ? "text-slate-500" : "text-slate-700"}`}>
            The connection path
          </div>
          <div className="flex items-center gap-1.5 justify-center flex-wrap">
            <div className={`px-2.5 py-1.5 rounded-md border text-[10.5px] font-semibold ${isDark ? "border-green-400/40 bg-green-400/10 text-green-300" : "border-green-600 bg-green-100 text-green-700"}`}>
              Encoder Stack
            </div>
            <span className={`text-sm font-bold ${isDark ? "text-slate-500" : "text-slate-700"}`}>{`>`}</span>
            <div className={`px-2.5 py-1.5 rounded-md border text-[10.5px] font-semibold ${isDark ? "border-green-400/40 bg-green-400/10 text-green-300" : "border-green-600 bg-green-100 text-green-700"}`}>
              Feed Forward
            </div>
            <span className={`text-sm font-bold ${isDark ? "text-slate-500" : "text-slate-700"}`}>{`>`}</span>
            <div className={`px-2.5 py-1.5 rounded-md border text-[10.5px] font-semibold ${isDark ? "border-green-400/40 bg-green-400/10 text-green-300" : "border-green-600 bg-green-100 text-green-700"}`}>
              Add &amp; Norm
            </div>
            <span className={`text-sm font-bold ${isDark ? "text-slate-500" : "text-slate-700"}`}>{`>`}</span>
            <div className={`px-2.5 py-1.5 rounded-md border-2 text-[10.5px] font-bold ${isDark ? "border-green-400 bg-green-400/25 text-green-200" : "border-green-500 bg-green-100 text-green-800"}`}>
              Encoder Output
            </div>
            <span className={`text-base font-bold ${isDark ? "text-cyan-300" : "text-blue-900"}`}>{`>>`}</span>
            <div className={`px-2.5 py-1.5 rounded-md border-2 text-[10.5px] font-bold ${isDark ? "border-cyan-400 bg-cyan-400/25 text-cyan-200" : "border-blue-700 bg-blue-100 text-blue-900"}`}>
              Decoder Cross-Attention
            </div>
          </div>
          <div className={`text-center mt-2 text-[10px] italic ${isDark ? "text-slate-500" : "text-slate-700"}`}>
            The encoder's last Feed Forward is the source. Its output flows into every decoder block's cross-attention as K and V.
          </div>
        </div>

        <div className={`rounded-lg p-2.5 text-[10.5px] leading-[1.1rem] ${isDark ? "bg-cyan-400/5 border border-cyan-400/20 text-slate-300" : "bg-blue-100 border border-blue-600 text-slate-700"}`}>
          <b className={isDark ? "text-cyan-300" : "text-blue-900"}>Important: </b>
          The green encoder tokens you see in the interactive view below are NOT raw input embeddings. They're vectors that already carry context about every other word in your sentence, thanks to the encoder's self-attention and feed-forward layers. The decoder gets the "smart" processed version, not the raw one.
        </div>
      </div>

      <div className={`w-full rounded-xl border p-5 mb-5 ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-600/70 bg-slate-50"}`}>
        <div className={`text-sm font-semibold mb-1 text-center ${isDark ? "text-cyan-300" : "text-blue-900"}`}>
          Interactive Cross-Attention Flow
        </div>
        <div className={`text-[11px] text-center mb-4 ${isDark ? "text-slate-400" : "text-slate-800"}`}>
          Which input word is the decoder reading right now? Hover to find out.
        </div>

        {/* Purpose explainer  visual card layout */}
        <div className="mb-4 space-y-2">
          {/* The big idea */}
          <div className={`rounded-lg border p-3 ${isDark ? "border-cyan-500/40 bg-cyan-500/5" : "border-blue-700 bg-blue-100"}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider ${isDark ? "bg-cyan-400/20 text-cyan-300" : "bg-blue-200 text-blue-900"}`}>THE BIG IDEA</span>
            </div>
            <p className={`text-[12px] leading-5 font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              Every word the decoder writes is "powered by" one specific word from your input. This visual lets you see which one, live.
            </p>
          </div>

          {/* Quick story  3 columns */}
          <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-950/40" : "border-slate-500 bg-white"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"}`}>A QUICK STORY</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className={`rounded-md border p-2.5 ${isDark ? "border-amber-400/30 bg-amber-400/5" : "border-amber-500 bg-amber-100"}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Step 1</div>
                <div className={`text-[11px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  You're translating "I love sunny days" into French.
                </div>
              </div>
              <div className={`rounded-md border p-2.5 ${isDark ? "border-amber-400/30 bg-amber-400/5" : "border-amber-500 bg-amber-100"}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Step 2</div>
                <div className={`text-[11px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  To write the French word for "sunny", the decoder has to find "sunny" inside your input first.
                </div>
              </div>
              <div className={`rounded-md border p-2.5 ${isDark ? "border-amber-400/30 bg-amber-400/5" : "border-amber-500 bg-amber-100"}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Step 3</div>
                <div className={`text-[11px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Cross-attention is the searchlight. It tells the decoder where to look.
                </div>
              </div>
            </div>
          </div>

          {/* Try it yourself  numbered instructions */}
          <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-950/40" : "border-slate-500 bg-white"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"}`}>TRY IT YOURSELF</span>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2.5 items-start">
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isDark ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" : "bg-amber-100 text-amber-700 border border-amber-600"}`}>1</span>
                <span className={`text-[11.5px] leading-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Hover any <b className={isDark ? "text-amber-300" : "text-amber-700"}>amber token</b> on the left. That's the output word you're "watching" the decoder write.
                </span>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isDark ? "bg-green-400/20 text-green-300 border border-green-400/40" : "bg-green-100 text-green-700 border border-green-600"}`}>2</span>
                <span className={`text-[11.5px] leading-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Watch the <b className={isDark ? "text-green-300" : "text-green-700"}>green tokens</b> on the right. The brightest one is where the decoder is focusing.
                </span>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isDark ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40" : "bg-blue-100 text-blue-900 border border-blue-700"}`}>3</span>
                <span className={`text-[11.5px] leading-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Check the <b>percentages</b> in the middle. They add up to 100%. That's the decoder splitting its attention across your input words.
                </span>
              </div>
            </div>
          </div>

          {/* Why hover  the punchline */}
          <div className={`rounded-lg border p-3 ${isDark ? "border-lime-400/30 bg-lime-400/5" : "border-lime-500 bg-lime-100"}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider ${isDark ? "bg-lime-400/20 text-lime-300" : "bg-lime-200 text-lime-800"}`}>WHY HOVER AT ALL</span>
            </div>
            <p className={`text-[11.5px] leading-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Attention isn't a static thing. As you slide between output words, the focus on your input shifts. That live shift <i>is</i> cross-attention. Reading it as numbers on a page feels abstract. Hovering makes it click.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 relative">
          {/* LEFT: Decoder tokens (Q source) */}
          <div className="flex flex-col gap-2 w-[36%]">
            <div className={`text-[10px] font-semibold uppercase tracking-wide text-center mb-1 px-2 py-1 rounded-lg ${isDark ? "bg-amber-400/10 text-amber-300" : "bg-amber-100 text-amber-700 border border-amber-500"}`}>
              DECODER sends Query (Q)
            </div>
            {decoderVectors.map((dec, i) => (
              <motion.div
                key={dec.token + i}
                onMouseEnter={() => setHoveredDecoder(i)}
                onMouseLeave={() => setHoveredDecoder(null)}
                animate={{
                  boxShadow: hoveredDecoder === i
                    ? isDark ? "0 0 18px rgba(251,191,36,0.4)" : "0 0 14px rgba(217,119,6,0.25)"
                    : "none",
                  scale: hoveredDecoder === i ? 1.03 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`rounded-lg border p-2 cursor-pointer transition-colors ${
                  hoveredDecoder === i
                    ? isDark ? "border-amber-400 bg-amber-400/10" : "border-amber-700 bg-amber-100"
                    : isDark ? "border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10" : "border-amber-500 bg-white hover:bg-amber-100"
                }`}
              >
                <div className={`text-xs font-medium ${isDark ? "text-amber-300" : "text-amber-700"}`}>{dec.token}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {dec.query.map((v, j) => (
                    <span key={j} className={`text-[9px] px-1 py-0.5 rounded ${isDark ? "text-amber-300/70 bg-amber-400/10" : "text-amber-800 bg-amber-100"}`}>
                      Q:{v.toFixed(2)}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CENTER: Connections + scores */}
          <div className="flex flex-col gap-2 w-[28%] pt-8">
            {hoveredDecoder !== null ? (
              <>
                <div className={`text-[9px] text-center mb-1 font-medium ${isDark ? "text-slate-400" : "text-slate-800"}`}>
                  Attention weights from "{decoderVectors[hoveredDecoder]?.token}"
                </div>
                {(() => {
                  const row = crossMatrix[hoveredDecoder] || [];
                  const topIdx = row.indexOf(Math.max(...row));
                  const topWord = encoderOutputs[topIdx]?.word;
                  const topPct = Math.round((row[topIdx] || 0) * 100);
                  return (
                    <div className={`text-[9px] leading-4 text-center mb-1.5 px-2 py-1 rounded ${isDark ? "bg-cyan-400/10 text-cyan-300 border border-cyan-400/30" : "bg-blue-100 text-blue-900 border border-blue-600"}`}>
                      Right now the decoder is mostly reading <b>"{topWord}"</b> ({topPct}%). That's the input word it's "translating" at this position.
                    </div>
                  );
                })()}
                {encoderOutputs.map((enc, i) => {
                  const score = crossMatrix[hoveredDecoder][i];
                  const pct = Math.round(score * 100);
                  return (
                    <motion.div
                      key={`conn-${i}`}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="flex flex-col gap-0.5"
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`flex-1 h-[3px] rounded-full ${isDark ? "bg-gradient-to-r from-amber-400/80 to-green-400/80" : "bg-gradient-to-r from-amber-400/60 to-green-500/60"}`}
                          style={{ opacity: 0.3 + score * 0.7 }}
                        />
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                          className={`w-2 h-2 rounded-full shrink-0 ${isDark ? "bg-green-400" : "bg-green-500"}`}
                          style={{ filter: isDark ? `drop-shadow(0 0 4px rgba(74,222,128,${score}))` : "none", opacity: 0.4 + score * 0.6 }}
                        />
                      </div>
                      <div className={`text-center text-[9px] font-mono ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                        {pct}% on "{enc.word}"
                      </div>
                    </motion.div>
                  );
                })}
                {/* Result box */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`mt-2 rounded-lg border p-2 text-center ${isDark ? "border-lime-400/40 bg-lime-400/5" : "border-lime-600 bg-lime-100"}`}
                >
                  <div className={`text-[9px] font-semibold mb-0.5 ${isDark ? "text-lime-300" : "text-lime-700"}`}>Result (V blend)</div>
                  <div className={`text-[9px] ${isDark ? "text-slate-400" : "text-slate-800"}`}>
                    [{encoderOutputs.map((enc, i) => `${Math.round(crossMatrix[hoveredDecoder][i] * 100)}%·V${i + 1}`).join(" + ")}]
                  </div>
                </motion.div>
              </>
            ) : (
              <div className={`text-[10px] text-center leading-5 mt-4 ${isDark ? "text-slate-500" : "text-slate-700"}`}>
                ← Hover a decoder token on the left.
                <br />
                <span className="opacity-70">You'll see which input word it focuses on and how the encoder's information gets blended into its context.</span>
              </div>
            )}
          </div>

          {/* RIGHT: Encoder outputs (K, V source) */}
          <div className="flex flex-col gap-2 w-[36%]">
            <div className={`text-[10px] font-semibold uppercase tracking-wide text-center mb-1 px-2 py-1 rounded-lg ${isDark ? "bg-green-400/10 text-green-300" : "bg-green-100 text-green-700 border border-green-500"}`}>
              ENCODER provides K &amp; V
            </div>
            {encoderOutputs.map((enc, i) => (
              <motion.div
                key={enc.word + i}
                animate={{
                  boxShadow: hoveredDecoder !== null
                    ? isDark
                      ? `0 0 ${Math.round(crossMatrix[hoveredDecoder][i] * 22) + 2}px rgba(74,222,128,${crossMatrix[hoveredDecoder][i] * 0.65})`
                      : `0 0 ${Math.round(crossMatrix[hoveredDecoder][i] * 16) + 2}px rgba(34,197,94,${crossMatrix[hoveredDecoder][i] * 0.4})`
                    : "none",
                  scale: hoveredDecoder !== null ? 1 + crossMatrix[hoveredDecoder][i] * 0.06 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`rounded-lg border p-2 ${isDark ? "border-green-400/40 bg-green-400/5" : "border-green-600 bg-green-100"}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-medium ${isDark ? "text-green-300" : "text-green-700"}`}>{enc.word}</div>
                  {hoveredDecoder !== null && (
                    <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${isDark ? "bg-green-400/20 text-green-300" : "bg-green-100 text-green-700"}`}>
                      {Math.round(crossMatrix[hoveredDecoder][i] * 100)}%
                    </div>
                  )}
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {enc.vector.map((v, j) => (
                    <span key={j} className={`text-[9px] px-1 py-0.5 rounded ${isDark ? "text-green-300/70 bg-green-400/10" : "text-green-800 bg-green-100"}`}>
                      {v.toFixed(2)}
                    </span>
                  ))}
                </div>
                {hoveredDecoder !== null && (
                  <div className={`mt-1.5 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                    <motion.div
                      animate={{ width: `${crossMatrix[hoveredDecoder][i] * 100}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-full bg-green-400"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border p-4 mb-5 ${
          isDark
            ? "border-slate-700 bg-slate-900/80"
            : "border-slate-600/70 bg-slate-50"
        }`}
      >
        <div
          className={`text-sm font-semibold mb-1 ${
            isDark ? "text-cyan-300" : "text-blue-900"
          }`}
        >
          Cross-attention score matrix
        </div>

        <div
          className={`text-[11px] leading-4 mb-4 ${
            isDark ? "text-slate-400" : "text-slate-800"
          }`}
        >
          Every output word, every input word, one heatmap.
        </div>

        {/* Purpose explainer  visual card layout */}
        <div className="mb-4 space-y-2">
          {/* Why it exists */}
          <div className={`rounded-lg border p-3 ${isDark ? "border-cyan-500/40 bg-cyan-500/5" : "border-blue-700 bg-blue-100"}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider ${isDark ? "bg-cyan-400/20 text-cyan-300" : "bg-blue-200 text-blue-900"}`}>WHY THIS EXISTS</span>
            </div>
            <p className={`text-[12px] leading-5 font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              The hover view above shows you ONE output word's focus at a time. This table shows EVERY output word's focus at once. One glance, the whole story.
            </p>
          </div>

          {/* Read it like a spreadsheet  3 cards */}
          <div className={`rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-950/40" : "border-slate-500 bg-white"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"}`}>READ IT LIKE A SPREADSHEET</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className={`rounded-md border p-2.5 ${isDark ? "border-cyan-400/30 bg-cyan-400/5" : "border-blue-600 bg-blue-100"}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-cyan-300" : "text-blue-900"}`}>Each row</div>
                <div className={`text-[11px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  One decoder output word.
                </div>
              </div>
              <div className={`rounded-md border p-2.5 ${isDark ? "border-green-400/30 bg-green-400/5" : "border-green-500 bg-green-100"}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-green-300" : "text-green-700"}`}>Each column</div>
                <div className={`text-[11px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  One encoder input word.
                </div>
              </div>
              <div className={`rounded-md border p-2.5 ${isDark ? "border-slate-600 bg-slate-800/40" : "border-slate-500 bg-slate-100"}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-slate-200" : "text-slate-700"}`}>Each cell</div>
                <div className={`text-[11px] leading-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  How much THAT row focuses on THAT column. Darker blue means stronger focus.
                </div>
              </div>
            </div>
            <div className={`mt-2 text-[10.5px] leading-4 italic px-1 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
              Every row adds up to 100%. Think of it as the decoder's attention "budget" being split across your input words.
            </div>
          </div>

          {/* Spot the pattern */}
          <div className={`rounded-lg border p-3 ${isDark ? "border-amber-400/30 bg-amber-400/5" : "border-amber-500 bg-amber-100"}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider ${isDark ? "bg-amber-400/20 text-amber-300" : "bg-amber-200 text-amber-800"}`}>THE ONE THING TO SPOT</span>
            </div>
            <p className={`text-[11.5px] leading-5 mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              The <b className={isDark ? "text-amber-300" : "text-amber-700"}>amber-highlighted cells</b> in the table below mark each row's strongest attention. Connect them with your eyes and you'll see a clear <b>diagonal stripe</b> from top-left to bottom-right.
            </p>
            <p className={`text-[11.5px] leading-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              That stripe is the model's translation alignment: output 1 focuses on input 1, output 2 on input 2, output 3 on input 3, and so on. If you can see the diagonal, the model is wired correctly.
            </p>
            <div className={`mt-2 pt-2 border-t text-[10.5px] leading-4 ${isDark ? "border-amber-400/20 text-slate-400" : "border-amber-500 text-slate-800"}`}>
              <b>Visual cue:</b> amber cells glow with a subtle pulse. Non-diagonal cells stay quieter in blue. The contrast between them <i>is</i> the alignment pattern.
            </div>
          </div>

          {/* Why researchers care */}
          <div className={`rounded-lg border p-3 ${isDark ? "border-lime-400/30 bg-lime-400/5" : "border-lime-500 bg-lime-100"}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider ${isDark ? "bg-lime-400/20 text-lime-300" : "bg-lime-200 text-lime-800"}`}>WHY RESEARCHERS CARE</span>
            </div>
            <p className={`text-[11.5px] leading-5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Researchers print these heatmaps to debug their models. "Is the decoder looking at the right input word?" That question can take hours of digging through code, or two seconds of glancing at this matrix.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="text-[11px] border-collapse">
            <thead>
              <tr>
                <th
                  className={`px-2 py-1 ${
                    isDark ? "text-slate-500" : "text-slate-800"
                  }`}
                >
                  Dec \ Enc
                </th>
                {safeTokens.map((tok, i) => (
                  <th
                    key={`ecol-${i}`}
                    className={`px-2 py-1 font-medium ${
                      isDark ? "text-green-300" : "text-green-700"
                    }`}
                  >
                    {tok}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crossMatrix.map((row, rIdx) => {
                const topIdx = row.indexOf(Math.max(...row));
                return (
                  <tr key={`crow-${rIdx}`}>
                    <td
                      className={`px-2 py-1 font-medium ${
                        isDark ? "text-cyan-300" : "text-blue-900"
                      }`}
                    >
                      {decoderTokens[rIdx]}
                    </td>
                    {row.map((score, cIdx) => {
                      const intensity = score;
                      const isTop = cIdx === topIdx;
                      return (
                        <td key={`ccell-${rIdx}-${cIdx}`} className="px-1 py-1">
                          <motion.div
                            animate={
                              active
                                ? {
                                    boxShadow: isTop
                                      ? isDark
                                        ? [
                                            `0 0 0px rgba(251,191,36,0)`,
                                            `0 0 14px rgba(251,191,36,0.7)`,
                                            `0 0 0px rgba(251,191,36,0)`,
                                          ]
                                        : [
                                            `0 0 0px rgba(217,119,6,0)`,
                                            `0 0 10px rgba(217,119,6,0.45)`,
                                            `0 0 0px rgba(217,119,6,0)`,
                                          ]
                                      : isDark
                                        ? [
                                            `0 0 0px rgba(34,211,238,0)`,
                                            `0 0 ${Math.round(intensity * 8)}px rgba(34,211,238,${intensity * 0.25})`,
                                            `0 0 0px rgba(34,211,238,0)`,
                                          ]
                                        : "none",
                                  }
                                : {}
                            }
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: rIdx * 0.08,
                            }}
                            className={`min-w-[56px] text-center rounded-md px-2 py-1.5 ${
                              isTop
                                ? isDark
                                  ? "border-2 border-amber-400 ring-2 ring-amber-400/30 font-bold"
                                  : "border-2 border-amber-500 ring-2 ring-amber-300/50 font-bold"
                                : isDark
                                  ? "border border-slate-700"
                                  : "border border-slate-500"
                            }`}
                            style={{
                              backgroundColor: isTop
                                ? isDark
                                  ? `rgba(251,191,36,${0.25 + intensity * 0.35})`
                                  : `rgba(251,191,36,${0.3 + intensity * 0.35})`
                                : isDark
                                  ? `rgba(34,211,238,${intensity * 0.35})`
                                  : `rgba(59,130,246,${intensity * 0.3})`,
                              color: isTop
                                ? isDark
                                  ? "#fef3c7"
                                  : "#78350f"
                                : isDark
                                  ? "#e2e8f0"
                                  : "#1e293b",
                            }}
                          >
                            {score.toFixed(2)}
                          </motion.div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className={`mt-3 flex items-center justify-center gap-2 text-[10.5px] ${isDark ? "text-slate-400" : "text-slate-800"}`}>
            <span className={`inline-block w-3.5 h-3.5 rounded border-2 ${isDark ? "border-amber-400 bg-amber-400/30" : "border-amber-500 bg-amber-200"}`}></span>
            <span>Amber-highlighted cells form the diagonal alignment. They are each row's strongest focus.</span>
          </div>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border p-4 mb-5 ${
          isDark
            ? "border-slate-700 bg-slate-900/70"
            : "border-slate-600/70 bg-slate-50"
        }`}
      >
        <div
          className={`text-[11px] leading-5 space-y-2 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <p>
            <span className={isDark ? "text-cyan-300 font-medium" : "text-blue-900 font-medium"}>
              Key insight:
            </span>{" "}
            Cross-attention allows the decoder to selectively focus on the most
            relevant parts of the input sentence while generating each output
            token. This is what makes translation, summarization, and other
            sequence-to-sequence tasks possible.
          </p>
        </div>
      </div>

    </motion.div>
  );
}

export default DecoderCrossAttentionStep;
