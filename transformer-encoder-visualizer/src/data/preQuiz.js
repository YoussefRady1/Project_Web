const preQuiz = [
  {
    id: "pre-1",
    question: "What do you think a Transformer does with a sentence?",
    options: [
      "It translates text by looking up words in a dictionary",
      "It processes the sentence through multiple stages to understand and generate text",
      "It simply memorizes sentences it has seen before",
      "It counts the number of words in the sentence",
    ],
    correctAnswer:
      "It processes the sentence through multiple stages to understand and generate text",
    explanation:
      "A Transformer uses a pipeline of stages (tokenization, embedding, attention, etc.) to build understanding of the input and generate output.",
  },
  {
    id: "pre-2",
    question:
      "Before a model can work with words, what do you think needs to happen first?",
    options: [
      "The sentence must be split into smaller pieces (tokens)",
      "The sentence must be translated to another language",
      "The sentence must be shortened to 3 words",
      "Nothing — the model reads the full sentence at once",
    ],
    correctAnswer:
      "The sentence must be split into smaller pieces (tokens)",
    explanation:
      "Tokenization splits the sentence into individual tokens so the model can process each one separately.",
  },
  {
    id: "pre-3",
    question: "Why can't a neural network directly understand the word \"hello\"?",
    options: [
      "Because neural networks only work with numbers, not text",
      "Because \"hello\" is too short",
      "Because neural networks only understand images",
      "Because \"hello\" is not a real word",
    ],
    correctAnswer:
      "Because neural networks only work with numbers, not text",
    explanation:
      "Words must be converted into numeric vectors (embeddings) before a neural network can process them.",
  },
  {
    id: "pre-4",
    question:
      "If a model processes all words at the same time (in parallel), what information might it lose?",
    options: [
      "The order of words in the sentence",
      "The number of letters in each word",
      "The color of the text",
      "The font size",
    ],
    correctAnswer: "The order of words in the sentence",
    explanation:
      "Parallel processing means the model doesn't naturally know which word came first — that's why positional encoding is needed.",
  },
  {
    id: "pre-5",
    question:
      "In the sentence \"The bank by the river\", how should the word \"bank\" be understood?",
    options: [
      "It depends on the surrounding words (context matters)",
      "It always means a financial institution",
      "It always means the side of a river",
      "The model ignores ambiguous words",
    ],
    correctAnswer:
      "It depends on the surrounding words (context matters)",
    explanation:
      "Self-attention allows each word to look at other words in the sentence to resolve ambiguity — this is a key idea in Transformers.",
  },
  {
    id: "pre-6",
    question: "What do you think \"self-attention\" means in a Transformer?",
    options: [
      "Each word looks at other words in the same sentence to understand context",
      "The model pays attention only to itself and ignores input",
      "The model removes unimportant words",
      "The model only focuses on the first word",
    ],
    correctAnswer:
      "Each word looks at other words in the same sentence to understand context",
    explanation:
      "Self-attention is the mechanism that lets every token compare itself with every other token in the sentence.",
  },
  {
    id: "pre-7",
    question: "Why might a model need multiple layers instead of just one?",
    options: [
      "Each layer refines understanding, building deeper context step by step",
      "More layers make the model run faster",
      "Extra layers are just for decoration",
      "One layer is always enough",
    ],
    correctAnswer:
      "Each layer refines understanding, building deeper context step by step",
    explanation:
      "Stacking encoder layers lets the model progressively build richer representations of the input.",
  },
  {
    id: "pre-8",
    question:
      "What is the relationship between an encoder and a decoder in a Transformer?",
    options: [
      "The encoder understands the input; the decoder generates the output using that understanding",
      "They are the same thing with different names",
      "The decoder runs first, then the encoder",
      "The encoder and decoder never communicate",
    ],
    correctAnswer:
      "The encoder understands the input; the decoder generates the output using that understanding",
    explanation:
      "The encoder processes the input sentence into context-aware representations, and the decoder uses those to generate output (e.g., a translation).",
  },
  {
    id: "pre-9",
    question:
      "If you remove all connections between words in a model, what happens?",
    options: [
      "Each word is processed in isolation, losing sentence-level meaning",
      "The model works perfectly fine",
      "The model becomes faster and more accurate",
      "Nothing changes",
    ],
    correctAnswer:
      "Each word is processed in isolation, losing sentence-level meaning",
    explanation:
      "Without attention connections, words can't share information, so the model loses contextual understanding.",
  },
  {
    id: "pre-10",
    question: "What do you think the final output of an encoder represents?",
    options: [
      "A context-aware numeric representation for each input token",
      "The translated sentence in another language",
      "A single number summarizing the whole sentence",
      "The original sentence unchanged",
    ],
    correctAnswer:
      "A context-aware numeric representation for each input token",
    explanation:
      "The encoder outputs one vector per token, each enriched with information from the surrounding context.",
  },
];

export default preQuiz;
