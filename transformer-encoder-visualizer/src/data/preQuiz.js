// Pre-Encoder Quiz: 10 conceptual questions for someone who hasn't studied
// transformers yet. The goal is to probe intuition about sequences, attention,
// and word meaning — not to test formulas. A thoughtful learner should be able
// to reason their way through most of these without prior NLP training.
//
// Correct-answer positions are intentionally varied across A/B/C/D
// (distribution: A×3, B×2, C×3, D×2) so position is never a tell.
const preQuiz = [
  {
    id: "pre-1",
    question:
      "When a language model is given the sentence \"The cat sat on the mat,\" what is the most natural first step for it to take?",
    options: [
      "Break the sentence into smaller pieces it can work with",
      "Memorize the whole sentence as a single image",
      "Translate it into another language first",
      "Look up the sentence in a stored list of examples",
    ],
    correctAnswer: "Break the sentence into smaller pieces it can work with",
    explanation:
      "Models don't operate on whole sentences directly. The first move is to split the input into smaller units (tokens) that can be processed one at a time.",
  },
  {
    id: "pre-2",
    question:
      "Why would a model represent each word as a list of numbers instead of keeping it as text?",
    options: [
      "Numbers take up less space on disk",
      "Programming languages require it",
      "Math only works on numbers, not on letters",
      "It makes the output easier to display",
    ],
    correctAnswer: "Math only works on numbers, not on letters",
    explanation:
      "Neural networks are layers of mathematical operations. To feed words into that machinery, each word has to first become a vector of numbers.",
  },
  {
    id: "pre-3",
    question:
      "\"The dog chased the cat\" and \"The cat chased the dog\" use the exact same words. What does the difference between them tell us a model needs to track?",
    options: [
      "Punctuation",
      "Spelling",
      "Sentence length",
      "Word order",
    ],
    correctAnswer: "Word order",
    explanation:
      "Same words, different order, different meaning. A model that ignores position would treat both sentences as identical, which is clearly wrong.",
  },
  {
    id: "pre-4",
    question:
      "The word \"attention\" suggests the model is doing what while it reads a sentence?",
    options: [
      "Reading the sentence in reverse",
      "Focusing more on certain words when interpreting another",
      "Skipping unimportant words completely",
      "Counting how often each word appears",
    ],
    correctAnswer: "Focusing more on certain words when interpreting another",
    explanation:
      "Attention is the idea that when you process one word, you weigh how much each other word matters for its meaning — exactly like a human focusing on relevant context.",
  },
  {
    id: "pre-5",
    question:
      "Why isn't translating English to French as easy as replacing every English word with its French equivalent?",
    options: [
      "French dictionaries are not available online",
      "French has fewer words than English",
      "Translation requires special hardware",
      "Word-for-word swaps miss grammar and context",
    ],
    correctAnswer: "Word-for-word swaps miss grammar and context",
    explanation:
      "Languages reorder words, use different idioms, and rely on context. A meaningful translation has to consider the whole sentence, not just dictionary entries.",
  },
  {
    id: "pre-6",
    question:
      "The word \"bank\" means something different in \"river bank\" than in \"bank account.\" What does a model need in order to tell them apart?",
    options: [
      "Read each word completely in isolation",
      "Replace \"bank\" with its longest definition",
      "Use the surrounding words to figure out meaning",
      "Ask the user which meaning they intended",
    ],
    correctAnswer: "Use the surrounding words to figure out meaning",
    explanation:
      "Most words are ambiguous on their own. Context — the words nearby — is what disambiguates them, and any useful model must take that into account.",
  },
  {
    id: "pre-7",
    question:
      "When a model writes a sentence one word at a time, what's the most sensible way to choose each new word?",
    options: [
      "Use the words generated so far to predict what comes next",
      "Pick a random word from the dictionary",
      "Always pick the most frequent word in the language",
      "Copy the next word from the input sentence",
    ],
    correctAnswer:
      "Use the words generated so far to predict what comes next",
    explanation:
      "Generation is sequential: each new word depends on the ones already written, the same way you finish someone else's sentence based on what they've said so far.",
  },
  {
    id: "pre-8",
    question:
      "Why might a model apply the same kind of operation repeatedly (stacked layers) instead of one giant custom step?",
    options: [
      "Repeating layers is easier to debug",
      "Computers can only execute one type of layer",
      "Each repetition can refine the model's understanding a bit further",
      "It's a hardware requirement",
    ],
    correctAnswer:
      "Each repetition can refine the model's understanding a bit further",
    explanation:
      "Stacking small, similar layers lets the model build up complex understanding gradually, with each layer slightly improving on the previous one's output.",
  },
  {
    id: "pre-9",
    question:
      "A transformer has two main parts: an encoder and a decoder. What's the most reasonable split of jobs between them?",
    options: [
      "The encoder writes the output; the decoder reads the input",
      "The encoder reads the input; the decoder produces the output",
      "Both do the same thing twice for safety",
      "The encoder shrinks the data; the decoder grows it back unchanged",
    ],
    correctAnswer:
      "The encoder reads the input; the decoder produces the output",
    explanation:
      "The names are a hint. The encoder builds an understanding of the input sentence, and the decoder uses that understanding to write the output sentence.",
  },
  {
    id: "pre-10",
    question:
      "If you shuffle a sentence's words (\"mat the cat the on sat\"), the meaning falls apart for a human. For a model to behave the same way, what does it need to keep track of?",
    options: [
      "The position of each word in the sentence",
      "How many words are in the sentence",
      "Which letters are capitalized",
      "How long each word is",
    ],
    correctAnswer: "The position of each word in the sentence",
    explanation:
      "Without positional information, a model treats a sentence as an unordered bag of words and loses access to grammatical structure entirely.",
  },
];

export default preQuiz;
