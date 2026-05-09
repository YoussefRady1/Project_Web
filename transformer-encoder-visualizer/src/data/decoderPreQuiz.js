const decoderPreQuiz = [
  {
    id: "dpre-1",
    question:
      "Why does the decoder mask future positions during self-attention?",
    options: [
      "To speed up training by skipping tokens",
      "To prevent the model from cheating by looking at tokens it hasn't generated yet",
      "To remove stop words from the sequence",
      "To reduce the size of the attention matrix",
    ],
    correctAnswer:
      "To prevent the model from cheating by looking at tokens it hasn't generated yet",
    explanation:
      "During autoregressive generation the decoder produces one token at a time. Masking future positions ensures each token can only attend to previously generated tokens, preserving the left-to-right generation order.",
  },
  {
    id: "dpre-2",
    question:
      "In cross-attention, where do the Query, Key, and Value vectors come from?",
    options: [
      "All three come from the decoder",
      "All three come from the encoder",
      "Query from the decoder; Key and Value from the encoder",
      "Query from the encoder; Key and Value from the decoder",
    ],
    correctAnswer:
      "Query from the decoder; Key and Value from the encoder",
    explanation:
      "Cross-attention lets the decoder query the encoder's output. The decoder provides Q (what it's looking for), while the encoder provides K and V (what information is available).",
  },
  {
    id: "dpre-3",
    question:
      "What is the role of the feed-forward network inside a decoder layer?",
    options: [
      "It connects the decoder to the encoder",
      "It independently transforms each token's vector through a non-linear projection",
      "It generates the final output probabilities",
      "It computes attention scores between tokens",
    ],
    correctAnswer:
      "It independently transforms each token's vector through a non-linear projection",
    explanation:
      "The position-wise FFN applies a two-layer MLP with a non-linearity (ReLU) to each token independently, adding representational capacity after attention has mixed context.",
  },
  {
    id: "dpre-4",
    question:
      "How many Add & Normalize operations are inside each decoder layer?",
    options: [
      "One — after cross-attention only",
      "Two — after masked self-attention and cross-attention",
      "Three — after masked self-attention, cross-attention, and feed-forward",
      "Zero — the decoder doesn't use normalization",
    ],
    correctAnswer:
      "Three — after masked self-attention, cross-attention, and feed-forward",
    explanation:
      "Each decoder layer has three sub-layers (masked self-attention, cross-attention, FFN), and each is followed by a residual connection plus layer normalization.",
  },
  {
    id: "dpre-5",
    question:
      "What does the linear projection layer do after the decoder stack?",
    options: [
      "Reduces the sequence length to one vector",
      "Projects the decoder output to the vocabulary size to produce logits for each word",
      "Converts vectors back into character-level tokens",
      "Applies dropout for regularization",
    ],
    correctAnswer:
      "Projects the decoder output to the vocabulary size to produce logits for each word",
    explanation:
      "The linear layer maps each decoder output vector (dimension d_model) to a vector of size |vocabulary|, producing raw scores (logits) for every possible next token.",
  },
  {
    id: "dpre-6",
    question:
      "What does the softmax function do to the logits from the linear layer?",
    options: [
      "Sets negative values to zero",
      "Normalizes them into a probability distribution that sums to 1",
      "Selects the top-K largest values",
      "Applies temperature scaling only",
    ],
    correctAnswer:
      "Normalizes them into a probability distribution that sums to 1",
    explanation:
      "Softmax exponentiates each logit and divides by the sum of all exponentials, turning raw scores into probabilities so we can sample or pick the most likely token.",
  },
  {
    id: "dpre-7",
    question: "What does 'autoregressive generation' mean in a decoder?",
    options: [
      "The decoder processes all output tokens in parallel at once",
      "Each generated token is fed back as input for predicting the next token",
      "The decoder copies the encoder's output directly",
      "Tokens are generated in random order and sorted later",
    ],
    correctAnswer:
      "Each generated token is fed back as input for predicting the next token",
    explanation:
      "Autoregressive means the model generates one token at a time, feeding each prediction back as part of the input sequence for the next step.",
  },
  {
    id: "dpre-8",
    question: "What signals the decoder to stop generating tokens?",
    options: [
      "When the attention scores drop below a threshold",
      "When the decoder runs out of memory",
      "When the model predicts a special end-of-sequence token (e.g. <END> or <EOS>)",
      "After exactly as many steps as the input length",
    ],
    correctAnswer:
      "When the model predicts a special end-of-sequence token (e.g. <END> or <EOS>)",
    explanation:
      "Generation continues until the model produces a special <END>/<EOS> token or hits a maximum length limit.",
  },
  {
    id: "dpre-9",
    question:
      "What is the purpose of the <START> (or <BOS>) token in the decoder?",
    options: [
      "It marks the boundary between encoder and decoder",
      "It provides the initial input to kick off autoregressive generation",
      "It replaces the first encoder token",
      "It is used only during training, not inference",
    ],
    correctAnswer:
      "It provides the initial input to kick off autoregressive generation",
    explanation:
      "The <START> token is the seed: the decoder uses it as its first input to predict the very first output token, then continues autoregressively.",
  },
  {
    id: "dpre-10",
    question:
      "What is the correct order of sub-layers inside a single decoder layer?",
    options: [
      "Cross-Attention → Masked Self-Attention → FFN",
      "FFN → Masked Self-Attention → Cross-Attention",
      "Masked Self-Attention → Cross-Attention → FFN",
      "Masked Self-Attention → FFN → Cross-Attention",
    ],
    correctAnswer: "Masked Self-Attention → Cross-Attention → FFN",
    explanation:
      "Each decoder layer first does masked self-attention (look at own past tokens), then cross-attention (look at encoder output), then a feed-forward network.",
  },
];

export default decoderPreQuiz;
