import { motion, AnimatePresence } from "framer-motion";

/* ---------- small SVG helpers ---------- */

function Box({ x, y, w, h, label, sub, color, bg, accent }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={bg || "transparent"}
        stroke={color}
        strokeWidth={accent ? 1.6 : 1.1}
        strokeOpacity={accent ? 0.9 : 0.55}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + (sub ? -2 : 4)}
        textAnchor="middle"
        fontSize={10}
        fontWeight="700"
        fill={color}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 10}
          textAnchor="middle"
          fontSize={7.5}
          fill={color}
          opacity={0.7}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color, label, dashed, curve }) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const d = curve
    ? `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`
    : `M${x1},${y1} L${x2},${y2}`;
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.3}
        strokeOpacity={0.7}
        strokeDasharray={dashed ? "4 4" : undefined}
        markerEnd="url(#arrowhead)"
      />
      {label && (
        <text
          x={midX}
          y={midY - 4}
          textAnchor="middle"
          fontSize={7.5}
          fill={color}
          opacity={0.8}
          fontStyle="italic"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function VectorViz({ x, y, dims = 8, color, label }) {
  const w = 11;
  const gap = 2;
  const heights = [14, 22, 9, 18, 12, 20, 7, 16];
  return (
    <g>
      {Array.from({ length: dims }).map((_, i) => {
        const h = heights[i % heights.length];
        return (
          <rect
            key={i}
            x={x + i * (w + gap)}
            y={y + (24 - h)}
            width={w}
            height={h}
            rx={1.5}
            fill={color}
            opacity={0.4 + (i % 3) * 0.2}
          />
        );
      })}
      {label && (
        <text
          x={x + (dims * (w + gap)) / 2}
          y={y + 40}
          textAnchor="middle"
          fontSize={7.5}
          fill={color}
          opacity={0.8}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function MatrixViz({ x, y, rows = 4, cols = 4, color, label }) {
  const cell = 14;
  const vals = [
    [0.8, 0.1, 0.05, 0.05],
    [0.2, 0.5, 0.2, 0.1],
    [0.1, 0.3, 0.4, 0.2],
    [0.05, 0.15, 0.2, 0.6],
  ];
  return (
    <g>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <rect
            key={`${r}-${c}`}
            x={x + c * cell}
            y={y + r * cell}
            width={cell - 1}
            height={cell - 1}
            fill={color}
            opacity={0.15 + (vals[r % 4][c % 4] || 0.2) * 0.85}
          />
        ))
      )}
      {label && (
        <text
          x={x + (cols * cell) / 2}
          y={y + rows * cell + 12}
          textAnchor="middle"
          fontSize={7.5}
          fill={color}
          opacity={0.8}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/* shared defs for arrow marker */
function SvgDefs({ color }) {
  return (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="8"
        markerHeight="8"
        refX="6"
        refY="4"
        orient="auto"
      >
        <path d="M0,0 L0,8 L7,4 Z" fill={color} opacity={0.7} />
      </marker>
    </defs>
  );
}

/* ---------- stage detail views ---------- */

function EmbedDetail({ p, sampleToken = "house" }) {
  return (
    <svg viewBox="0 0 900 240" className="w-full" style={{ minHeight: 240 }}>
      <SvgDefs color={p.sub} />

      <Box x={20} y={105} w={80} h={34} label={sampleToken} color={p.text} accent />
      <Arrow x1={100} y1={122} x2={160} y2={122} color={p.sub} />

      <Box x={160} y={105} w={90} h={34} label="ID: 629" sub="vocab index" color={p.embed} />
      <Arrow x1={250} y1={122} x2={310} y2={122} color={p.sub} label="lookup row" />

      <Box
        x={310}
        y={95}
        w={150}
        h={54}
        label="Embedding Matrix"
        sub="32,128 × 512"
        color={p.embed}
        accent
      />
      <Arrow x1={460} y1={122} x2={510} y2={122} color={p.sub} />

      <VectorViz x={510} y={105} dims={10} color={p.embed} label="token embedding (512-dim)" />

      {/* Positional stream */}
      <Box x={310} y={180} w={150} h={34} label="Position info" sub="position 2 in sentence" color={p.res} />
      <Arrow x1={460} y1={197} x2={510} y2={197} color={p.sub} />
      <VectorViz x={510} y={180} dims={10} color={p.res} label="position vector" />

      <text x={675} y={148} fontSize={14} fill={p.text} fontWeight="700">
        +
      </text>

      <Arrow x1={700} y1={148} x2={760} y2={148} color={p.sub} curve label="sum" />

      <VectorViz x={760} y={125} dims={10} color={p.embed} label="final input (512-dim)" />
    </svg>
  );
}

function SelfAttnDetail({ p, isCross = false }) {
  return (
    <svg viewBox="0 0 900 320" className="w-full" style={{ minHeight: 320 }}>
      <SvgDefs color={p.sub} />

      {/* Input */}
      {isCross ? (
        <>
          <Box x={10} y={30} w={130} h={36} label="Decoder state" sub="seq_dec × 512" color={p.crossAttn} accent />
          <Box x={10} y={230} w={130} h={36} label="Encoder output" sub="seq_enc × 512" color={p.embed} accent />
        </>
      ) : (
        <Box x={10} y={135} w={130} h={40} label="Input X" sub="seq × 512" color={p.selfAttn} accent />
      )}

      {/* Linear projections */}
      <Box x={200} y={40} w={100} h={32} label="× W_Q" color={p.selfAttn} />
      <Box x={200} y={135} w={100} h={32} label="× W_K" color={p.selfAttn} />
      <Box x={200} y={230} w={100} h={32} label="× W_V" color={p.selfAttn} />

      {isCross ? (
        <>
          <Arrow x1={140} y1={48} x2={200} y2={56} color={p.crossAttn} />
          <Arrow x1={140} y1={248} x2={200} y2={151} color={p.embed} />
          <Arrow x1={140} y1={248} x2={200} y2={246} color={p.embed} />
        </>
      ) : (
        <>
          <Arrow x1={140} y1={155} x2={200} y2={56} color={p.selfAttn} />
          <Arrow x1={140} y1={155} x2={200} y2={151} color={p.selfAttn} />
          <Arrow x1={140} y1={155} x2={200} y2={246} color={p.selfAttn} />
        </>
      )}

      {/* Q, K, V vectors */}
      <Box x={340} y={40} w={70} h={32} label="Q" sub="× 8 heads" color={p.selfAttn} accent />
      <Box x={340} y={135} w={70} h={32} label="K" sub="× 8 heads" color={p.selfAttn} accent />
      <Box x={340} y={230} w={70} h={32} label="V" sub="× 8 heads" color={p.selfAttn} accent />

      <Arrow x1={300} y1={56} x2={340} y2={56} color={p.sub} />
      <Arrow x1={300} y1={151} x2={340} y2={151} color={p.sub} />
      <Arrow x1={300} y1={246} x2={340} y2={246} color={p.sub} />

      {/* Q · K^T */}
      <Box x={460} y={85} w={110} h={32} label="Q · Kᵀ" sub="scores" color={p.selfAttn} />
      <Arrow x1={410} y1={56} x2={460} y2={95} color={p.sub} />
      <Arrow x1={410} y1={151} x2={460} y2={110} color={p.sub} />

      <Box x={460} y={130} w={110} h={28} label="÷ √64" sub="scale" color={p.selfAttn} />
      <Arrow x1={515} y1={117} x2={515} y2={130} color={p.sub} />

      <Box x={460} y={170} w={110} h={28} label="softmax" color={p.selfAttn} />
      <Arrow x1={515} y1={158} x2={515} y2={170} color={p.sub} />

      <MatrixViz x={480} y={205} rows={3} cols={3} color={p.selfAttn} label="attention weights" />

      {/* × V */}
      <Box x={620} y={135} w={90} h={32} label="× V" color={p.selfAttn} accent />
      <Arrow x1={545} y1={235} x2={620} y2={155} color={p.sub} curve />
      <Arrow x1={410} y1={246} x2={620} y2={160} color={p.sub} curve />

      {/* concat + output projection */}
      <Box x={750} y={110} w={130} h={32} label="Concat 8 heads" sub="→ 512-dim" color={p.selfAttn} />
      <Arrow x1={710} y1={151} x2={750} y2={126} color={p.sub} />

      <Box x={750} y={160} w={130} h={32} label="× W_O" sub="output proj" color={p.selfAttn} accent />
      <Arrow x1={815} y1={142} x2={815} y2={160} color={p.sub} />

      <text x={815} y={215} textAnchor="middle" fontSize={8} fill={p.text} opacity={0.8}>
        → seq × 512
      </text>
    </svg>
  );
}

function FFNDetail({ p }) {
  return (
    <svg viewBox="0 0 900 180" className="w-full" style={{ minHeight: 180 }}>
      <SvgDefs color={p.sub} />

      <Box x={30} y={70} w={120} h={40} label="Input" sub="512-dim" color={p.ffn} accent />
      <Arrow x1={150} y1={90} x2={210} y2={90} color={p.sub} />

      <Box x={210} y={60} w={160} h={60} label="Linear 1" sub="512 → 2048" color={p.ffn} accent />
      <Arrow x1={370} y1={90} x2={430} y2={90} color={p.sub} label="expand" />

      <Box x={430} y={70} w={110} h={40} label="ReLU" sub="max(0, x)" color={p.ffn} />
      <Arrow x1={540} y1={90} x2={600} y2={90} color={p.sub} label="nonlinear" />

      <Box x={600} y={60} w={160} h={60} label="Linear 2" sub="2048 → 512" color={p.ffn} accent />
      <Arrow x1={760} y1={90} x2={820} y2={90} color={p.sub} />

      <Box x={820} y={70} w={70} h={40} label="Output" sub="512-dim" color={p.ffn} accent />
    </svg>
  );
}

function OutputDetail({ p }) {
  return (
    <svg viewBox="0 0 900 220" className="w-full" style={{ minHeight: 220 }}>
      <SvgDefs color={p.sub} />

      <Box x={20} y={90} w={140} h={40} label="Decoder output" sub="512-dim" color={p.output} accent />
      <Arrow x1={160} y1={110} x2={220} y2={110} color={p.sub} />

      <Box
        x={220}
        y={80}
        w={180}
        h={60}
        label="Linear projection"
        sub="512 → 32,128 (vocab)"
        color={p.output}
        accent
      />
      <Arrow x1={400} y1={110} x2={460} y2={110} color={p.sub} label="logits" />

      <Box x={460} y={90} w={110} h={40} label="softmax" color={p.output} />
      <Arrow x1={570} y1={110} x2={630} y2={110} color={p.sub} label="probabilities" />

      {/* Top-K bars */}
      <g>
        {[
          { w: 60, l: "Bienvenue", p: "20%" },
          { w: 54, l: "à", p: "18%" },
          { w: 48, l: "votre", p: "16%" },
          { w: 45, l: "voiture", p: "15%" },
          { w: 40, l: "tout", p: "13%" },
        ].map((b, i) => (
          <g key={i}>
            <rect
              x={640}
              y={55 + i * 22}
              width={b.w * 1.6}
              height={16}
              rx={3}
              fill={p.output}
              opacity={0.2 + (5 - i) * 0.12}
            />
            <text x={648} y={67 + i * 22} fontSize={8.5} fontWeight="700" fill={p.text}>
              {b.l}
            </text>
            <text
              x={640 + b.w * 1.6 + 6}
              y={67 + i * 22}
              fontSize={8}
              fill={p.output}
              opacity={0.8}
            >
              {b.p}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------- main export ---------- */

const EXPLANATIONS = {
  embed: {
    title: "Embed · Inside the Block",
    intuition:
      "Imagine a giant dictionary where every word has its own 'profile card' with 512 numbers on it. The embedding step is just looking up that card. Two words with similar meaning end up with similar cards, 'cat' and 'kitten' live near each other in this 512-dimensional space.",
    math: [
      {
        step: "1. Turn the word into an ID",
        formula: "\"house\" → 629",
        detail: "The tokenizer assigns every word a fixed integer. T5 has 32,128 possible IDs.",
      },
      {
        step: "2. Look up that row in the embedding matrix",
        formula: "E[629]  →  [0.12, −0.43, 0.08, …]   (512 numbers)",
        detail: "The embedding matrix is a learned table of shape (32,128 × 512). Row 629 is the vector for 'house'.",
      },
      {
        step: "3. Get a position vector for where the word sits",
        formula: "P[2]  →  [0.02,  0.99, 0.03, …]",
        detail: "Because attention is order-blind, we need to tell the model where each word is in the sentence.",
      },
      {
        step: "4. Add them together (element-wise)",
        formula: "final = E[629] + P[2]  →  [0.14, 0.56, 0.11, …]",
        detail: "The result carries both meaning (from embedding) and position (from positional encoding).",
      },
    ],
    insights: [
      "Embedding values are learned during training, not computed from the letters of the word.",
      "Without positional encoding the model cannot distinguish 'dog bites man' from 'man bites dog'.",
      "Each of the 512 dimensions encodes some learned abstract feature of the word.",
    ],
  },
  selfAttn: {
    title: "Self-Attention · Inside the Block",
    intuition:
      "Think of a library. Every token is simultaneously a reader, a book-label, and a book. As a reader it has a Query (Q): what it's looking for. As a label it has a Key (K): what it advertises. As a book it has a Value (V): the actual content. Each token compares its Q to every K in the sentence to decide how much of each V to read.",
    math: [
      {
        step: "1. Create Q, K, V from the input",
        formula: "Q = X · W_Q     K = X · W_K     V = X · W_V",
        detail: "X is the input (seq_len × 512). Three learned weight matrices project it into Q, K, V (each seq_len × 64 per head).",
      },
      {
        step: "2. Measure how much each token matches every other",
        formula: "scores = Q · Kᵀ     (a seq_len × seq_len matrix)",
        detail: "Dot product measures similarity: two vectors pointing the same way give a big number.",
      },
      {
        step: "3. Scale down so numbers don't explode",
        formula: "scaled = scores / √64 = scores / 8",
        detail: "Without scaling, large dot products make softmax push one value to ~1 and everything else to ~0, killing gradients.",
      },
      {
        step: "4. Softmax → attention weights",
        formula: "weights = softmax(scaled)     (each row sums to 1)",
        detail: "Turns raw scores into probabilities. A row [5.2, 1.1, 0.8] might become [0.96, 0.02, 0.02].",
      },
      {
        step: "5. Use the weights to mix the Values",
        formula: "output = weights · V",
        detail: "Each token now holds a weighted combination of every other token's information.",
      },
      {
        step: "6. Repeat 8 times in parallel, then merge",
        formula: "concat(head₁, …, head₈) · W_O",
        detail: "Each of 8 heads learns different relationships (syntax, coreference, etc.). Concatenated, then projected back to 512.",
      },
    ],
    insights: [
      "This is the ONLY stage where tokens share information with each other.",
      "The attention matrix is what people visualize when they talk about 'what the model is looking at'.",
      "Self-attention is position-blind, that's why we added positional encoding earlier.",
    ],
  },
  encFFN: {
    title: "Encoder Feed-Forward · Inside the Block",
    intuition:
      "After attention mixes information across tokens, each token gets handed to a small 'thinking machine' that processes it in isolation. The expand-then-compress pattern (512 → 2048 → 512) is like using scratch paper: more room to do complex work, then summarize the answer.",
    math: [
      {
        step: "1. Expand to a higher dimension",
        formula: "h = x · W₁ + b₁     (W₁ is 512 × 2048)",
        detail: "A simple matrix multiply followed by adding a bias vector. The result is a 2048-dim vector.",
      },
      {
        step: "2. Apply ReLU (nonlinearity)",
        formula: "h' = max(0, h)",
        detail: "Any negative entry becomes 0. Positives pass through unchanged. This tiny rule is what lets the network learn non-linear patterns.",
      },
      {
        step: "3. Project back down",
        formula: "out = h' · W₂ + b₂     (W₂ is 2048 × 512)",
        detail: "Back to 512-dim so the output has the same shape as the input and can feed into the next layer.",
      },
    ],
    insights: [
      "This is where the model does most of its 'thinking' per token, FFNs hold ~2/3 of all transformer parameters.",
      "Every position is processed independently in parallel (no mixing across tokens here).",
      "Without ReLU (or some nonlinearity) the whole FFN would collapse to a single linear layer and lose its power.",
    ],
  },
  decFFN: {
    title: "Decoder Feed-Forward · Inside the Block",
    intuition:
      "Same machine as the encoder's FFN, but placed after cross-attention. Each generated token gets refined independently using the expanded-then-compressed pattern.",
    math: [
      {
        step: "1. Expand",
        formula: "h = x · W₁ + b₁     (512 → 2048)",
        detail: "A learned linear layer projects each 512-dim token up to 2048-dim.",
      },
      {
        step: "2. ReLU",
        formula: "h' = max(0, h)",
        detail: "Negatives clipped to zero. This is the ONLY non-linear step in the whole FFN.",
      },
      {
        step: "3. Compress",
        formula: "out = h' · W₂ + b₂     (2048 → 512)",
        detail: "Back down to 512-dim — ready for the next decoder layer.",
      },
    ],
    insights: [
      "Structurally identical to the encoder FFN, but has its own independent learned weights.",
      "Applied after cross-attention has pulled in information from the encoder output.",
      "This is the final per-token refinement before the next decoder layer (or the output projection).",
    ],
  },
  crossAttn: {
    title: "Cross-Attention · Inside the Block",
    intuition:
      "Self-attention had all Q, K, V coming from the same place. Cross-attention splits them: the decoder brings the Query ('what am I trying to say next?'), and the encoder's finished output provides the Key and Value ('here is what the input contains'). This is the bridge between the two stacks.",
    math: [
      {
        step: "1. Query from decoder state",
        formula: "Q = X_decoder · W_Q",
        detail: "X_decoder is the current decoder layer's output, the partial translation being built so far.",
      },
      {
        step: "2. Key and Value from encoder output",
        formula: "K = X_encoder · W_K     V = X_encoder · W_V",
        detail: "X_encoder is the FINAL encoder output (the green line in the main diagram). It represents the fully-processed input sentence.",
      },
      {
        step: "3. Scaled dot-product attention — same math as self-attention",
        formula: "attn = softmax(Q · Kᵀ / √64) · V",
        detail: "Every decoder position looks at every encoder position, weighted by how relevant each input token is to what's being generated.",
      },
    ],
    insights: [
      "Cross-attention is what lets the decoder 'read' the input. Without it, the decoder would be generating text blindly.",
      "Q has shape (seq_dec × 64) but K, V have shape (seq_enc × 64), the sequence lengths can differ.",
      "This only exists in encoder-decoder models like T5. GPT-style models skip it since they only have a decoder.",
    ],
  },
  outProj: {
    title: "Output Projection · Inside the Block",
    intuition:
      "The decoder has produced a 512-dim summary vector for the next position. Now the model needs to commit to an actual word out of 32,128 possibilities. It does this by giving a score to every word in the vocabulary, then converting those scores to probabilities.",
    math: [
      {
        step: "1. Project to vocabulary scores (logits)",
        formula: "logits = y · W_out + b     (W_out is 512 × 32,128)",
        detail: "One big linear layer turns the 512-dim vector into one score per possible token. These raw scores can be any real number, positive or negative.",
      },
      {
        step: "2. Softmax → probabilities",
        formula: "P(w) = exp(logits_w) / Σ exp(logits_i)",
        detail: "Exponentiate each logit, then normalize so everything sums to 1. Now every word has a probability between 0 and 1.",
      },
      {
        step: "3. Pick a token using a sampling strategy",
        formula: "greedy | top-p | beam-search | temperature",
        detail: "Greedy always picks the highest. Top-p samples from the smallest set whose probs sum to p. Beam search keeps the top-N running candidates.",
      },
    ],
    insights: [
      "The output matrix W_out is huge (512 × 32,128 ≈ 16M parameters), often tied to the input embedding matrix to save memory.",
      "Softmax amplifies differences: a logit of 5 vs 3 gives probabilities ~0.88 vs ~0.12, not 5/8 vs 3/8.",
      "The Top-P and Beam Search sliders above the diagram control which word actually gets picked each step.",
    ],
  },
};

function StageDetailView({ stageKey, onClose, p, isDark }) {
  const content = {
    embed: <EmbedDetail p={p} />,
    selfAttn: <SelfAttnDetail p={p} />,
    encFFN: <FFNDetail p={p} />,
    decFFN: <FFNDetail p={p} />,
    crossAttn: <SelfAttnDetail p={p} isCross />,
    outProj: <OutputDetail p={p} />,
  };

  return (
    <AnimatePresence>
      {stageKey && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-3 rounded-xl border overflow-hidden ${
            isDark
              ? "bg-slate-900/60 border-slate-700"
              : "bg-slate-50 border-slate-300"
          }`}
        >
          <div
            className={`flex items-center justify-between px-4 py-2 border-b ${
              isDark ? "border-slate-700" : "border-slate-300"
            }`}
          >
            <span
              className={`text-[12px] font-bold tracking-wide ${
                isDark ? "text-cyan-300" : "text-blue-700"
              }`}
            >
              {EXPLANATIONS[stageKey]?.title}
            </span>
            <button
              onClick={onClose}
              className={`text-[14px] leading-none px-2 py-0.5 rounded hover:opacity-70 transition ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="px-4 py-3">{content[stageKey]}</div>

          <div className="px-5 pb-4 space-y-3">
            {/* Intuition */}
            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-cyan-500/30 bg-cyan-500/5"
                  : "border-blue-300 bg-blue-50"
              }`}
            >
              <div
                className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  isDark ? "text-cyan-300" : "text-blue-700"
                }`}
              >
                The Intuition
              </div>
              <p
                className={`text-[11.5px] leading-[1.55] ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {EXPLANATIONS[stageKey]?.intuition}
              </p>
            </div>

            {/* Math walkthrough */}
            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-slate-700 bg-slate-950/40"
                  : "border-slate-300 bg-white"
              }`}
            >
              <div
                className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                  isDark ? "text-amber-300" : "text-amber-600"
                }`}
              >
                Step-by-step math
              </div>
              <ol className="space-y-2.5">
                {EXPLANATIONS[stageKey]?.math.map((m, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[11.5px] font-semibold mb-0.5 ${
                          isDark ? "text-slate-100" : "text-slate-800"
                        }`}
                      >
                        {m.step}
                      </div>
                      <div
                        className={`font-mono text-[11px] rounded px-2 py-1 mb-1 inline-block ${
                          isDark
                            ? "bg-slate-900 text-cyan-300 border border-slate-700"
                            : "bg-slate-100 text-blue-800 border border-slate-200"
                        }`}
                      >
                        {m.formula}
                      </div>
                      <div
                        className={`text-[10.5px] leading-[1.5] ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {m.detail}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Key insights */}
            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-slate-700 bg-slate-900/40"
                  : "border-slate-300 bg-slate-50"
              }`}
            >
              <div
                className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                  isDark ? "text-emerald-300" : "text-emerald-700"
                }`}
              >
                Key insights
              </div>
              <ul
                className={`space-y-1.5 text-[11px] leading-5 list-disc pl-4 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {EXPLANATIONS[stageKey]?.insights.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StageDetailView;
