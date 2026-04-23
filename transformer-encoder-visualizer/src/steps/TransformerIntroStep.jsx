import { useState } from "react";
import { motion } from "framer-motion";

function TransformerIntroStep({ active, theme, setStep, userName, setUserName }) {
  const isDark = theme === "dark";
  const [nameInput, setNameInput] = useState(userName || "");
  const [nameError, setNameError] = useState(false);

  const handleStart = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setUserName(trimmed);
    localStorage.setItem("userName", trimmed);
    setStep(1);
  };

  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        scale: active ? 1 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className={`p-6 border rounded-2xl w-[980px] min-h-[620px] flex flex-col items-center overflow-y-auto max-h-[85vh] ${
        isDark ? "border-cyan-500" : "border-blue-300 bg-white"
      }`}
    >
      <h2
        className={`font-semibold text-center mb-4 ${
          isDark ? "text-cyan-300" : "text-blue-800"
        }`}
      >
        What is a Transformer?
      </h2>

      <div className="w-full max-w-[800px] space-y-5 mb-6">
        <div
          className={`rounded-xl border p-4 ${
            isDark
              ? "border-cyan-400/30 bg-cyan-400/5"
              : "border-blue-300 bg-blue-50"
          }`}
        >
          <div
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            Overview
          </div>
          <p
            className={`text-[12px] leading-6 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Transformer models are a type of neural network designed to process
            sequences—especially language—by focusing on relationships between words
            rather than reading them one by one. Introduced in the paper{" "}
            <em>Attention Is All You Need</em>, the key idea is attention, which allows
            the model to weigh how important each word is relative to others in a
            sentence. Instead of relying on recurrence like older models (RNNs),
            transformers process all words in parallel, making them faster and better at
            capturing long-range dependencies. Every word is first converted into a
            numerical vector (embedding), and then positional information is added so
            the model understands word order. This combination allows the model to
            represent both meaning and structure effectively.
          </p>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <div
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            The Encoder
          </div>
          <p
            className={`text-[12px] leading-6 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            The encoder part of the transformer is responsible for understanding the
            input. It consists of multiple identical layers, each containing two main
            components: self-attention and a feed-forward neural network. In
            self-attention, each word compares itself with every other word in the
            sentence to determine which ones are most relevant. For example, in "The
            animal didn't cross the street because it was tired," the word "it" learns
            to focus more on "animal" than "street." This process produces a
            contextualized representation of each word—meaning each word's vector now
            reflects its meaning within the full sentence, not just in isolation.
            Stacking multiple encoder layers allows the model to refine this
            understanding progressively, capturing deeper linguistic patterns.
          </p>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            isDark
              ? "border-slate-700 bg-slate-900/80"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <div
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-cyan-300" : "text-blue-800"
            }`}
          >
            The Decoder
          </div>
          <p
            className={`text-[12px] leading-6 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            The decoder uses the encoder's output to generate a new sequence, such as a
            translation or a response. It also has multiple layers but includes an
            additional mechanism: masked self-attention, which ensures that when
            predicting a word, the model can only look at previously generated words
            (not future ones). This makes the generation process step-by-step and
            realistic. Another attention layer, called encoder–decoder attention, allows
            the decoder to focus on the most relevant parts of the input while
            producing each word. For example, when generating an Arabic translation, the
            decoder dynamically attends to different English words depending on what it
            is currently producing. Models like BERT use only the encoder for
            understanding tasks, while GPT uses only the decoder for generation, and
            models like T5 combine both for full sequence-to-sequence tasks.
          </p>
        </div>
      </div>

      <div
        className={`w-full max-w-[500px] rounded-xl border p-5 mb-4 ${
          isDark
            ? "border-cyan-400/30 bg-cyan-400/5"
            : "border-blue-300 bg-blue-50"
        }`}
      >
        <label
          className={`block text-sm font-semibold mb-2 text-center ${
            isDark ? "text-cyan-300" : "text-blue-800"
          }`}
        >
          Enter your name to begin
        </label>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => {
            setNameInput(e.target.value);
            if (nameError) setNameError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          placeholder="Your name..."
          className={`w-full px-4 py-2.5 rounded-lg border text-sm transition ${
            isDark
              ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400"
              : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400"
          } outline-none ${nameError ? (isDark ? "border-red-400" : "border-red-500") : ""}`}
        />
        {nameError && (
          <p className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
            Please enter your name before continuing.
          </p>
        )}
      </div>

      <button
        onClick={handleStart}
        className={`px-6 py-2.5 rounded-full text-sm font-bold transition ${
          isDark
            ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            : "bg-blue-600 text-white hover:bg-blue-500"
        }`}
      >
        Start Pre-Quiz →
      </button>
    </motion.div>
  );
}

export default TransformerIntroStep;
