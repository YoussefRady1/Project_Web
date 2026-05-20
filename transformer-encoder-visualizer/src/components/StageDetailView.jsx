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

function TokenizeDetail({ p }) {
  const toks = ["The", "house", "is", "wonderful"];
  const ids = ["37", "629", "19", "1627"];
  return (
    <svg viewBox="0 0 900 210" className="w-full" style={{ minHeight: 210 }}>
      <SvgDefs color={p.sub} />

      <Box x={20} y={85} w={150} h={42} label="raw sentence" sub="plain text" color={p.text} accent />

      {toks.map((_, i) => (
        <Arrow key={`a${i}`} x1={170} y1={106} x2={250} y2={45 + i * 40} color={p.sub} />
      ))}
      <text x={210} y={96} textAnchor="middle" fontSize={7.5} fill={p.sub} fontStyle="italic">
        split
      </text>

      {toks.map((t, i) => (
        <Box key={`t${i}`} x={250} y={30 + i * 40} w={120} h={30} label={t} sub="one token" color={p.embed} />
      ))}

      {toks.map((_, i) => (
        <Arrow key={`b${i}`} x1={370} y1={45 + i * 40} x2={440} y2={45 + i * 40} color={p.sub} />
      ))}
      <text x={405} y={20} textAnchor="middle" fontSize={7.5} fill={p.sub} fontStyle="italic">
        look up ID
      </text>

      {ids.map((id, i) => (
        <Box key={`i${i}`} x={440} y={30 + i * 40} w={100} h={30} label={`ID ${id}`} color={p.res} accent />
      ))}

      <Arrow x1={540} y1={106} x2={620} y2={106} color={p.sub} />
      <text x={680} y={110} textAnchor="middle" fontSize={9} fill={p.text} opacity={0.75}>
        numbers → Embed step
      </text>
    </svg>
  );
}

function PositionalDetail({ p }) {
  return (
    <svg viewBox="0 0 900 210" className="w-full" style={{ minHeight: 210 }}>
      <SvgDefs color={p.sub} />

      <Box x={20} y={40} w={150} h={38} label="token embedding" sub="meaning only" color={p.embed} accent />
      <Arrow x1={170} y1={59} x2={210} y2={59} color={p.sub} />
      <VectorViz x={210} y={45} dims={10} color={p.embed} label="" />

      <Box x={20} y={140} w={150} h={38} label="position vector" sub="which slot in sentence" color={p.res} accent />
      <Arrow x1={170} y1={159} x2={210} y2={159} color={p.sub} />
      <VectorViz x={210} y={145} dims={10} color={p.res} label="" />

      <text x={470} y={115} textAnchor="middle" fontSize={18} fontWeight="700" fill={p.text}>
        +
      </text>
      <Arrow x1={420} y1={70} x2={500} y2={105} color={p.sub} curve />
      <Arrow x1={420} y1={170} x2={500} y2={120} color={p.sub} curve />
      <text x={530} y={100} textAnchor="middle" fontSize={7.5} fill={p.sub} fontStyle="italic">
        add together
      </text>

      <Arrow x1={500} y1={112} x2={560} y2={112} color={p.sub} />
      <VectorViz x={560} y={98} dims={10} color={p.embed} label="meaning + position" />

      <text x={720} y={116} textAnchor="middle" fontSize={9} fill={p.text} opacity={0.75}>
        → ready for attention
      </text>
    </svg>
  );
}

function EmbedDetail({ p, sampleToken = "house" }) {
  return (
    <svg viewBox="0 0 900 200" className="w-full" style={{ minHeight: 200 }}>
      <SvgDefs color={p.sub} />

      {/* the word */}
      <Box x={20} y={78} w={110} h={44} label={sampleToken} sub="one token" color={p.text} accent />
      <Arrow x1={130} y1={100} x2={195} y2={100} color={p.sub} label="its ID" />

      {/* its vocab ID */}
      <Box x={195} y={78} w={110} h={44} label="ID 629" sub="row number" color={p.embed} />
      <Arrow x1={305} y1={100} x2={375} y2={100} color={p.sub} label="pick that row" />

      {/* the embedding table */}
      <Box
        x={375}
        y={68}
        w={185}
        h={64}
        label="Embedding table"
        sub="32,128 words × 512 numbers"
        color={p.embed}
        accent
      />
      <Arrow x1={560} y1={100} x2={625} y2={100} color={p.sub} />

      {/* the resulting vector */}
      <VectorViz x={625} y={84} dims={10} color={p.embed} label="this word's vector (512 numbers)" />

      <text x={760} y={165} textAnchor="middle" fontSize={9} fill={p.text} opacity={0.78}>
        words with similar meaning get similar vectors
      </text>
    </svg>
  );
}

function SelfAttnDetail({ p, isCross = false, isMasked = false }) {
  const accent = isCross ? p.crossAttn : isMasked ? p.maskedAttn || p.selfAttn : p.selfAttn;
  return (
    <svg viewBox="0 0 900 330" className="w-full" style={{ minHeight: 330 }}>
      <SvgDefs color={p.sub} />

      {/* Input */}
      {isCross ? (
        <>
          <Box x={10} y={30} w={140} h={40} label="Decoder so far" sub="what we've written" color={p.crossAttn} accent />
          <Box x={10} y={228} w={140} h={40} label="Encoder output" sub="the input sentence" color={p.embed} accent />
        </>
      ) : (
        <Box x={10} y={133} w={140} h={44} label="Input tokens" sub="one vector per word" color={accent} accent />
      )}

      {/* Linear projections */}
      <Box x={210} y={38} w={110} h={36} label="× W_Q" sub="make Query" color={accent} />
      <Box x={210} y={133} w={110} h={36} label="× W_K" sub="make Key" color={accent} />
      <Box x={210} y={228} w={110} h={36} label="× W_V" sub="make Value" color={accent} />

      {isCross ? (
        <>
          <Arrow x1={150} y1={50} x2={210} y2={56} color={p.crossAttn} />
          <Arrow x1={150} y1={248} x2={210} y2={151} color={p.embed} />
          <Arrow x1={150} y1={248} x2={210} y2={246} color={p.embed} />
        </>
      ) : (
        <>
          <Arrow x1={150} y1={155} x2={210} y2={56} color={accent} />
          <Arrow x1={150} y1={155} x2={210} y2={151} color={accent} />
          <Arrow x1={150} y1={155} x2={210} y2={246} color={accent} />
        </>
      )}

      {/* Q, K, V vectors */}
      <Box x={360} y={38} w={90} h={36} label="Q" sub="what I seek" color={accent} accent />
      <Box x={360} y={133} w={90} h={36} label="K" sub="what I show" color={accent} accent />
      <Box x={360} y={228} w={90} h={36} label="V" sub="my content" color={accent} accent />

      <Arrow x1={320} y1={56} x2={360} y2={56} color={p.sub} />
      <Arrow x1={320} y1={151} x2={360} y2={151} color={p.sub} />
      <Arrow x1={320} y1={246} x2={360} y2={246} color={p.sub} />

      {/* Q · K^T */}
      <Box x={490} y={80} w={120} h={34} label="Q · Kᵀ" sub="how well they match" color={accent} />
      <Arrow x1={450} y1={56} x2={490} y2={92} color={p.sub} />
      <Arrow x1={450} y1={151} x2={490} y2={106} color={p.sub} />

      <Box x={490} y={124} w={120} h={30} label="÷ √64" sub="keep numbers calm" color={accent} />
      <Arrow x1={550} y1={114} x2={550} y2={124} color={p.sub} />

      {isMasked && (
        <Box x={490} y={162} w={120} h={30} label="apply mask" sub="hide future words" color={accent} accent />
      )}
      <Arrow x1={550} y1={154} x2={550} y2={isMasked ? 162 : 200} color={p.sub} />

      <Box x={490} y={isMasked ? 200 : 162} w={120} h={30} label="softmax" sub="turn into % weights" color={accent} />
      {isMasked && <Arrow x1={550} y1={192} x2={550} y2={200} color={p.sub} />}

      <MatrixViz x={510} y={isMasked ? 238 : 200} rows={3} cols={3} color={accent} label="attention weights" />

      {/* × V */}
      <Box x={660} y={133} w={100} h={36} label="× V" sub="blend the Values" color={accent} accent />
      <Arrow x1={575} y1={isMasked ? 268 : 230} x2={660} y2={155} color={p.sub} curve />
      <Arrow x1={450} y1={246} x2={660} y2={160} color={p.sub} curve />

      {/* concat + output projection */}
      <Box x={790} y={105} w={100} h={36} label="Concat heads" sub="join 8 views" color={accent} />
      <Arrow x1={760} y1={151} x2={790} y2={123} color={p.sub} />

      <Box x={790} y={155} w={100} h={36} label="× W_O" sub="mix the heads" color={accent} accent />
      <Arrow x1={840} y1={141} x2={840} y2={155} color={p.sub} />

      <text x={840} y={210} textAnchor="middle" fontSize={8.5} fill={p.text} opacity={0.8}>
        → refined vectors
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

function OutputDetail({ p, liveOutput }) {
  const fallbackBars = [
    { w: 110, l: "Bienvenue", p: "20%" },
    { w: 98, l: "à", p: "18%" },
    { w: 86, l: "votre", p: "16%" },
    { w: 80, l: "voiture", p: "15%" },
    { w: 70, l: "tout", p: "13%" },
  ];

  const hasLive = liveOutput && liveOutput.length > 0;
  const bars = hasLive
    ? liveOutput.slice(0, 5).map((item) => {
        const pct = (item.prob * 100).toFixed(1);
        // width is the final pixel length; capped so the % label always stays on-screen
        return { w: Math.max(28, Math.min(180, item.prob * 180)), l: item.tok, p: `${pct}%` };
      })
    : fallbackBars;

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
        <text x={640} y={48} fontSize={8} fontWeight="700" fill={p.output} opacity={0.7}>
          most likely next words
        </text>
        {bars.map((b, i) => (
          <g key={i}>
            <rect
              x={640}
              y={55 + i * 22}
              width={b.w}
              height={16}
              rx={3}
              fill={p.output}
              opacity={0.2 + (5 - i) * 0.12}
            />
            <text x={648} y={67 + i * 22} fontSize={8.5} fontWeight="700" fill={p.text}>
              {b.l}
            </text>
            <text
              x={640 + b.w + 6}
              y={67 + i * 22}
              fontSize={8}
              fontWeight="700"
              fill={p.output}
              opacity={0.95}
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
  tokens_enc: {
    title: "Tokenization · Inside the Block",
    intuition:
      "Before a model can do any math, your sentence has to become numbers. Tokenization is the very first step: it chops the raw text into small pieces called tokens (whole words, word-parts, or punctuation) and gives each piece a fixed ID number from the model's vocabulary.",
    math: [
      {
        step: "1. Split the text into tokens",
        formula: "\"The house is wonderful\" → [\"The\", \"house\", \"is\", \"wonderful\"]",
        detail: "T5 uses a SentencePiece tokenizer. Rare or long words get broken into sub-word pieces so the vocabulary stays small.",
      },
      {
        step: "2. Map every token to its vocabulary ID",
        formula: "[\"The\", \"house\", …] → [37, 629, 19, 1627]",
        detail: "Each token has one fixed integer ID. T5's vocabulary has 32,128 entries.",
      },
      {
        step: "3. Add the task prefix and end token",
        formula: "[translate, English, to, French, :, …, </s>]",
        detail: "T5 is told what to do with a text prefix, and a special </s> token marks where the sentence ends.",
      },
    ],
    insights: [
      "Tokenization happens on the CPU before any neural network runs, it is pure text processing.",
      "The same word can split differently depending on context, e.g. 'wonderful' might become 'wonder' + 'ful'.",
      "The model never sees letters, only the integer IDs produced here.",
    ],
  },
  pos_enc: {
    title: "Positional Encoding · Inside the Block",
    intuition:
      "Attention looks at every token at once, so on its own it has no idea which word came first. Positional encoding fixes this by adding a unique 'location stamp' to each token's embedding, telling the model where in the sentence that token sits.",
    math: [
      {
        step: "1. Build a position vector for each slot",
        formula: "P[pos] = [sin(pos/10000^0), cos(pos/10000^0), …]",
        detail: "Each position gets a 512-dim vector made of sine and cosine waves at different frequencies, a unique fingerprint per slot.",
      },
      {
        step: "2. Add it to the token embedding",
        formula: "final = Embedding[token] + P[pos]",
        detail: "Element-wise addition. The vector now carries both the word's meaning and its position.",
      },
      {
        step: "3. The result feeds into the first attention layer",
        formula: "X = [final₀, final₁, …, finalₙ]",
        detail: "Every later layer can now use position information when deciding what to attend to.",
      },
    ],
    insights: [
      "Without positional encoding, 'dog bites man' and 'man bites dog' would look identical to the model.",
      "Sine/cosine encoding lets the model generalize to sentence lengths it never saw in training.",
      "It is added, not concatenated, so it does not increase the vector size.",
    ],
  },
  maskedAttn: {
    title: "Masked Self-Attention · Inside the Block",
    intuition:
      "This is self-attention inside the decoder, but with one rule added: a token may only look at itself and the tokens before it, never the future. This 'mask' is what forces the model to generate text one word at a time, left to right, without cheating by peeking ahead.",
    math: [
      {
        step: "1. Create Q, K, V from the decoder input",
        formula: "Q = X · W_Q     K = X · W_K     V = X · W_V",
        detail: "Same projection as normal self-attention, all three come from the decoder's own tokens.",
      },
      {
        step: "2. Score every token pair",
        formula: "scores = Q · Kᵀ / √64",
        detail: "A seq × seq matrix of how strongly each token matches every other token.",
      },
      {
        step: "3. Apply the causal mask",
        formula: "scores[i][j] = −∞   for every future position j > i",
        detail: "Future positions are set to negative infinity so that, after softmax, their weight becomes exactly 0.",
      },
      {
        step: "4. Softmax, then mix the Values",
        formula: "output = softmax(masked scores) · V",
        detail: "Each token ends up as a blend of only itself and the tokens to its left.",
      },
    ],
    insights: [
      "The mask is the ONLY difference from encoder self-attention, the math is otherwise identical.",
      "Without the mask, the model could see the answer it is supposed to predict, useless for generation.",
      "During training all positions are processed in parallel; the mask keeps each one honest.",
    ],
  },
  linSoftmax: {
    title: "Linear + Softmax · Inside the Block",
    intuition:
      "The decoder has produced a 512-dim summary for the next position. This stage turns that vector into an actual word: a linear layer gives every vocabulary word a raw score, and softmax turns those scores into probabilities that sum to 1.",
    math: [
      {
        step: "1. Linear projection to vocabulary scores",
        formula: "logits = y · W_out + b     (W_out is 512 × 32,128)",
        detail: "One large matrix multiply produces one raw score (logit) for every possible token.",
      },
      {
        step: "2. Softmax → probabilities",
        formula: "P(w) = exp(logits_w) / Σ exp(logits_i)",
        detail: "Exponentiate and normalize so every word gets a probability between 0 and 1, all summing to 1.",
      },
      {
        step: "3. The probabilities feed the token picker",
        formula: "P = [0.95, 0.03, 0.01, …]",
        detail: "The highest-probability words become the candidates shown on the right of the diagram.",
      },
    ],
    insights: [
      "'Linear' and 'Softmax' are two steps but always run back-to-back, so the diagram shows them as one node.",
      "Softmax amplifies gaps: logits of 5 vs 3 become ~0.88 vs ~0.12, not 5/8 vs 3/8.",
      "The actual word chosen depends on the sampling strategy (greedy, top-p, beam search).",
    ],
  },
  embed: {
    title: "Embedding · Inside the Block",
    intuition:
      "A model can't do math on the word \"house\" it needs numbers. Embedding is a giant lookup table: every word in the vocabulary owns one row of 512 numbers, and that row IS the word as far as the model is concerned. The numbers aren't random training pulls words with similar meaning close together, so \"house\" and \"home\" end up with nearly the same row.",
    math: [
      {
        step: "1. Start from the token's ID",
        formula: "\"house\"  →  ID 629",
        detail: "The Tokenization step already gave every word a fixed integer ID. Here we just use it.",
      },
      {
        step: "2. Use the ID as a row number into the embedding table",
        formula: "table shape = 32,128 words × 512 numbers",
        detail: "The embedding table is one big learned grid: one row per possible word, each row 512 numbers long.",
      },
      {
        step: "3. Read out that one row that's the word's vector",
        formula: "row 629  →  [0.12, −0.43, 0.08, … ]   (512 numbers)",
        detail: "No calculation, just a lookup. This 512-number vector is the word's 'meaning' that flows into the rest of the model.",
      },
    ],
    insights: [
      "It is pure table lookup no math on the letters of the word.",
      "The 512 numbers are learned during training; before training they are random.",
      "Similar words get similar rows, that is what lets the model 'understand' meaning.",
      "Position is NOT added here that happens in the next step, Positional Encoding.",
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
        detail: "Back down to 512-dim ready for the next decoder layer.",
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
        step: "3. Scaled dot-product attention same math as self-attention",
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

function StageDetailView({ stageKey, onClose, p, isDark, liveOutput }) {
  const content = {
    tokens_enc: <TokenizeDetail p={p} />,
    pos_enc: <PositionalDetail p={p} />,
    embed: <EmbedDetail p={p} />,
    selfAttn: <SelfAttnDetail p={p} />,
    encFFN: <FFNDetail p={p} />,
    maskedAttn: <SelfAttnDetail p={p} isMasked />,
    decFFN: <FFNDetail p={p} />,
    crossAttn: <SelfAttnDetail p={p} isCross />,
    linSoftmax: <OutputDetail p={p} liveOutput={liveOutput} />,
    outProj: <OutputDetail p={p} liveOutput={liveOutput} />,
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
                  : "border-blue-400 bg-blue-50"
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
                  : "border-slate-400/70 bg-white"
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

            {/* Live worked example Output Projection / Linear+Softmax */}
            {(stageKey === "outProj" || stageKey === "linSoftmax") && liveOutput && liveOutput.length > 0 && (() => {
              const top5 = liveOutput.slice(0, 5);
              const logits = top5.map((t) => Math.log(Math.max(t.prob, 1e-10)));
              const maxLogit = Math.max(...logits);
              const exps = logits.map((z) => Math.exp(z - maxLogit));
              const sumExp = exps.reduce((a, b) => a + b, 0);
              const renorm = exps.map((e) => e / sumExp);
              const topToken = top5[0];

              return (
                <div
                  className={`rounded-lg border p-3 ${
                    isDark
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-amber-400 bg-amber-50"
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                      isDark ? "text-amber-300" : "text-amber-700"
                    }`}
                  >
                    Worked example live from T5-small
                  </div>

                  <div
                    className={`text-[11px] leading-5 mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    The model just generated these tokens. Here are the top-5 candidates
                    for the <span className="font-semibold">first output token</span>,
                    with a renormalized softmax over those 5:
                  </div>

                  <div
                    className={`rounded-md border p-2 mb-2 font-mono text-[10.5px] leading-6 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-cyan-300"
                        : "bg-white border-slate-300 text-blue-800"
                    }`}
                  >
                    {top5.map((t, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-20 text-right truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {t.tok}
                        </span>
                        <span className="opacity-60">→</span>
                        <span>log(p) = {logits[i].toFixed(3)}</span>
                        <span className="opacity-60">→</span>
                        <span>exp = {exps[i].toFixed(4)}</span>
                        <span className="opacity-60">→</span>
                        <span className="font-semibold">{(renorm[i] * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`rounded-md border p-2 mb-2 font-mono text-[10.5px] ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-cyan-300"
                        : "bg-white border-slate-300 text-blue-800"
                    }`}
                  >
                    softmax("{topToken.tok}") = exp({logits[0].toFixed(3)}) / Σ exp(z_j) = {exps[0].toFixed(4)} / {sumExp.toFixed(4)} = <span className="font-bold">{(renorm[0] * 100).toFixed(1)}%</span>
                  </div>

                  <div
                    className={`text-[10px] leading-4 ${
                      isDark ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    Note: this is a renormalization over the top 5 candidates, not the full 32,128-token vocabulary.
                    The original model probabilities are shown in the bars above.
                  </div>

                  <div
                    className={`mt-2 text-[10px] italic ${
                      isDark ? "text-cyan-400/70" : "text-blue-600"
                    }`}
                  >
                    These probabilities come from the actual T5-small model running in your browser.
                  </div>
                </div>
              );
            })()}

            {/* Key insights */}
            <div
              className={`rounded-lg border p-3 ${
                isDark
                  ? "border-slate-700 bg-slate-900/40"
                  : "border-slate-400/70 bg-slate-50"
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
