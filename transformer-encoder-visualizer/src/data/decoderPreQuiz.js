// Pre-Decoder Quiz: 10 conceptual questions for someone who has seen the encoder
// material but hasn't yet studied the decoder. Focuses on intuition about
// generation, sequential prediction, and what a "decoder" might need from an
// "encoder" — not on counting sub-layers or memorizing structure.
//
// Correct-answer positions are intentionally varied across A/B/C/D
// (distribution: A×3, B×2, C×2, D×3) so position is never a tell.
const decoderPreQuiz = [
  {
    id: "dpre-1",
    question:
      "If a model produces a sentence one word at a time, how should it decide each new word?",
    options: [
      "Wait for the user to type the next word",
      "Always output the same word",
      "Pick a word completely at random",
      "Use the words it has already written as context",
    ],
    correctAnswer: "Use the words it has already written as context",
    explanation:
      "Generation is sequential. Each new word naturally depends on what was just written, so the model conditions on its own previous output to stay coherent.",
  },
  {
    id: "dpre-2",
    question:
      "While translating an English sentence into French, the decoder is writing the French version. What should it have access to?",
    options: [
      "Nothing — translation is one-to-one substitution",
      "Both the English sentence and the French it has produced so far",
      "Only the most recent French word it produced",
      "Only the original English sentence",
    ],
    correctAnswer:
      "Both the English sentence and the French it has produced so far",
    explanation:
      "Good translation needs both sides: the original sentence (what to translate) and the partial output (what's already there). The decoder uses both.",
  },
  {
    id: "dpre-3",
    question:
      "A decoder is being trained to write the next word of a story. While predicting word #5, should it be allowed to peek at words #6, #7, and so on?",
    options: [
      "No — that would let it cheat instead of actually predicting",
      "Yes — more information always helps",
      "Yes, but only at the very last word",
      "Only during training, never at use time",
    ],
    correctAnswer:
      "No — that would let it cheat instead of actually predicting",
    explanation:
      "If the model is allowed to see future words during training, it stops learning to predict them. To learn real generation, future positions must be hidden.",
  },
  {
    id: "dpre-4",
    question:
      "What's a sensible way for a generator to decide when to stop producing words?",
    options: [
      "The user clicks a stop button",
      "It always produces exactly 100 words",
      "It outputs a special end-of-sentence signal",
      "It stops when the input runs out of letters",
    ],
    correctAnswer: "It outputs a special end-of-sentence signal",
    explanation:
      "Generation length is variable. The cleanest signal is a dedicated stop token that the model learns to produce when the sentence feels finished.",
  },
  {
    id: "dpre-5",
    question:
      "How might the decoder start, given that it has nothing of its own to begin from?",
    options: [
      "It uses a special \"start\" marker as its first input",
      "It picks the most common word in the language",
      "It waits for the user to type something first",
      "It copies the encoder's first token",
    ],
    correctAnswer: "It uses a special \"start\" marker as its first input",
    explanation:
      "A dedicated start token acts as the seed. The decoder treats it as position 0 and uses it to predict the first real output word.",
  },
  {
    id: "dpre-6",
    question:
      "If the decoder produces a \"probability\" for every word in the vocabulary, what does that mean?",
    options: [
      "Each value is a whole number like 1, 2, or 3",
      "Values are between -1 and 0",
      "Each value is either exactly 0 or exactly 1",
      "All values are positive and add up to 1 across the vocabulary",
    ],
    correctAnswer:
      "All values are positive and add up to 1 across the vocabulary",
    explanation:
      "A probability distribution by definition has non-negative values that sum to 1. That's what lets us treat each value as \"chance this word comes next.\"",
  },
  {
    id: "dpre-7",
    question:
      "Why would a translation decoder need to look back at the encoder's output, not only its own previous words?",
    options: [
      "To copy the encoder's weights into itself",
      "To make the encoder run faster",
      "Because each output word should be grounded in the original sentence",
      "Because the encoder stores the user's settings",
    ],
    correctAnswer:
      "Because each output word should be grounded in the original sentence",
    explanation:
      "Without referring back to the source, the decoder would just be making up plausible-sounding text. Cross-attention is what keeps the output faithful to the input.",
  },
  {
    id: "dpre-8",
    question:
      "Like the encoder, the decoder also adds positional information to its tokens. Why?",
    options: [
      "So the model knows which output position it's currently working on",
      "To match the output length to the input length",
      "To compress vectors into smaller representations",
      "Because positional vectors are required by all neural networks",
    ],
    correctAnswer:
      "So the model knows which output position it's currently working on",
    explanation:
      "Position 3 in the output is different from position 7. The decoder needs to know where it is in the sequence to produce the right word for that slot.",
  },
  {
    id: "dpre-9",
    question:
      "Could a generator produce every word of a sentence at the same time, in parallel?",
    options: [
      "Yes — it would always be faster and equally accurate",
      "No — hardware does not allow parallel work",
      "Yes, but only for sentences longer than 50 words",
      "Each word usually depends on earlier words, so producing them in order makes more sense",
    ],
    correctAnswer:
      "Each word usually depends on earlier words, so producing them in order makes more sense",
    explanation:
      "Later words are conditioned on earlier ones. Generating in parallel would mean each word is chosen without knowing what came before it, which usually hurts quality.",
  },
  {
    id: "dpre-10",
    question:
      "How might we turn a list of raw scores (one per word) into values we can read as \"how likely is each word\"?",
    options: [
      "Round every score to the nearest integer",
      "Normalize them so all become positive and add up to 1",
      "Pick the largest and throw the rest away",
      "Subtract the smallest score from every other",
    ],
    correctAnswer:
      "Normalize them so all become positive and add up to 1",
    explanation:
      "Raw scores can be negative or huge. Normalizing them into a proper probability distribution is exactly what the softmax step does at the end of the decoder.",
  },
];

export default decoderPreQuiz;
