// Pre-Quiz: 10 fixed challenging questions designed to surface gaps before learning.
// Questions probe specifics (mechanism details, ordering, math) so an untrained user
// will typically score low — that's intentional, the post-quiz then measures growth.
const preQuiz = [
  {
    id: "pre-1",
    question:
      "Inside scaled dot-product attention, how is the raw score between Query Q and Key K computed before softmax?",
    options: [
      "Q × K^T, then divided by √(d_k)",
      "softmax(Q + K)",
      "Element-wise subtraction Q − K",
      "Dot product of Q and V",
    ],
    correctAnswer: "Q × K^T, then divided by √(d_k)",
    explanation:
      "Attention scores are the dot product of Q and K^T, scaled by √(d_k) to keep softmax gradients stable.",
  },
  {
    id: "pre-2",
    question:
      "In the base Transformer's position-wise feed-forward network, how does the inner hidden dimension d_ff relate to the model dimension d_model?",
    options: [
      "d_ff is the same as d_model",
      "d_ff is roughly 4 times d_model (e.g. 2048 vs 512)",
      "d_ff is half of d_model",
      "d_ff equals the number of attention heads",
    ],
    correctAnswer: "d_ff is roughly 4 times d_model (e.g. 2048 vs 512)",
    explanation:
      "The original Transformer uses d_model = 512 and an FFN inner size d_ff = 2048, a 4× expansion that gives the position-wise MLP enough capacity to transform each token.",
  },
  {
    id: "pre-3",
    question:
      "What does the 'Add' in 'Add & Normalize' refer to inside an encoder layer?",
    options: [
      "Adding learned bias terms",
      "A residual (skip) connection: input + sublayer output",
      "Adding random Gaussian noise",
      "Adding the embedding to itself again",
    ],
    correctAnswer: "A residual (skip) connection: input + sublayer output",
    explanation:
      "The 'Add' is a residual connection that adds the sublayer's input to its output, preserving information across depth.",
  },
  {
    id: "pre-4",
    question:
      "Which positional encoding scheme is introduced in the original Transformer paper?",
    options: [
      "Learned absolute embeddings only",
      "Sine and cosine functions at different frequencies",
      "One-hot position vectors",
      "Random Gaussian noise per position",
    ],
    correctAnswer: "Sine and cosine functions at different frequencies",
    explanation:
      "Vaswani et al. use fixed sinusoids of varying frequencies so the model can extrapolate to longer sequences.",
  },
  {
    id: "pre-5",
    question:
      "How is the position-wise Feed-Forward Network applied inside the encoder?",
    options: [
      "Once per layer, mixing all token positions together",
      "Independently at each token position with shared weights",
      "Only to the first token of the sequence",
      "Only at the residual connections",
    ],
    correctAnswer:
      "Independently at each token position with shared weights",
    explanation:
      "The FFN is applied to each position separately and identically — that's why it's called 'position-wise'.",
  },
  {
    id: "pre-6",
    question:
      "What concrete advantage does multi-head attention give over a single attention head?",
    options: [
      "It runs faster on a CPU",
      "Each head attends to a different learned subspace of the representation",
      "Each head sees a different subset of tokens",
      "All heads share weights to reduce parameters",
    ],
    correctAnswer:
      "Each head attends to a different learned subspace of the representation",
    explanation:
      "Multi-head attention projects Q/K/V into multiple subspaces so the model can jointly attend to different relations.",
  },
  {
    id: "pre-7",
    question:
      "In an encoder–decoder Transformer, where is the encoder's final output consumed?",
    options: [
      "By another stack of encoder layers",
      "By the decoder's cross-attention (encoder-decoder attention) sublayers",
      "By the tokenizer for re-tokenization",
      "By the loss function directly, with no further processing",
    ],
    correctAnswer:
      "By the decoder's cross-attention (encoder-decoder attention) sublayers",
    explanation:
      "Each decoder layer attends to the encoder's outputs through a cross-attention sublayer.",
  },
  {
    id: "pre-8",
    question:
      "What happens to a Transformer encoder if positional encodings are removed entirely?",
    options: [
      "Nothing — attention already encodes order",
      "It becomes permutation-invariant: word order stops mattering",
      "It crashes because shapes no longer match",
      "It produces the exact same outputs but slower",
    ],
    correctAnswer:
      "It becomes permutation-invariant: word order stops mattering",
    explanation:
      "Self-attention by itself is order-agnostic; without positional information, shuffling the input gives the same outputs.",
  },
  {
    id: "pre-9",
    question:
      "After embedding and positional encoding, what is the shape of the input fed into the encoder stack?",
    options: [
      "A single d-dimensional vector summarizing the whole sentence",
      "One d-dimensional vector per token in the sequence",
      "A scalar per token",
      "A 2-D image-like tensor per token",
    ],
    correctAnswer: "One d-dimensional vector per token in the sequence",
    explanation:
      "The encoder receives a sequence of vectors — one d-dimensional vector per token position.",
  },
  {
    id: "pre-10",
    question:
      "Within a single encoder layer, what is the exact order of sub-operations?",
    options: [
      "FFN → Add & Norm → Self-Attention → Add & Norm",
      "Self-Attention → Add & Norm → FFN → Add & Norm",
      "Self-Attention → FFN → Add & Norm",
      "Add & Norm → Self-Attention → Add & Norm → FFN",
    ],
    correctAnswer: "Self-Attention → Add & Norm → FFN → Add & Norm",
    explanation:
      "Each encoder layer is: multi-head self-attention, residual+LayerNorm, position-wise FFN, residual+LayerNorm.",
  },
];

export default preQuiz;
