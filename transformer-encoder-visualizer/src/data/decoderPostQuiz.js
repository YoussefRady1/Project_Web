const decoderPostQuiz = [
  {
    id: 1,
    question:
      "What does the encoder-to-decoder transition transfer?",
    options: [
      "The original input sentence as plain text",
      "Context-aware vectors (memory) from the encoder's final output",
      "The tokenizer's vocabulary list",
      "Only the attention scores from the encoder",
    ],
    correctAnswer:
      "Context-aware vectors (memory) from the encoder's final output",
    stepIndex: 0,
    stepLabel: "Encoder → Decoder Transfer",
    explanation:
      "The transition passes the encoder's final context-aware representations to the decoder, which uses them as memory during cross-attention.",
  },
  {
    id: 2,
    question:
      "What is the first token the decoder receives as input?",
    options: [
      "The last token of the encoder input",
      "A random token from the vocabulary",
      "The <START> token to begin generation",
      "The most common word in the language",
    ],
    correctAnswer: "The <START> token to begin generation",
    stepIndex: 1,
    stepLabel: "Output Tokenization",
    explanation:
      "The decoder starts with a special <START> token as its initial input, which it uses to predict the first output token.",
  },
  {
    id: 3,
    question:
      "How does the decoder embed its input tokens?",
    options: [
      "It copies the encoder's embeddings directly",
      "Each token is converted into a numeric vector, with <START> using a fixed vector",
      "Tokens are left as one-hot encodings",
      "Only the <START> token is embedded; others are skipped",
    ],
    correctAnswer:
      "Each token is converted into a numeric vector, with <START> using a fixed vector",
    stepIndex: 2,
    stepLabel: "Output Embedding",
    explanation:
      "The decoder has its own embedding layer that maps each token to a vector. The <START> token uses a fixed, predefined embedding vector.",
  },
  {
    id: 4,
    question:
      "Why does the decoder add positional encoding to its embeddings?",
    options: [
      "To make all tokens look the same",
      "To tell the model the order of the output tokens being generated",
      "To compress the vectors into smaller representations",
      "To connect the decoder to the encoder",
    ],
    correctAnswer:
      "To tell the model the order of the output tokens being generated",
    stepIndex: 3,
    stepLabel: "Positional Encoding",
    explanation:
      "Just like the encoder, the decoder needs positional information so it knows which position each token occupies in the output sequence.",
  },
  {
    id: 5,
    question:
      "In masked self-attention, why are future positions blocked?",
    options: [
      "To save computation time",
      "To prevent the decoder from seeing tokens it hasn't generated yet",
      "To remove unimportant tokens",
      "To match the encoder's attention pattern",
    ],
    correctAnswer:
      "To prevent the decoder from seeing tokens it hasn't generated yet",
    stepIndex: 4,
    stepLabel: "Decoder Stack",
    explanation:
      "Masked self-attention ensures each position can only attend to earlier positions, preserving the autoregressive property of left-to-right generation.",
  },
  {
    id: 6,
    question:
      "In cross-attention, what does the decoder use from the encoder?",
    options: [
      "Only the encoder's first token",
      "The encoder's Key and Value vectors as context",
      "The encoder's loss function",
      "Nothing — the decoder works independently",
    ],
    correctAnswer:
      "The encoder's Key and Value vectors as context",
    stepIndex: 4,
    stepLabel: "Decoder Stack",
    explanation:
      "Cross-attention lets the decoder query (Q) the encoder's output, which provides the Key (K) and Value (V) vectors. This is how the decoder accesses the input context.",
  },
  {
    id: 7,
    question:
      "What does the feed-forward network do in a decoder layer?",
    options: [
      "Mixes information between different tokens",
      "Transforms each token's vector independently through a non-linear network",
      "Generates the final translation directly",
      "Removes noise from the attention output",
    ],
    correctAnswer:
      "Transforms each token's vector independently through a non-linear network",
    stepIndex: 4,
    stepLabel: "Decoder Stack",
    explanation:
      "The feed-forward network applies the same two-layer MLP to each token position independently, adding non-linear transformation capacity.",
  },
  {
    id: 8,
    question:
      "What does the linear layer produce from the decoder's output vectors?",
    options: [
      "Attention scores for the next layer",
      "A single number representing confidence",
      "Logits — a raw score for every word in the vocabulary",
      "The final translated sentence as text",
    ],
    correctAnswer:
      "Logits — a raw score for every word in the vocabulary",
    stepIndex: 5,
    stepLabel: "Linear + Softmax",
    explanation:
      "The linear layer projects each decoder output vector to the vocabulary size, producing logits (raw scores) that indicate how likely each word is.",
  },
  {
    id: 9,
    question:
      "What does softmax do to the logits?",
    options: [
      "Picks the largest value and discards the rest",
      "Converts them into probabilities that sum to 1",
      "Rounds each value to the nearest integer",
      "Applies ReLU to remove negatives",
    ],
    correctAnswer: "Converts them into probabilities that sum to 1",
    stepIndex: 5,
    stepLabel: "Linear + Softmax",
    explanation:
      "Softmax normalizes the raw logits into a probability distribution, so we can interpret each value as the likelihood of that word being the next token.",
  },
  {
    id: 10,
    question:
      "How does the decoder generate a full output sentence?",
    options: [
      "It generates all tokens at once in a single pass",
      "It generates tokens one at a time, feeding each back as input for the next",
      "It copies words from the encoder input",
      "It randomly selects tokens until the sentence is long enough",
    ],
    correctAnswer:
      "It generates tokens one at a time, feeding each back as input for the next",
    stepIndex: 6,
    stepLabel: "Output Prediction",
    explanation:
      "This is autoregressive generation: the decoder predicts one token, appends it to the input, and repeats until it produces an <END> token.",
  },
];

export default decoderPostQuiz;
