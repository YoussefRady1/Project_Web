// Post-Encoder Quiz: 10 questions that map directly onto the encoder
// visualizations the learner just walked through. stepIndex/stepLabel are used
// by EncoderPostQuizStep so wrong answers offer a "Go to step" jump-back.
const encoderQuiz = [
  {
    id: 1,
    question:
      "After tokenization runs on the sentence \"I love pizza,\" what does the encoder see?",
    options: [
      "A single combined vector",
      "Three separate tokens: \"I\", \"love\", \"pizza\"",
      "One long string with spaces removed",
      "Three random numbers",
    ],
    correctAnswer: "Three separate tokens: \"I\", \"love\", \"pizza\"",
    stepIndex: 0,
    stepLabel: "Tokenization",
    explanation:
      "Tokenization slices the sentence into individual units. From here on, every later step works on these tokens one position at a time.",
  },
  {
    id: 2,
    question: "What does the embedding step do to each token?",
    options: [
      "Replaces it with a synonym",
      "Converts it into a vector of numbers the model can compute on",
      "Counts how many times it appears",
      "Turns it into a single 0 or 1",
    ],
    correctAnswer: "Converts it into a vector of numbers the model can compute on",
    stepIndex: 1,
    stepLabel: "Embedding",
    explanation:
      "Each token is mapped to a fixed-size numeric vector. That vector is what flows into every layer that follows.",
  },
  {
    id: 3,
    question:
      "Self-attention on its own ignores word order. What fixes that inside the encoder?",
    options: [
      "Adding a positional encoding to each token's embedding",
      "Sorting tokens alphabetically",
      "Removing duplicate words",
      "Doubling the number of attention heads",
    ],
    correctAnswer:
      "Adding a positional encoding to each token's embedding",
    stepIndex: 2,
    stepLabel: "Positional Encoding",
    explanation:
      "A position vector is added to each token's embedding so the model can tell first from second from third, even though attention itself is order-blind.",
  },
  {
    id: 4,
    question:
      "How is the positional encoding combined with the token embedding?",
    options: [
      "By multiplying the two vectors",
      "By replacing the embedding with the position vector",
      "By concatenating them into a longer vector",
      "By adding them element by element",
    ],
    correctAnswer: "By adding them element by element",
    stepIndex: 2,
    stepLabel: "Positional Encoding",
    explanation:
      "Position and meaning are mixed by simple element-wise addition. The output keeps the same shape as the embedding.",
  },
  {
    id: 5,
    question: "Inside the encoder stack, what does self-attention let each token do?",
    options: [
      "Look at every other token in the same sentence",
      "Look only at the token directly before it",
      "Ignore the rest of the sentence",
      "Predict the next sentence",
    ],
    correctAnswer: "Look at every other token in the same sentence",
    stepIndex: 3,
    stepLabel: "Encoder Stack",
    explanation:
      "Self-attention is what gives each token a context-aware representation: it gets to inspect every other token in the same input and pull in what's relevant.",
  },
  {
    id: 6,
    question: "Why does the encoder repeat the same kind of layer several times?",
    options: [
      "Because the hardware requires repetition",
      "Each repetition refines the token representations further",
      "To slow training down deliberately",
      "Because layers share no parameters between calls",
    ],
    correctAnswer: "Each repetition refines the token representations further",
    stepIndex: 3,
    stepLabel: "Encoder Stack",
    explanation:
      "Stacking lets the encoder build understanding gradually. Earlier layers capture local relationships; later layers compose them into richer ones.",
  },
  {
    id: 7,
    question:
      "What does the feed-forward part of an encoder layer do?",
    options: [
      "Mixes tokens together again",
      "Transforms each token's vector on its own",
      "Splits the sentence into smaller tokens",
      "Predicts the final translation",
    ],
    correctAnswer: "Transforms each token's vector on its own",
    stepIndex: 3,
    stepLabel: "Encoder Stack",
    explanation:
      "After attention shares information across tokens, the feed-forward network refines each token independently, without looking at its neighbors.",
  },
  {
    id: 8,
    question: "What is the \"Add\" inside \"Add & Normalize\" actually adding?",
    options: [
      "Two different sentences",
      "Random noise to prevent overfitting",
      "The sublayer's input back onto its output (a residual connection)",
      "A learned bias to the loss",
    ],
    correctAnswer:
      "The sublayer's input back onto its output (a residual connection)",
    stepIndex: 3,
    stepLabel: "Encoder Stack",
    explanation:
      "Each sublayer's output is added back to its input. This residual shortcut preserves earlier information and makes deep stacks easier to train.",
  },
  {
    id: 9,
    question: "When the encoder is finished, what does it actually output?",
    options: [
      "One context-aware vector per input token",
      "A single number for the whole sentence",
      "The sentence translated into another language",
      "The original tokens, unchanged",
    ],
    correctAnswer: "One context-aware vector per input token",
    stepIndex: 4,
    stepLabel: "Encoder Output",
    explanation:
      "The encoder keeps the sequence length the same. What changes is each vector: every position now carries information about itself and its neighbors.",
  },
  {
    id: 10,
    question: "Which sequence describes the encoder pipeline from start to finish?",
    options: [
      "Encoder Stack → Tokenization → Embedding → Output",
      "Tokenization → Embedding → Positional Encoding → Encoder Stack → Encoder Output",
      "Embedding → Tokenization → Encoder Output → Encoder Stack",
      "Positional Encoding → Tokenization → Embedding → Encoder Output",
    ],
    correctAnswer:
      "Tokenization → Embedding → Positional Encoding → Encoder Stack → Encoder Output",
    stepIndex: 4,
    stepLabel: "Encoder Output",
    explanation:
      "This is the order you walked through. Each step depends on the previous one's output, building up from raw text to context-aware vectors.",
  },
];

export default encoderQuiz;
