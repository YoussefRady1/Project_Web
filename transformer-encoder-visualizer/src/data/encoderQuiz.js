// Post-Quiz: 10 fixed straightforward questions covering exactly what the
// visualizations teach (one question per concept, two per heavier topic).
// Designed so a learner who completed the visualizations can score high.
// stepIndex maps to STEP_INDEX_TO_PAGE in EncoderQuizStep for "Go to step" navigation.
const encoderQuiz = [
  {
    id: 1,
    question: "What does tokenization do?",
    options: [
      "Splits a sentence into individual tokens",
      "Adds positional vectors to words",
      "Predicts the next word in the sentence",
      "Computes attention scores",
    ],
    correctAnswer: "Splits a sentence into individual tokens",
    stepIndex: 0,
    stepLabel: "Tokenization",
    explanation:
      "Tokenization breaks the input sentence into smaller units (tokens) so the model can process them one by one.",
  },
  {
    id: 2,
    question: "What is the purpose of embedding?",
    options: [
      "To convert each token into a vector of numbers",
      "To translate the sentence to another language",
      "To remove punctuation from the text",
      "To shorten the sentence",
    ],
    correctAnswer: "To convert each token into a vector of numbers",
    stepIndex: 1,
    stepLabel: "Embedding",
    explanation:
      "Embedding maps each token to a numeric vector that the neural network can actually process.",
  },
  {
    id: 3,
    question: "Why do we add positional encoding?",
    options: [
      "To give each token information about its position in the sentence",
      "To make the sentence shorter",
      "To remove the meaning of words",
      "To merge multiple tokens together",
    ],
    correctAnswer:
      "To give each token information about its position in the sentence",
    stepIndex: 2,
    stepLabel: "Positional Encoding",
    explanation:
      "Self-attention is order-agnostic, so positional encoding is added to tell the model where each token sits in the sequence.",
  },
  {
    id: 4,
    question:
      "In the positional encoding step, what two vectors are added together?",
    options: [
      "The token embedding and the position vector",
      "Query and Key",
      "The encoder output and decoder output",
      "ReLU output and feed-forward bias",
    ],
    correctAnswer: "The token embedding and the position vector",
    stepIndex: 2,
    stepLabel: "Positional Encoding",
    explanation:
      "The position vector is added element-wise to the token embedding to produce the input fed into the encoder stack.",
  },
  {
    id: 5,
    question: "What is the main purpose of self-attention?",
    options: [
      "To let each token use information from other tokens in the sentence",
      "To delete unimportant words",
      "To predict only the first token",
      "To convert text into images",
    ],
    correctAnswer:
      "To let each token use information from other tokens in the sentence",
    stepIndex: 3,
    stepLabel: "Encoder Stack",
    explanation:
      "Self-attention lets every token look at the others to build a context-aware representation of itself.",
  },
  {
    id: 6,
    question: "What is the encoder stack made of?",
    options: [
      "Repeated encoder layers stacked on top of each other",
      "Only one embedding layer",
      "Only feed-forward layers",
      "Only positional encoding layers",
    ],
    correctAnswer: "Repeated encoder layers stacked on top of each other",
    stepIndex: 3,
    stepLabel: "Encoder Stack",
    explanation:
      "The encoder is built by repeating the same encoder layer multiple times to progressively refine token representations.",
  },
  {
    id: 7,
    question:
      "What does the feed-forward layer do inside an encoder layer?",
    options: [
      "Further transforms each token's representation independently",
      "Splits the sentence into tokens",
      "Predicts the next sentence",
      "Adds positional vectors to embeddings",
    ],
    correctAnswer:
      "Further transforms each token's representation independently",
    stepIndex: 3,
    stepLabel: "Encoder Stack",
    explanation:
      "After attention mixes context across tokens, the feed-forward layer refines each token's vector on its own.",
  },
  {
    id: 8,
    question: "What does 'Add & Normalize' help with inside the encoder?",
    options: [
      "Stabilizing training and preserving information from earlier layers",
      "Splitting the sentence into tokens",
      "Generating new tokens",
      "Translating text to another language",
    ],
    correctAnswer:
      "Stabilizing training and preserving information from earlier layers",
    stepIndex: 3,
    stepLabel: "Encoder Stack",
    explanation:
      "The residual addition keeps earlier signal intact, and layer normalization keeps activations well-scaled across depth.",
  },
  {
    id: 9,
    question: "What does the encoder output represent?",
    options: [
      "Final context-aware vectors, one per input token",
      "The translated sentence in another language",
      "A single random number for the sentence",
      "The original sentence unchanged",
    ],
    correctAnswer: "Final context-aware vectors, one per input token",
    stepIndex: 4,
    stepLabel: "Encoder Output",
    explanation:
      "Each input token receives a refined vector that carries information about itself plus the surrounding context.",
  },
  {
    id: 10,
    question: "Which of these is the correct order of the encoder pipeline?",
    options: [
      "Tokenization → Embedding → Positional Encoding → Encoder Stack → Encoder Output",
      "Embedding → Tokenization → Positional Encoding → Output",
      "Encoder Output → Encoder Stack → Tokenization",
      "Tokenization → Output → Embedding → Positional Encoding",
    ],
    correctAnswer:
      "Tokenization → Embedding → Positional Encoding → Encoder Stack → Encoder Output",
    stepIndex: 4,
    stepLabel: "Encoder Output",
    explanation:
      "This is the top-level encoder flow you walked through across the visualization steps.",
  },
];

export default encoderQuiz;
