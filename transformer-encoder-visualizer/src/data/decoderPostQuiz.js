// Post-Decoder Quiz: 10 questions that map onto the decoder visualizations
// the learner just walked through. stepIndex/stepLabel are used by
// DecoderPostQuizStep to offer a "Go to step" jump-back on wrong answers.
const decoderPostQuiz = [
  {
    id: 1,
    question: "What does the encoder hand over to the decoder?",
    options: [
      "The original input text, unchanged",
      "Its final context-aware vectors, used as decoder memory",
      "Only the largest attention score",
      "A copy of the vocabulary list",
    ],
    correctAnswer:
      "Its final context-aware vectors, used as decoder memory",
    stepIndex: 0,
    stepLabel: "Encoder → Decoder Transfer",
    explanation:
      "The encoder's output is a sequence of refined vectors. The decoder treats this as memory and consults it through cross-attention while generating.",
  },
  {
    id: 2,
    question: "What is the very first input fed into the decoder?",
    options: [
      "The last token of the input sentence",
      "A randomly picked word from the vocabulary",
      "A special <START> token",
      "Nothing — the decoder starts on its own",
    ],
    correctAnswer: "A special <START> token",
    stepIndex: 1,
    stepLabel: "Output Tokenization",
    explanation:
      "Generation needs a seed. The <START> token sits at position 0 and is what the decoder reads in order to predict the first real output word.",
  },
  {
    id: 3,
    question: "How is the <START> token represented inside the decoder?",
    options: [
      "It's skipped during embedding",
      "It uses a fixed, predefined embedding vector",
      "It's kept as plain text",
      "It reuses the encoder's first vector",
    ],
    correctAnswer: "It uses a fixed, predefined embedding vector",
    stepIndex: 2,
    stepLabel: "Output Embedding",
    explanation:
      "Like every other token, <START> needs to become a vector before anything else. In the visualization it uses a constant predefined vector.",
  },
  {
    id: 4,
    question: "Why does the decoder also add positional encoding to its tokens?",
    options: [
      "To compress the decoder's vectors",
      "To copy the encoder's pattern exactly",
      "So it knows the order of the tokens being generated",
      "To remove noise from earlier predictions",
    ],
    correctAnswer: "So it knows the order of the tokens being generated",
    stepIndex: 3,
    stepLabel: "Positional Encoding",
    explanation:
      "Self-attention is still order-blind on the decoder side. Positional encoding lets it tell first, second, and third output positions apart.",
  },
  {
    id: 5,
    question: "In masked self-attention, what gets blocked, and why?",
    options: [
      "Future positions, so the decoder can't peek at words it hasn't generated yet",
      "Past positions, to force it to use only the present",
      "Stop words, to save memory",
      "Repeating words, to add variety",
    ],
    correctAnswer:
      "Future positions, so the decoder can't peek at words it hasn't generated yet",
    stepIndex: 4,
    stepLabel: "Decoder Stack",
    explanation:
      "Each position is only allowed to attend to itself and earlier positions. That's what preserves the left-to-right, one-at-a-time nature of generation.",
  },
  {
    id: 6,
    question: "In cross-attention, where do Q, K, and V come from?",
    options: [
      "Q from the encoder; K and V from the decoder",
      "All three from the encoder",
      "All three from the decoder",
      "Q from the decoder; K and V from the encoder",
    ],
    correctAnswer: "Q from the decoder; K and V from the encoder",
    stepIndex: 4,
    stepLabel: "Decoder Stack",
    explanation:
      "The decoder asks the question (Q), and the encoder supplies what's available to attend over (K and V). That's how the decoder grounds its output in the input.",
  },
  {
    id: 7,
    question: "What's the feed-forward sublayer of a decoder layer doing?",
    options: [
      "Mixing information across different tokens",
      "Applying the same small network to each token's vector on its own",
      "Producing the final words directly",
      "Computing attention scores",
    ],
    correctAnswer:
      "Applying the same small network to each token's vector on its own",
    stepIndex: 4,
    stepLabel: "Decoder Stack",
    explanation:
      "After attention has shared information across positions, the feed-forward layer refines each position independently — no cross-token mixing here.",
  },
  {
    id: 8,
    question: "What does the linear layer at the end of the decoder produce?",
    options: [
      "A single accuracy score",
      "The next attention map",
      "One raw score (logit) per word in the vocabulary",
      "The final text, already as letters",
    ],
    correctAnswer: "One raw score (logit) per word in the vocabulary",
    stepIndex: 5,
    stepLabel: "Linear + Softmax",
    explanation:
      "The linear layer projects each decoder vector up to vocabulary size. Every word in the vocabulary ends up with a score saying how likely it is to come next.",
  },
  {
    id: 9,
    question: "What does softmax do with those logits?",
    options: [
      "Turns them into a probability for every word, all summing to 1",
      "Picks the largest and discards the rest",
      "Rounds them to the nearest integer",
      "Applies ReLU and removes negatives",
    ],
    correctAnswer:
      "Turns them into a probability for every word, all summing to 1",
    stepIndex: 5,
    stepLabel: "Linear + Softmax",
    explanation:
      "Softmax normalizes the raw scores into a clean probability distribution. From there we can sample the next token or just take the most likely one.",
  },
  {
    id: 10,
    question: "How does the decoder build up a complete output sentence?",
    options: [
      "All tokens are produced in parallel in a single shot",
      "One token at a time, with each prediction fed back as the next input",
      "By copying chunks of the encoder input directly",
      "By picking words at random until it hits a target length",
    ],
    correctAnswer:
      "One token at a time, with each prediction fed back as the next input",
    stepIndex: 6,
    stepLabel: "Output Prediction",
    explanation:
      "This is autoregressive generation: predict one token, append it, predict the next, and keep going until the model outputs a stop signal.",
  },
];

export default decoderPostQuiz;
