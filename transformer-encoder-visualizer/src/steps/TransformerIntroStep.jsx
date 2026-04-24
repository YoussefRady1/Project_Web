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
      className={`p-6 border rounded-2xl w-[980px] min-h-[620px] flex flex-col items-center ${
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
            A Transformer is a kind of neural network built to work with sequences
            of data, and it really shines on language. Instead of reading words one
            after another, it looks at the whole sentence at once and figures out
            which words connect to which. The idea was first laid out in the paper{" "}
            <em>Attention Is All You Need</em>, and the heart of it is something
            called attention. Attention is just a way for the model to ask, for each
            word, "how much should I care about every other word here?" Older models
            like RNNs had to walk through a sentence step by step, which made them
            slow and forgetful over long passages. Transformers skip that bottleneck
            by processing every word in parallel, so they handle long sentences with
            far less trouble. Before any of that happens, each word gets turned into
            a vector of numbers (an embedding), and a bit of position information is
            mixed in so the model still knows the order. With those two pieces in
            place, the model can capture both what the words mean and how they sit
            together.
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
            The encoder is the side of the Transformer that handles understanding.
            It is built from several identical layers stacked on top of each other,
            and inside each layer you will find two main parts: a self-attention
            block and a small feed-forward network. In self-attention, every word
            takes a quick look at every other word in the sentence and decides which
            ones actually matter for it. Take the sentence "The animal didn't cross
            the street because it was tired." The word "it" needs to figure out what
            it refers to, and through self-attention it learns to lean toward
            "animal" rather than "street." After this back and forth, each word
            ends up with a vector that carries not just its own meaning but also a
            sense of the surrounding context. By stacking encoder layers, the model
            keeps refining these vectors, and it gradually picks up on patterns that
            a single layer would miss.
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
            The decoder takes the encoder's output and uses it to write a new
            sequence, like a translation or an answer. It also stacks multiple
            layers, but it adds one extra trick called masked self-attention. The
            mask makes sure that when the model is predicting the next word, it can
            only look at the words it has already produced and not peek at future
            ones. This keeps the generation honest and lets the model write one word
            at a time. The decoder also has another attention block, often called
            cross attention, that lets it look back at the encoder's output. So when
            the decoder is producing, say, an Arabic translation, it can focus on
            different English words depending on what it is writing at that moment.
            Different families of models pick different sides of this design. BERT
            only uses the encoder because it cares about understanding text. GPT
            only uses the decoder because it cares about generating it. Models like
            T5 keep both halves, which is why they work well on full
            sequence-to-sequence tasks.
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
