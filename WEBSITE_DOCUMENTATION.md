# Interactive Transformer Encoder–Decoder Visualizer — Complete System Documentation

This document is a full, detailed written description of every page, component, feature, interaction, animation, mathematical formula, and educational text string in the web application. It is written so that it can be used as raw methodology material for a bachelor thesis. Everything below was read directly from the source code.

---

## PART A — APPLICATION-LEVEL ARCHITECTURE

### A.1 Technology and entry point

The application is a single-page React web app created with Create React App (react-scripts 5.0.1). React version 19.2.4 is used. Styling is done with Tailwind CSS 3.4.1 through PostCSS and Autoprefixer. Animation is handled by Framer Motion 12.38.0. The in-browser machine-learning model is run with `@xenova/transformers` 2.17.2, which is Transformers.js running on ONNX Runtime and WebAssembly. The dependency list also includes D3.js 7.9.0 and `reactflow` 11.11.4, but neither D3 nor ReactFlow is actually imported by any current component, so both are unused dependencies. `mongoose` 9.5.0 is used by the backend API files. The test libraries (`@testing-library/*`) and `web-vitals` are present but only `App.test.js`, which is the default CRA placeholder test, exists, and that test looks for the text "learn react" which does not appear in the app, so it would fail.

The entry point is `src/index.js`. It creates a React root on the DOM element with id `root` and renders the `App` component inside `React.StrictMode`. It also calls `reportWebVitals()` with no argument, so no performance reporting actually happens.

The build script is `cross-env CI=false react-scripts build`, which disables CI-mode failures on warnings. The `vercel.json` file sets the build environment variables `CI=false` and `DISABLE_ESLINT_PLUGIN=true`, and defines two rewrites: any request to `/api/(.*)` is routed to the matching API file, and every other request is routed to `/index.html` so the single-page app handles routing. A Netlify `_redirects` file also exists with the rule `/* /index.html 200`.

### A.2 Global state in App.js

`App.js` is the root component. It owns all global state. On mount it runs a `useEffect` that calls `getModel()` once with no progress callback, which begins downloading the T5-Small model in the background as soon as the app loads, before the user ever reaches the architecture page.

The global state variables, their initial values, and their persistence are as follows. `tokens` is an array, initial value empty array, runtime only — it holds the words of the sentence the user typed. `step` is a number, initial value 0, runtime only — it is the index of the current page. `theme` is a string, initial value `"dark"`, runtime only — it is either `"dark"` or `"light"`.

The remaining state variables are all persisted in `localStorage` and are read back with lazy initializers. `userName` is a string read from `localStorage.getItem("userName")` or empty string. `dbRecordId` is the MongoDB record id read from `localStorage.getItem("dbRecordId")` or `null`. `preQuizCompleted` is a boolean read as `localStorage.getItem("preQuizCompleted") === "true"`. `postQuizCompleted` is the same pattern for `"postQuizCompleted"`. `preQuizScore` is a number read as `Number(localStorage.getItem("preQuizScore")) || 0`. `postQuizScore` is the same for `"postQuizScore"`. `encoderPostCompleted` and `encoderPostScore` follow the same boolean and number patterns for keys `"encoderPostCompleted"` and `"encoderPostScore"`. `decoderPreCompleted` and `decoderPreScore` do the same for `"decoderPreCompleted"` and `"decoderPreScore"`. `decoderPostCompleted` and `decoderPostScore` do the same for `"decoderPostCompleted"` and `"decoderPostScore"`.

### A.3 Session functions in App.js

`resetSession()` clears all quiz state back to defaults: it sets `dbRecordId` to null, all five completion booleans to false, and all five scores to 0, and then it removes from `localStorage` the keys `dbRecordId`, `preQuizCompleted`, `preQuizScore`, `postQuizCompleted`, `postQuizScore`, `encoderPostCompleted`, `encoderPostScore`, `decoderPreCompleted`, `decoderPreScore`, `decoderPostCompleted`, `decoderPostScore`, `postQuizAnswers`, `encoderPostQuizAnswers`, and `decoderPostQuizAnswers`. This is the "start fresh as a new user" mechanism.

`submitPreQuiz(score)` is async. It sets `preQuizScore` and `preQuizCompleted`, writes both to `localStorage`, then does a `fetch` POST to `/api/save-pre-quiz` with a JSON body `{ name: userName, preQuizScore: score }`. If the response JSON contains an `id`, it stores that as `dbRecordId` in state and `localStorage`. All network errors are silently swallowed in an empty `catch`.

`submitPostQuiz(score)` sets `postQuizScore` and `postQuizCompleted`, writes to `localStorage`, then POSTs to `/api/save-post-quiz` with body `{ id: dbRecordId, postQuizScore: score }`. Errors are swallowed.

`submitEncoderPostQuiz(score)` sets `encoderPostScore` and `encoderPostCompleted`, writes both to `localStorage`, and also mirrors the same score into `postQuizScore` and `postQuizCompleted` and their `localStorage` keys. It then POSTs to `/api/save-quiz` with body `{ id: dbRecordId, quizType: "encoderPostScore", score }`.

`submitDecoderPreQuiz(score)` sets `decoderPreScore` and `decoderPreCompleted`, writes to `localStorage`, then POSTs to `/api/save-quiz` with body `{ id: dbRecordId, quizType: "decoderPreScore", score }`.

`submitDecoderPostQuiz(score)` sets `decoderPostScore` and `decoderPostCompleted`, writes to `localStorage`, then POSTs to `/api/save-quiz` with body `{ id: dbRecordId, quizType: "decoderPostScore", score }`.

### A.4 App.js layout

`App.js` derives `isDark` from `theme`, and `showTokenInput` is true when `step >= FIRST_PAGE_NEEDING_TOKENS`, where `FIRST_PAGE_NEEDING_TOKENS` is 3. The full-screen container uses a 300ms color transition and is `bg-slate-950 text-white` in dark mode, `bg-slate-100 text-slate-900` in light mode.

The header is a flex bar with a bottom border and shadow. In dark mode its background is a gradient `from-slate-950 via-slate-900 to-cyan-950` with a cyan border at 30 percent opacity; in light mode it is a gradient `from-blue-800 via-blue-700 to-blue-900` with a blue-900 border. On the left of the header is the logo image — `transformer-nexus-logo-dark.svg` in dark mode, `transformer-nexus-logo.svg` in light mode — sized 56 by 56 pixels with a rounded box and a glowing ring, followed by the bold text "Transformer Visualizer". On the right of the header is, conditionally, a "Welcome, {userName}" line shown only when a name exists, then the `StepSearch` component, then the theme toggle button. The toggle button reads "☀ Light Mode" when dark and "🌙 Dark Mode" when light, and clicking it flips the theme.

Below the header is a thin bordered strip containing the `AnimationController` (the Back and Next buttons). Below that is another strip containing the `TokenInput` text box; this strip is fully visible (`opacity-100`) only when `showTokenInput` is true, otherwise it is `opacity-0 pointer-events-none`, so the sentence input is hidden on the intro and pre-quiz pages and only appears from the architecture page onward. The remaining vertical space is a centered flex area that contains the `MainCanvas`, which receives the entire prop bundle of state and submit functions.

### A.5 The step router — MainCanvas.jsx

`MainCanvas.jsx` is the step router. It defines a `PAGE_CONFIG` array of 18 entries; therefore the application has exactly 18 pages. Each entry has `component`, `title`, `label`, `section`, and `keywords`. The array is exported so the search component can read it. `TOTAL_PAGES` is exported as `PAGE_CONFIG.length`, which is 18. `FIRST_PAGE_NEEDING_TOKENS` is exported as the constant 3.

The 18 pages in order, with index, component, title, label, and section, are:

0 — `TransformerIntroStep` — "Transformer Overview" — label "Overview" — section "overview".
1 — `PreQuizStep` — "Encoder Pre-Quiz" — label "Pre-Quiz" — section "overview".
2 — `TransformerArchitectureStep` — "Architecture Overview" — label "Architecture" — section "architecture".
3 — `TokenStep` — "Step 1: Tokenization" — label "Encoder 1 of 5" — section "encoder".
4 — `EmbeddingStep` — "Step 2: Embedding" — label "Encoder 2 of 5" — section "encoder".
5 — `PositionalStep` — "Step 3: Positional Encoding" — label "Encoder 3 of 5" — section "encoder".
6 — `EncoderStackStep` — "Step 4: Encoder Stack" — label "Encoder 4 of 5" — section "encoder".
7 — `EncoderOutputStep` — "Step 5: Encoder Output" — label "Encoder 5 of 5" — section "encoder".
8 — `EncoderPostQuizStep` — "Encoder Post-Quiz" — label "Encoder Quiz" — section "encoder-quiz".
9 — `DecoderPreQuizStep` — "Decoder Pre-Quiz" — label "Decoder Pre-Quiz" — section "decoder-quiz".
10 — `DecoderTransitionStep` — "Encoder → Decoder Transfer" — label "Transition" — section "decoder".
11 — `DecoderTokenStep` — "Step 1: Output Tokenization" — label "Decoder 1 of 4" — section "decoder".
12 — `DecoderEmbeddingStep` — "Step 2: Output Embedding" — label "Decoder 2 of 4" — section "decoder".
13 — `DecoderPositionalStep` — "Step 3: Positional Encoding" — label "Decoder 3 of 4" — section "decoder".
14 — `DecoderStackStep` — "Step 4: Decoder Stack" — label "Decoder 4 of 4" — section "decoder".
15 — `DecoderLinearSoftmaxStep` — "Linear + Softmax" — label "Linear + Softmax" — section "linear".
16 — `DecoderOutputStep` — "Output Prediction" — label "Output" — section "output".
17 — `DecoderPostQuizStep` — "Decoder Post-Quiz" — label "Final Quiz" — section "final-quiz".

Note that the `EncoderQuizStep.jsx` file also exists and contains its own complete quiz screen, but it is not referenced in `PAGE_CONFIG`; the page actually wired in at index 8 is `EncoderPostQuizStep`. Likewise `DecoderMaskedAttentionStep`, `DecoderCrossAttentionStep`, `DecoderFeedForwardStep`, `AttentionStep`, and `FeedForwardStep` are not top-level pages — they are sub-views hosted inside `DecoderStackStep` and `EncoderStackStep`. `DecoderAddNormStep.jsx` exists as a complete reusable component with a `variant` prop, but it is not imported by `MainCanvas` or by `DecoderStackStep`; the Add & Normalize content inside the decoder stack is rendered inline instead, so `DecoderAddNormStep.jsx` is effectively unused in the current wiring.

`MainCanvas` also defines a `SECTION_MAP` of nine sections in order: `overview` ("Overview"), `architecture` ("Architecture"), `encoder` ("Encoder"), `encoder-quiz` ("Encoder Quiz"), `decoder-quiz` ("Decoder Quiz"), `decoder` ("Decoder"), `linear` ("Linear + Softmax"), `output` ("Output"), `final-quiz` ("Final Quiz").

`MainCanvas` computes `progress` as `((step + 1) / TOTAL_PAGES) * 100`. It renders, in the top-right corner with `z-20`, a vertical section navigator: a rounded bordered panel listing all nine sections. Each section is a button; clicking it jumps to the first page whose `section` matches. The currently active section is highlighted (cyan in dark, blue in light), past sections are shown in green, future sections in muted slate, and each has a small colored status dot. Thin vertical connector lines run between the dots, green for completed segments.

Below the section navigator, centered, is the progress header. It shows the page `label` on the left and the page `title` on the right, then a 2-pixel-tall rounded progress bar. The fill is a Framer Motion `motion.div` animating its `width` from 0 to `${progress}%` over 0.7 seconds with a custom cubic-bezier ease `[0.16, 1, 0.3, 1]`. On top of the bar a 64-pixel-wide white gradient "shine" element sweeps from left -10 percent to 110 percent over 2.2 seconds, repeating infinitely with a 0.6-second repeat delay, using `mix-blend-mode: overlay`.

The page itself is rendered inside `AnimatePresence` with `mode="wait"`. The active step component is wrapped in a `motion.div` keyed by `step`. The page transition is: initial state opacity 0, y offset 28 pixels, scale 0.965, blur 8 pixels; animate to opacity 1, y 0, scale 1, blur 0; exit to opacity 0, y -28, scale 0.965, blur 8. The transition lasts 0.65 seconds with ease `[0.16, 1, 0.3, 1]`. The step component receives `active` true, plus `tokens`, `setStep`, `theme`, `userName`, `setUserName`, all the quiz completion flags and scores, all the submit functions, `resetSession`, and any `config.props` spread in (no page currently sets `props`).

### A.6 Navigation controller — AnimationController.jsx

`AnimationController.jsx` renders two buttons centered in a flex row. The "Back" button calls `setStep(s => Math.max(s - 1, 0))` and is disabled (40 percent opacity, not-allowed cursor) when `step` is 0. The "Next →" button calls `setStep(s => Math.min(s + 1, TOTAL_PAGES - 1))` and is disabled when `step` is `TOTAL_PAGES - 1` (17). In dark mode the Next button is solid cyan with black text; in light mode it is solid blue with white text.

### A.7 Sentence input — TokenInput.jsx

`TokenInput.jsx` is a single text input, 460 pixels wide, centered, rounded. Its default sentence is the constant `DEFAULT_SENTENCE = "I love sunny days"`. On every keystroke a `useEffect` recomputes the tokens by taking the sentence, calling `.trim()`, splitting on `/\s+/`, and filtering out empty strings, then calls `setTokens` with the resulting array. So tokenization in this app is simply whitespace splitting.

### A.8 Step search — StepSearch.jsx

`StepSearch.jsx` is the search box in the header. It holds a `query` string and an `open` boolean. It uses a `useMemo` to compute `matches`: if the trimmed lowercased query is empty it returns an empty array, otherwise it maps every `PAGE_CONFIG` entry into an object with `index`, `title`, `label`, and a `haystack` string that concatenates the title, label, section, and keywords all lowercased; it filters to entries whose haystack `includes` the query and slices to the first 6 matches. A `useEffect` adds a document `mousedown` listener that closes the dropdown when the user clicks outside the wrapper. Pressing Enter jumps to the first match; pressing Escape closes the dropdown. The dropdown shows up to 6 results, each a button showing the page title and label, and clicking one calls `setStep(idx)`. If there are no matches it shows the text "Not found". The search icon is a 🔍 emoji and there is a ✕ clear button when text is present.

### A.9 Shared utilities and conventions

There is no shared utilities file. Several helper functions are duplicated verbatim across many step files instead of being centralized. The most important duplicated function is `generateEmbeddingVector(word)` (sometimes named `generateVector`). Its full logic: lowercase the word; if empty, return four zeros; split into characters; map each character to its `charCodeAt(0)` code; compute `sum` as the total of all codes, `first` as the first code, `last` as the last code, `length` as the word length, and `vowelCount` as the count of characters that are a, e, i, o, or u. Then it produces a four-dimensional vector where the first value is `(sum % 100) / 100`, the second is `((first * length) % 100) / 100`, the third is `((last + vowelCount * 7) % 100) / 100`, and the fourth is `(((sum + first + last + length) * 3) % 100) / 100`, each rounded with `.toFixed(2)`. Some files return string values from `.toFixed(2)`, others wrap them in `Number(...)`; the math is identical. This function appears in `EmbeddingStep.jsx`, `PositionalStep.jsx`, `EncoderStackStep`'s children, `AttentionStep.jsx`, `FeedForwardStep.jsx`, `EncoderOutputStep.jsx`, `DecoderTransitionStep.jsx`, `DecoderEmbeddingStep.jsx`, `DecoderPositionalStep.jsx`, `DecoderMaskedAttentionStep.jsx`, `DecoderCrossAttentionStep.jsx`, `DecoderFeedForwardStep.jsx`, and `DecoderAddNormStep.jsx`. The values produced are purely for visualization and have no relation to a real embedding table.

The matching duplicated function is `generatePositionVector(position)`: it computes `pos = position + 1` and returns the four-dimensional vector `[(pos*0.1)%1, (pos*0.2)%1, (pos*0.3)%1, (pos*0.4)%1]`, each `.toFixed(2)`. `addVectors(a, b)` does element-wise addition rounded to two decimals. `generateEncoderOutputVector(word, index, tokenCount)` builds the encoder input by adding the embedding and position vectors, then adds a `contextBoost` vector whose four components are `((index+1)*0.08)%1`, `((tokenCount-index)*0.05)%1`, `((word.length%5)*0.07)%1`, and `(((index+1)+word.length)*0.04)%1`; the final output is the encoder input plus the context boost.

A fixed special vector `START_VECTOR = [0.2, 0.7, 0.1, 0.4]` is used for the decoder's `<START>` token across all decoder files. Decoder token sequences are derived as `["<START>", ...userTokens]`. Most steps cap the number of tokens they show with `tokens.slice(0, N)` where N varies — 10 in most encoder steps and masked attention, 8 in the transition step, 6 in decoder positional and cross-attention, 4 in the decoder token step, 3 in the decoder feed-forward step.

Theming is string-based throughout. Every component derives `isDark = theme === "dark"` locally and applies conditional Tailwind classes. Dark mode uses `bg-slate-950` backgrounds, cyan accents (`text-cyan-300`, `border-cyan-500`); light mode uses `bg-slate-100`/white backgrounds and blue accents (`text-blue-800`, `border-blue-300`). Most step components animate their own opacity and scale based on the `active` prop: `opacity` 1 when active else 0.2, `scale` 1 when active else 0.95, over a 0.3-second transition.

---

## PART B — PAGE 0: TRANSFORMER INTRO / ONBOARDING (TransformerIntroStep.jsx)

This page teaches what a Transformer is at a high level and captures the user's name. It is a bordered card 980 pixels wide and at least 620 pixels tall. The heading reads "What is a Transformer?".

The body contains three bordered information panels. The first panel is titled "Overview" and its exact text is: "A Transformer is a type of neural network architecture designed to process sequences of data, with particular strength in language-related tasks. Unlike earlier models that read input word by word in a fixed order, a Transformer processes the entire sequence at once, allowing it to reason about relationships between all words simultaneously. At the core of the Transformer is a mechanism called attention, which allows the model to determine how relevant each word is to every other word in the sequence. This makes it especially effective at capturing context and long-range dependencies that earlier models struggled with. Each word is first converted into a numerical vector called an embedding, and positional information is added so the model still understands the order of the sequence. Together, these components allow the Transformer to capture both the meaning of words and how they relate to one another in context."

The second panel is titled "The Encoder" and explains that the encoder is built from several identical stacked layers, each containing a self-attention block and a small feed-forward network. It uses the example sentence "The animal didn't cross the street because it was tired." to explain that the word "it" learns through self-attention to lean toward "animal" rather than "street", and that stacking encoder layers progressively refines each word's vector.

The third panel is titled "The Decoder" and explains that the decoder takes the encoder's output and writes a new sequence such as a translation. It introduces masked self-attention as the extra trick that prevents the model from peeking at future words, and cross-attention as the block that lets the decoder look back at the encoder's output. It ends by noting that BERT uses only the encoder, GPT uses only the decoder, and T5 keeps both halves.

Below the panels is a bordered name-capture box. Its label reads "Enter your name to begin". The input is controlled by local state `nameInput` (initialized from the `userName` prop) and a `nameError` boolean. The button below reads "Start Pre-Quiz →". Clicking it, or pressing Enter in the input, runs `handleStart`: it trims the input; if empty it sets `nameError` true and the red message "Please enter your name before continuing." appears; otherwise it clears the error, calls `setUserName(trimmed)`, writes the name to `localStorage` under key `userName`, and calls `setStep(1)` to advance to the pre-quiz. The whole card uses a `motion.div` that animates opacity and scale based on `active`.

---

## PART C — PAGE 1: ENCODER PRE-QUIZ (PreQuizStep.jsx)

This page measures what the user already knows before any visualizations. It has three possible states: an already-completed screen, a name-entry gate, and the quiz itself.

### C.1 Already-completed state

If `preQuizCompleted` is true, the card shows a large "✓" mark, the heading "Pre-Quiz Already Completed", the text "Your score: {preQuizScore}%", the line "You have already submitted this quiz. Use the Next button to continue.", and a button "Start fresh as a new user" which calls `handleStartFresh` — that calls `resetSession()`, clears local answers, clears `submitted`, clears the name input, and un-confirms the name.

### C.2 Name-entry gate

If the name is not yet confirmed (`nameConfirmed` is false), the card shows the heading "Pre-Quiz: What Do You Already Know?", the subtitle "Please enter your name before starting the quiz.", a bordered name box labeled "Your Name", and a "Start Quiz" button. `handleNameConfirm` trims the input; if empty it shows the red error "Please enter your name to continue."; otherwise, importantly, if a previous different name existed it calls `resetSession()` and clears the answers and submitted state — so changing your name wipes prior progress. It then sets `userName`, writes it to `localStorage`, and confirms the name.

### C.3 The quiz

The quiz card is 1100 pixels wide and at least 760 pixels tall. The heading is "Pre-Quiz: What Do You Already Know?" with the subtitle "Test your intuition before diving into the visualizations." If a name is set and the quiz is not submitted, a line shows "Taking this as {userName}" with a "Change name (resets progress)" link. There is also the reassurance text: "Don't worry if you don't know the answers yet — this quiz is designed to activate your thinking before you explore each step in detail."

The quiz draws ten fixed questions from `src/data/preQuiz.js`. The questions are deliberately hard so an untrained user scores low. The ten questions, their four options, correct answers, and explanations are:

Question 1: "Inside scaled dot-product attention, how is the raw score between Query Q and Key K computed before softmax?" Options: "Q × K^T, then divided by √(d_k)"; "softmax(Q + K)"; "Element-wise subtraction Q − K"; "Dot product of Q and V". Correct: "Q × K^T, then divided by √(d_k)". Explanation: "Attention scores are the dot product of Q and K^T, scaled by √(d_k) to keep softmax gradients stable."

Question 2: "In the base Transformer's position-wise feed-forward network, how does the inner hidden dimension d_ff relate to the model dimension d_model?" Options: "d_ff is the same as d_model"; "d_ff is roughly 4 times d_model (e.g. 2048 vs 512)"; "d_ff is half of d_model"; "d_ff equals the number of attention heads". Correct: "d_ff is roughly 4 times d_model (e.g. 2048 vs 512)". Explanation: "The original Transformer uses d_model = 512 and an FFN inner size d_ff = 2048, a 4× expansion that gives the position-wise MLP enough capacity to transform each token."

Question 3: "What does the 'Add' in 'Add & Normalize' refer to inside an encoder layer?" Options: "Adding learned bias terms"; "A residual (skip) connection: input + sublayer output"; "Adding random Gaussian noise"; "Adding the embedding to itself again". Correct: "A residual (skip) connection: input + sublayer output". Explanation: "The 'Add' is a residual connection that adds the sublayer's input to its output, preserving information across depth."

Question 4: "Which positional encoding scheme is introduced in the original Transformer paper?" Options: "Learned absolute embeddings only"; "Sine and cosine functions at different frequencies"; "One-hot position vectors"; "Random Gaussian noise per position". Correct: "Sine and cosine functions at different frequencies". Explanation: "Vaswani et al. use fixed sinusoids of varying frequencies so the model can extrapolate to longer sequences."

Question 5: "How is the position-wise Feed-Forward Network applied inside the encoder?" Options: "Once per layer, mixing all token positions together"; "Independently at each token position with shared weights"; "Only to the first token of the sequence"; "Only at the residual connections". Correct: "Independently at each token position with shared weights". Explanation: "The FFN is applied to each position separately and identically — that's why it's called 'position-wise'."

Question 6: "What concrete advantage does multi-head attention give over a single attention head?" Options: "It runs faster on a CPU"; "Each head attends to a different learned subspace of the representation"; "Each head sees a different subset of tokens"; "All heads share weights to reduce parameters". Correct: "Each head attends to a different learned subspace of the representation". Explanation: "Multi-head attention projects Q/K/V into multiple subspaces so the model can jointly attend to different relations."

Question 7: "In an encoder–decoder Transformer, where is the encoder's final output consumed?" Options: "By another stack of encoder layers"; "By the decoder's cross-attention (encoder-decoder attention) sublayers"; "By the tokenizer for re-tokenization"; "By the loss function directly, with no further processing". Correct: "By the decoder's cross-attention (encoder-decoder attention) sublayers". Explanation: "Each decoder layer attends to the encoder's outputs through a cross-attention sublayer."

Question 8: "What happens to a Transformer encoder if positional encodings are removed entirely?" Options: "Nothing — attention already encodes order"; "It becomes permutation-invariant: word order stops mattering"; "It crashes because shapes no longer match"; "It produces the exact same outputs but slower". Correct: "It becomes permutation-invariant: word order stops mattering". Explanation: "Self-attention by itself is order-agnostic; without positional information, shuffling the input gives the same outputs."

Question 9: "After embedding and positional encoding, what is the shape of the input fed into the encoder stack?" Options: "A single d-dimensional vector summarizing the whole sentence"; "One d-dimensional vector per token in the sequence"; "A scalar per token"; "A 2-D image-like tensor per token". Correct: "One d-dimensional vector per token in the sequence". Explanation: "The encoder receives a sequence of vectors — one d-dimensional vector per token position."

Question 10: "Within a single encoder layer, what is the exact order of sub-operations?" Options: "FFN → Add & Norm → Self-Attention → Add & Norm"; "Self-Attention → Add & Norm → FFN → Add & Norm"; "Self-Attention → FFN → Add & Norm"; "Add & Norm → Self-Attention → Add & Norm → FFN". Correct: "Self-Attention → Add & Norm → FFN → Add & Norm". Explanation: "Each encoder layer is: multi-head self-attention, residual+LayerNorm, position-wise FFN, residual+LayerNorm."

Each question is a bordered card; the four options are buttons in a two-column grid. Selecting an option stores `answers[q.id] = option`. Before submission, the selected option is highlighted in cyan/blue. The "Submit Pre-Quiz" button runs `handleSubmit`: it sets `submitted` true, counts how many `answers[q.id]` equal `q.correctAnswer`, computes `percentage = Math.round((correct / 10) * 100)`, and calls `submitPreQuiz(percentage)`. After submission, correct options turn green, the user's wrong selections turn red, and the score panel appears showing "{correct} / {total}" and "{percentage}%". If the percentage is 70 or above the message is "Great foundation! Let's see how the visualizations deepen your understanding."; otherwise it is "No worries — the upcoming steps will teach you everything. Press Next to continue!" A "Review Answers" panel then lists every wrong question with the user's answer, the correct answer, and the explanation.

---

## PART D — PAGE 2: ARCHITECTURE VISUALIZATION (TransformerArchitectureStep.jsx)

This is the largest and most complex page, roughly 1265 lines. It combines the live T5-Small model, an SVG pipeline diagram, six generation-control sliders, an eleven-rule animation editor, and clickable stage-detail panels. The outer card is 1080 pixels wide.

### D.1 Model loading — getModel()

At the top of the file, `env.useBrowserCache = true` and `env.allowLocalModels = false` are set on the Transformers.js environment, so the model is cached in the browser after the first download and never loaded from a local path.

`getModel(onProgress)` is an exported async function implementing a lazy singleton with a waiter queue. Three module-level variables back it: `modelBundle` (initially null), `modelLoading` (initially false), and `waiters` (an array). The logic: if `modelBundle` already exists, return it immediately. If `modelLoading` is true (a load is already in progress), return a new Promise and push its `resolve` into `waiters`. Otherwise set `modelLoading` true, then `await AutoTokenizer.from_pretrained("Xenova/t5-small", ...)` with a `progress_callback` that, when `data.status === "progress"`, calls `onProgress(Math.round(data.progress))`; then `await AutoModelForSeq2SeqLM.from_pretrained("Xenova/t5-small", ...)` with the same progress callback. Once both are loaded it sets `modelBundle = { tokenizer, model }`, sets `modelLoading` false, calls every queued waiter with the bundle, clears the waiters array, and returns the bundle. This is the same `getModel` that `App.js` calls on mount, so the download begins at app start.

### D.2 The run() pipeline — live inference

`run` is a `useCallback`. Its full pipeline: it builds `text` as `` `${task} ${inputText}`.trim() ``. If the text is empty, or a load is in progress (`loadingRef.current`), or `modelStatus` is not `"ready"`, it returns early. It computes `visibleToks` by splitting `inputText` on whitespace and slicing to the first 10, and sets these as `inToks`. It clears `outToks` and `error`, sets `loadingRef.current` true, and sets `loading` and `flowing` true.

It then gets the tokenizer and model from `getModel()`, and tokenizes `text` into `inputs`. It builds `genOpts` with `attention_mask: inputs.attention_mask`, `max_new_tokens: maxTokens`, `return_dict_in_generate: true`, `output_scores: true`, and `repetition_penalty: repetitionPenalty`. Then the sampling-versus-beam decision: if `numBeams > 1`, it sets `genOpts.num_beams = numBeams` and `genOpts.do_sample = false` (deterministic beam search); otherwise it sets `genOpts.do_sample = true`, `genOpts.top_p = topP`, `genOpts.top_k = topK`, and `genOpts.temperature = Math.max(0.05, temperature)`.

It calls `await model.generate(inputs.input_ids, genOpts)`. Then it normalizes the output, because different Transformers.js versions return different shapes: if `output.sequences` exists it uses that as `seqTensor` and `output.scores` as `scores`; else if `output` has a `data` field and `dims` it treats `output` itself as the tensor; else if `output` is an array it uses that. It then pulls a flat id array: if `seqTensor` has `data` and `dims`, it takes `seqLen` as the last dimension and slices `seqTensor.data` to that length; if `seqTensor` is an array it uses its first row. If the id array is empty it throws "Empty generation".

It then skips T5's decoder start token (the pad token at index 0) and collects `generatedIds`, stopping at the EOS id (`tokenizer.eos_token_id ?? 1`). The cumulative-decode and subword-merging logic follows: it reads `vocabSize` from the first score tensor's dims or data length. For each generated id, it decodes the cumulative slice `generatedIds.slice(0, i+1)` with `skip_special_tokens: true`, and takes `piece` as the part of the new decode that is longer than the previous accumulated string — this incremental diff is the only reliable way to detect a word boundary because SentencePiece strips the leading-space marker when a single id is decoded in isolation. For per-token probability: if a score tensor exists for this step, it slices the logits to `vocabSize`, runs `softmax`, takes `prob = probs[tokenId]`, and computes `rank` by counting how many probabilities exceed it. If no scores are available it falls back to a synthesized monotonically decreasing confidence `Math.max(0.3, 0.95 - i * 0.06)`. If the decoded piece starts with whitespace (or it is the first piece) it begins a new merged word `{ tok, prob, rank, subwordCount: 1 }`; otherwise it appends the piece to the previous word, multiplies the previous word's probability by this subword's probability (joint probability of the word), and increments `subwordCount`. Finally it stores `merged.slice(0, 8)` as `outToks`. Any error sets `error`. The function ends by clearing `loadingRef.current` and `loading`.

`softmax(logits)` is a numerically stable implementation: it finds the max logit, exponentiates each `logits[i] - max` into a `Float64Array`, sums them, and divides each by the sum.

A debounce `useEffect` watches `inputText` and the generation parameters: when `inputText` is non-empty and the model is ready, it sets a 600-millisecond timeout that calls `run()`, and clears the timeout on cleanup. So editing the sentence or moving a slider re-runs inference automatically after 600 ms of inactivity.

### D.3 Task prefixes and examples

The `EXAMPLES` array has three preset translations. Index 0: label "English → French", prefix "translate English to French:", text "The house is wonderful". Index 1: label "English → German", prefix "translate English to German:", text "My friend likes coffee". Index 2: label "English → Romanian", prefix "translate English to Romanian:", text "The weather is nice today". `selectExample(idx)` sets `activeExample`, `task`, `inputText`, clears `outToks` and `error`. The three example labels appear as buttons after the word "Try:" at the top of the page. Below them is the input row showing the fixed task prefix in muted color followed by an editable text input for the sentence.

### D.4 The SVG architecture diagram

The SVG uses `viewBox="0 0 1020 440"` (constants `SVG_W = 1020`, `SVG_H = 440`, `CY = 220` is the vertical center line).

The ten stage nodes are defined in `STAGES` with key, x-coordinate, color key, and label: `tokens_enc` at x=115 ("Tokenization"), `embed` at x=185 ("Embedding"), `pos_enc` at x=255 ("Positional"), `selfAttn` at x=325 ("Self-Attention"), `encFFN` at x=420 ("Feed-Forward"), `maskedAttn` at x=515 ("Masked Self-Attn"), `crossAttn` at x=600 ("Cross-Attention"), `decFFN` at x=680 ("Feed-Forward"), `linSoftmax` at x=755 ("Lin+Softmax"), `outProj` at x=820 ("Output"). All ten sit on the center line at y=220. A dashed vertical divider line is drawn at x=475 separating the encoder half from the decoder half. SVG text labels read "ENCODER STACK" at x=267 and "DECODER STACK" at x=668 near the top, "encoder output" above the cross-attention arc, "ENCODER STACK" and "DECODER STACK" below the residual arcs, "INPUT / Your sentence" at the far left, and "OUTPUT / Model prediction / % = how sure the model is" at the far right.

The `PAL` object holds the color palette with `dark` and `light` variants. Dark: embed `#22d3ee`, selfAttn `#a78bfa`, maskedAttn `#fb7185`, ffn `#fbbf24`, crossAttn `#4ade80`, output `#f472b6`, dim `#334155`, text `#e2e8f0`, sub `#64748b`, pill `#0f172a`, res `#f97316`. Light: embed `#0891b2`, selfAttn `#7c3aed`, maskedAttn `#e11d48`, ffn `#d97706`, crossAttn `#16a34a`, output `#db2777`, dim `#cbd5e1`, text `#1e293b`, sub `#94a3b8`, pill `#f8fafc`, res `#ea580c`.

Flow lines are generated into a `flows` array. The `bez(x1, y1, x2, y2, b1, b2)` helper builds a cubic-bezier path string where the control-point horizontal offset is 38 percent of the horizontal distance. There are four groups of flows. First, input-to-tokenization: one flow per input token, from x=85 at the token's vertical position to the tokenization node, with a bend proportional to the token's index, colored with the embed color. Second, stage-to-stage: for each of the nine gaps between consecutive stages, three parallel lines are drawn at vertical offsets -12, 0, and +12 from the center, colored with the source stage's color; the middle line has opacity 0.3 and width 1.8, the outer two have opacity 0.15 and width 1.2. Third, structural arcs: a cross-attention arc from the encoder feed-forward node up and over to the cross-attention node (drawn above the main path, colored crossAttn, marked `isCrossArc`); an encoder residual arc from encFFN back to selfAttn (drawn below, colored with the `res` orange, marked `rev: true`); and a decoder residual arc from decFFN back to maskedAttn (also below, `rev: true`). Fourth, output-to-tokens: one flow per output token from the output projection node to x=853 at the token's vertical position, with opacity scaling with the token's probability and an `outProb` field carrying the probability.

The vertical spacing of token pills is computed by `spacing(n) = Math.min(34, 300 / Math.max(n, 1))` and `yPos(i, n)` centers them around `CY`.

Animated flow rendering: each visible flow is drawn twice — a static base path, and an animated path on top with a dashed stroke. The animation is a CSS keyframe: `@keyframes df` translates `stroke-dashoffset` to -32 (forward flow), `@keyframes dr` to +32 (reverse flow). The animation duration is `(loading ? 0.8 : 1.8) / rules.flowSpeed` for forward flows and `(loading ? 1.0 : 2.2) / rules.flowSpeed` for reverse flows, with a per-flow start delay scaled by `rules.stageDelay`. When `rules.autoPlay` is false the animation is set to `"none"`, freezing the diagram.

Each stage node is an interactive SVG group. It renders, when flowing and autoplay is on, a pulsing `motion.circle` whose radius animates between roughly 14–24 pixels (16–30 when loading) scaled by `rules.nodeSize`, with the pulse `duration` driven by `rules.pulseSpeed` and a per-stage delay. On top is an outline ring and a solid inner dot whose sizes grow on hover and when selected. Above each node is the stage label, and a small numbered badge (1–10) sits at the node's upper right. Hovering a node (and not having it selected) shows a tooltip rectangle below it with the short description from the `DESC` object and the italic prompt "click to open internals →". The `DESC` strings are: tokens_enc "Splits your sentence into tokens"; embed "Turns each word into a numeric vector"; pos_enc "Adds position info to each embedding"; selfAttn "Every word looks at the others"; encFFN "Refines each token on its own"; maskedAttn "Each decoder word looks only at the words before it"; crossAttn "Decoder looks back at the encoder"; decFFN "Polishes the decoder's vectors"; linSoftmax "Projects to vocab and normalises with softmax"; outProj "Picks the next word by probability". Clicking a node toggles `selectedStage`, which opens the `StageDetailView` panel below the SVG.

Input token pills are 78-by-22-pixel rounded rectangles on the far left, each showing the token text (truncated to 8 characters plus "…" if longer). Output token pills are 155-by-28-pixel rounded rectangles on the far right, each showing the merged word and a right-aligned percentage `Math.round(prob * 100)%`. The output pill styling is probability-driven: the rectangle's `strokeWidth` is `0.8 + prob * 1.6`, its `strokeOpacity` is `0.35 + prob * 0.65`, the word's `fontWeight` is "800" when `prob > 0.6` else "600", and the word and percentage text `opacity` is `0.45 + prob * 0.55`. Output pills enter with a Framer Motion fade-and-slide (`opacity 0, x -8` to `opacity 1, x 0`) staggered by `0.3 + i * 0.08` seconds.

While loading, the text "T5-Small generating…" pulses at the bottom of the SVG. If there is an error and not loading, the error message is shown in red.

### D.5 The model status bar

When `modelStatus === "loading"`, instead of the example buttons the page shows a row "Loading T5-Small…" with a progress bar whose width is `${modelProgress}%` and a percentage readout. When `modelStatus === "error"` it shows "Failed to load model, refresh to retry" in red. A `useEffect` on mount sets `modelStatus` to "loading", calls `getModel(setModelProgress)`, and on success sets it to "ready", on failure "error".

### D.6 Generation controls — the six sliders

`GenerationControls` renders a bordered panel headed "Generation Controls ·" followed by either "Beam Search mode" (cyan) or "Sampling mode" (purple) depending on whether `numBeams > 1`. Each slider is a `ControlSlider` with a label, a colored value readout, the range input, a dynamic italic hint line, and an info-tooltip ("?" bubble). The six sliders are:

"Beams" — range 1 to 6, step 1, default 1, accent cyan. Hint reads "greedy/sampling mode" at 1, otherwise `explores ${numBeams} paths in parallel`. Tooltip explains beams keep candidate translations alive in parallel and that values above 1 disable Temperature, Top-P, and Top-K.

"Temperature" — range 0.1 to 2.0, step 0.05, default 1.0, accent rose. Disabled when in beam mode. Hint: "low, almost deterministic" at ≤0.3, "balanced, slight variety" below 0.9, "standard, natural variety" below 1.4, otherwise "high, unpredictable"; shows "n/a in beam search" when beams > 1.

"Top-P" — range 0.1 to 1.0, step 0.05, default 0.9, accent purple. Disabled in beam mode. Hint: "narrow pool, safe words" below 0.4, "balanced pool" below 0.75, otherwise "wide pool, creative".

"Top-K" — range 1 to 100, step 1, default 50, accent amber. Disabled in beam mode. Hint: "only top few candidates" below 10, "moderate candidate pool" below 40, otherwise "large candidate pool".

"Max tokens" — range 4 to 32, step 1, default 12, accent emerald. Hint: "cap on output length".

"Repetition penalty" — range 1.0 to 2.0, step 0.05, default 1.0, accent slate, value formatted to two decimals. Hint: "no penalty (model may repeat)" below 1.05, "mild discourage" below 1.3, otherwise "strongly discourages repeats".

In beam mode the four sampling sliders (Temperature, Top-P, Top-K, and also their hints) are shown at 40 percent opacity and disabled.

### D.7 Animation rule editor — the eleven rules (AnimationRuleEditor.jsx)

The `AnimationRuleEditor` is a collapsible bordered panel headed "Animation Rules" with a subtitle showing either `· preset: {name}` or `· custom configuration`. It exports `DEFAULT_RULES` and `PRESETS`. The eleven rules in `DEFAULT_RULES`, with name, default, and effect, are:

`flowSpeed` — default 1.0, range 0.25 to 3, step 0.05. Controls flow-line animation speed; the formula shown under the slider is "duration = base ÷ speed".

`stageDelay` — default 0.2, range 0 to 0.5, step 0.01. Stagger seconds between stages; formula "delay[i] = stage_index × value".

`pulseSpeed` — default 2.5, range 0.5 to 6, step 0.1. Idle node-pulse period in seconds; formula "node_pulse.duration = value".

`autoPlay` — default true, a toggle. When off, all flow-line animation freezes; label "Auto-play (freezes animation when off)".

`lineThickness` — default 1.2, range 0.5 to 4, step 0.1. Base stroke width in pixels; formula "stroke-width ∝ value".

`lineOpacity` — default 0.45, range 0.1 to 1, step 0.05. Base stroke opacity; formula "stroke-opacity ∝ value".

`dashPattern` — default "6 10", a select with four options: Dense "3 6", Medium "6 10", Sparse "12 18", Long "18 10". Formula not shown; label "Dash pattern".

`nodeSize` — default 1.0, range 0.5 to 1.8, step 0.05. Node radius multiplier; formula "circle.r ∝ value".

`showResiduals` — default true, a toggle. Shows or hides the orange residual arcs; label "Show residual arcs (orange loops)".

`showCrossArc` — default true, a toggle. Shows or hides the encoder-to-decoder arc; label "Show encoder → decoder arc".

`probThreshold` — default 0.0, range 0 to 0.5, step 0.01. Hides output tokens whose probability is below the threshold; formula "IF prob < threshold → hide token"; label "Hide outputs below probability".

The rules are grouped into four sections in a two-column grid: "Timing" (cyan) holds flowSpeed, stageDelay, pulseSpeed, autoPlay; "Visual mapping" (purple) holds lineThickness, lineOpacity, nodeSize, dashPattern; "Structure" (amber) holds showResiduals, showCrossArc; "Conditional rules" (emerald) holds probThreshold.

The five presets are: **Default** — exactly `DEFAULT_RULES`. **Calm** — flowSpeed 0.55, pulseSpeed 4.0, lineOpacity 0.3, dashPattern "3 12", stageDelay 0.35, everything else default. **Energetic** — flowSpeed 2.2, stageDelay 0.05, pulseSpeed 1.2, lineThickness 1.8, lineOpacity 0.7, dashPattern "8 6". **Minimal** — showResiduals false, showCrossArc false, lineOpacity 0.25, nodeSize 0.85, dashPattern "3 6". **Bold** — lineThickness 2.5, lineOpacity 0.85, nodeSize 1.25, dashPattern "8 4", pulseSpeed 1.8. The active preset is auto-detected: `activePresetName` is found by checking which preset has every key exactly equal to the current rules; if none match, the panel shows "custom configuration". A "Reset" button restores `DEFAULT_RULES`.

How the rules are applied in `TransformerArchitectureStep`: `visibleOutToks` filters output tokens whose probability is below `rules.probThreshold`. `visibleFlows` filters out reverse residual flows when `showResiduals` is false, the cross arc when `showCrossArc` is false, and output flows below the probability threshold. Several scale factors are derived: `opacityScale = rules.lineOpacity / DEFAULT_RULES.lineOpacity`, `thicknessScale = rules.lineThickness / DEFAULT_RULES.lineThickness`, `delayScale = rules.stageDelay / DEFAULT_RULES.stageDelay`. Each flow's base stroke width is `(f.w || lineThickness) * thicknessScale` and base opacity `(f.op || 0.2) * opacityScale`. The dash pattern used is "4 8" for reverse flows and `rules.dashPattern` for forward flows. Node pulse radius and node circle radius are all multiplied by `rules.nodeSize`.

### D.8 Stage detail panels (StageDetailView.jsx)

Clicking any of the ten stage nodes opens a `StageDetailView` panel below the SVG, animated with `AnimatePresence` expanding from height 0 to auto over 0.3 seconds. The panel has a header with the stage's title and a "×" close button, then a stage-specific SVG diagram, then three educational boxes ("The Intuition", "Step-by-step math", and "Key insights"), and for the output-related stages an extra live worked-example box.

The SVG diagrams are built from small helper components: `Box` draws a labeled rounded rectangle with optional sub-label; `Arrow` draws a straight or curved arrow with an arrowhead marker and optional italic label; `VectorViz` draws a row of small bars of fixed heights `[14, 22, 9, 18, 12, 20, 7, 16]` representing a vector; `MatrixViz` draws a grid of cells whose opacity encodes a fixed 4×4 value matrix; `SvgDefs` defines the arrowhead marker.

There are six distinct detail diagrams. `TokenizeDetail` shows the example sentence "The house is wonderful" splitting into four token boxes, then mapping to IDs "37", "629", "19", "1627", then "numbers → Embed step". `PositionalDetail` shows a "token embedding" box and a "position vector" box each turning into a `VectorViz`, then a large "+" combining them into "meaning + position" and "→ ready for attention". `EmbedDetail` shows the word "house" → "ID 629" → an "Embedding table" box labeled "32,128 words × 512 numbers" → "this word's vector (512 numbers)" with the caption "words with similar meaning get similar vectors". `SelfAttnDetail` is reused for self-attention, masked self-attention (`isMasked`), and cross-attention (`isCross`); it draws input boxes, the three projection boxes "× W_Q / × W_K / × W_V", the Q/K/V boxes ("what I seek / what I show / my content"), a "Q · Kᵀ" box, a "÷ √64" box, optionally an "apply mask" box for the masked variant, a "softmax" box, a `MatrixViz` of attention weights, a "× V" box, a "Concat heads" box ("join 8 views"), and a "× W_O" box ("mix the heads"), ending in "→ refined vectors". For the cross variant the inputs are "Decoder so far" (for Q) and "Encoder output" (for K and V). `FFNDetail` shows "Input (512-dim)" → "Linear 1 (512 → 2048)" → "ReLU max(0, x)" → "Linear 2 (2048 → 512)" → "Output (512-dim)". `OutputDetail` shows "Decoder output (512-dim)" → "Linear projection (512 → 32,128 vocab)" → "softmax" → a set of top-K probability bars; when live output exists, the bars use the real tokens and probabilities, otherwise a French fallback set ("Bienvenue 20%", "à 18%", "votre 16%", "voiture 15%", "tout 13%").

The `EXPLANATIONS` object holds the educational text for eight stages: `tokens_enc`, `pos_enc`, `maskedAttn`, `linSoftmax`, `embed`, `selfAttn`, `encFFN`, `decFFN`, `crossAttn`, and `outProj`. Each entry has a `title`, an `intuition` paragraph, a `math` array of step objects (each with `step`, `formula`, and `detail`), and an `insights` array of bullet strings. The titles all follow the pattern "{Stage} · Inside the Block". Representative formulas include, for self-attention: "Q = X · W_Q   K = X · W_K   V = X · W_V", "scores = Q · Kᵀ", "scaled = scores / √64 = scores / 8", "weights = softmax(scaled)", "output = weights · V", "concat(head₁, …, head₈) · W_O". For masked self-attention the extra step is "scores[i][j] = −∞   for every future position j > i". For positional encoding: "P[pos] = [sin(pos/10000^0), cos(pos/10000^0), …]" and "final = Embedding[token] + P[pos]". For the feed-forward networks: "h = x · W₁ + b₁ (512 × 2048)", "h' = max(0, h)", "out = h' · W₂ + b₂ (2048 × 512)". For output projection and linear+softmax: "logits = y · W_out + b (W_out is 512 × 32,128)" and "P(w) = exp(logits_w) / Σ exp(logits_i)". For cross-attention: "Q = X_decoder · W_Q", "K = X_encoder · W_K   V = X_encoder · W_V", "attn = softmax(Q · Kᵀ / √64) · V". For embedding the steps describe it as a pure table lookup from an ID into a 32,128 × 512 grid.

For the `outProj` and `linSoftmax` stages, when live model output exists, an amber "Worked example — live from T5-small" box appears. It takes the top-5 live tokens, computes their logits as `Math.log(Math.max(prob, 1e-10))`, then does a renormalized softmax over just those five (subtract max logit, exponentiate, normalize), and displays a line per token showing `log(p)`, `exp`, and the renormalized percentage. It also shows a worked-out line `softmax("{topToken}") = exp(...) / Σ exp(z_j) = ... / ... = {percent}`, with the note that this is a renormalization over the top 5, not the full 32,128-token vocabulary, and the italic line "These probabilities come from the actual T5-small model running in your browser."

### D.9 Page footer

Below the stage detail panel is a footer row with the text "Running T5-Small right here in your browser. The output percentages come from real softmax probabilities, so try dragging a slider and watch the output shift." and a button "Explore Encoder Details →" that calls `setStep(3)`.

### D.10 State variables

The page's state variables are: `activeExample` (0–2), `task` (the prefix string), `inputText` (the editable sentence), `numBeams`, `topP`, `topK`, `temperature`, `maxTokens`, `repetitionPenalty` (the six generation parameters), `inToks` (input token strings), `outToks` (array of `{tok, prob, rank, subwordCount}`), `loading` and `flowing` (animation flags), `hov` (hovered stage key), `selectedStage` (open detail panel key), `rules` (the eleven-rule object), `error` (error message), `modelStatus` ("idle"/"loading"/"ready"/"error"), `modelProgress` (0–100), and a `loadingRef` ref guarding against concurrent runs.

---

## PART E — PAGE 3: TOKENIZATION STEP (TokenStep.jsx)

This page teaches that tokenization splits a sentence into individual words. The card is 680 by 430 pixels. The heading is "Tokenization" with the subtitle "Splits the sentence into individual words". A bordered "Why we use this step" box reads: "We use tokenization to break the sentence into smaller units that the Transformer can process one by one instead of treating the whole sentence as raw text."

`safeTokens` is `tokens.slice(0, 10)` or `["hello"]` if empty. The token positions are computed: each token's x-coordinate is `(index - center) * spacing` where `center = (count - 1) / 2` and `spacing` is 100 by default, 82 for 6 or more tokens, 66 for 8 or more, 56 for 10 or more; the y-coordinate is fixed at 58.

The animation is an infinite loop driven by two Framer Motion `useAnimation` controllers, `sentenceControls` and `tokenControls`, inside a `useEffect`. Helper `sleep(ms)` is a promise-based delay. The loop, while not cancelled: first the full sentence (the tokens joined by spaces) "breathes in" — it sets to opacity 0, y 8, scale 0.96, then animates to opacity 1, y 0, scale 1 over 0.55 seconds. After a 2700-millisecond pause the sentence "drops away" — animating to opacity 0, y -6, scale 0.97 over 0.32 seconds. Then the individual token pills spring outward: each token is set to opacity 1 and then animated to its computed x/y position with a spring (stiffness 170, damping 18) staggered by `index * 0.05` seconds, with a tiny scale pop `[1, 1.18, 1]` on landing. After a 2900-millisecond pause the tokens "combine" — sliding back to x 0, y 0 with a slight squash `scale [1, 0.94, 1]` over 0.55 seconds staggered by `index * 0.025`, then fading to opacity 0. Then the loop restarts. When `active` is false the controllers are simply set to opacity 0.

Visually there are stacked "Before:" and "After:" labels on the left side. The sentence box is a bordered rounded rectangle; the token pills are bordered rounded rectangles with a glow shadow.

---

## PART F — PAGE 4: EMBEDDING STEP (EmbeddingStep.jsx)

This page teaches that embedding converts each word into a vector of numbers. The card is 760 pixels wide. The heading is "Embedding" with subtitle "converts each word into a vector". The "Why we use this step" box reads: "We use embeddings because the model cannot understand words directly. Each token must first be converted into numbers so the Transformer can compare, transform, and learn relationships between words."

The vector function here is named `generateVector(word)` and is the duplicated four-dimensional letter-code embedding function described in section A.9.

There is a toggle button that switches between "Show Embedding Explanation" and "Hide Embedding Explanation", controlled by `showExplanation`. When shown, a detailed math breakdown appears for a sample word (`tokens[0]` or "hello"). The breakdown includes a box "Why convert words to vectors?" with the text "Computers cannot understand words directly, so we turn each word into numbers. These numbers allow the model to compare words, measure similarity, and perform calculations." Then a heading "How is the vector made here?" followed by a "Sample word" box, a "What we read from the word" box listing the letters, each letter's character code as a "letter → code" pair, the word length, first letter code, last letter code, vowel count, and the total of all letter codes shown as a sum. Then a "How each output is calculated" box with four sub-boxes: the 1st value is "total codes % 100" shown as `{sumCodes} % 100 = {calc1Raw} → {value}`; the 2nd is "(first code × length) % 100"; the 3rd is "(last code + vowels × 7) % 100"; the 4th is "((total + first + last + length) × 3) % 100" — each showing the full numeric substitution. Finally a "Final demo vector" box shows the four resulting values and the line "Same word → same inputs → same vector."

Below the explanation, every token in `tokens` is rendered as a row: the word on the left, an animated "→" arrow that pulses (x oscillates 0→8→0, opacity 0.6→1→0.6, scale 1→1.15→1, over 1.4 seconds repeating, staggered by `index * 0.15`), and then the four vector values in a bordered box labeled "letter-based demo vector". The vector values spring in individually (initial opacity 0, y 14, scale 0.6) with a spring of stiffness 340, damping 22, staggered by `index * 0.12 + i * 0.07`.

---

## PART G — PAGE 5: POSITIONAL ENCODING STEP (PositionalStep.jsx)

This page teaches that positional encoding adds position information so word order is preserved. The card is 900 pixels wide. The heading is "Positional Encoding" with subtitle "adds position information to each vector to keep the correct order". The "Why we use this step" box reads: "We use positional encoding because the Transformer processes tokens in parallel, so it needs extra position information to know the order of words inside the sentence."

It uses both `generateEmbeddingVector(word)` (the letter-code function) and `generatePositionVector(position)` — the latter computes `pos = position + 1` and returns `[(pos*0.10)%1, (pos*0.20)%1, (pos*0.30)%1, (pos*0.40)%1]` rounded to two decimals.

A legend in the top-right names three colors: a cyan/blue square for "Word embedding vector", a purple/violet square for "Positional vector", a green square for "Output vector".

There is a red-bordered toggle button that switches between "Show Without Positional Encoding" and "Show With Positional Encoding", controlled by `usePosition`. When the user turns positional encoding off, `shuffleArray(tokens)` is called — it copies the array and sorts it with `() => Math.random() - 0.5`, producing a randomly shuffled order — and `shuffledTokens` is shown instead. The point demonstrated is that without positional information the model has no way to tell the shuffled order from the correct one.

When positional encoding is on, the explanatory line reads "The purple positional vector is a fixed demo vector based on the word position: Word 1 gets one position vector, Word 2 gets another, and so on." Each token is rendered in a row: "(Word {n})" label, the word, the four-value embedding box, a pulsing "+", the four-value position vector box labeled "Position vector (Word {n})", a pulsing "→", and the four-value output box where each output value is `(parseFloat(emb[i]) + parseFloat(pos[i])).toFixed(2)` — the element-wise sum of embedding and position. Rows use Framer Motion `layout` animation so they smoothly rearrange when shuffled, with a spring of stiffness 320, damping 32.

---

## PART H — PAGE 6: ENCODER STACK STEP (EncoderStackStep.jsx)

This page teaches that the encoder stack is built from repeated encoder layers, and it hosts two sub-views. The overview card is 980 pixels wide and at least 760 pixels tall. The heading is "Encoder Stack" with subtitle "The encoder stack is built from repeated encoder layers". The "Why we use this step" box reads: "We use the encoder stack because one layer is usually not enough to build deep understanding. Repeating encoder layers allows the model to refine context step by step and produce richer sentence representations."

A `view` state controls four modes: `"overview"`, `"attention"`, `"feedforward"`, and `"addnorm"`. A `layerCount` state runs from 1 to 6. While in overview a `useEffect` sets an interval every 2200 milliseconds that cycles `layerCount` 1→2→3→4→5→6→1.

The overview shows a box "What happens inside one encoder layer?" containing a numbered "Encoder layer order" list with four rows: 1. Self-Attention, 2. Add & Norm, 3. Feed Forward, 4. Add & Norm. Then an "Important note" box: "This encoder layer repeats multiple times to form the full encoder stack. Each repetition refines the representations further." Then three navigation buttons: "Learn Self-Attention →" (sets view to attention), "Learn Add & Normalize →" (sets view to addnorm), "Learn Feed Forward →" (sets view to feedforward).

Below is an "Understanding Depth" progress bar showing "{layerCount} / 6 encoder layers active", a gradient bar from red through orange/yellow/lime to green whose width is `(layerCount / 6) * 100%`, and a caption that changes with layer count ("1 layer — basic word-to-word context begins", "{n} layers — short-range relationships forming" for 2, "{n} layers — grammar and phrase patterns emerging" for 3–4, "{n} layers — rich, sentence-level understanding reached" for 5+).

Then six stacked encoder layers are rendered. Each has a color from the `layerStyles` array: layer 1 red, 2 orange, 3 amber, 4 lime, 5 emerald, 6 green, each with a matching glow shadow and a `note` string ("Layer 1: starts building basic context between words", "Layer 2: connects nearby words and short phrases", "Layer 3: refines word relationships and grammar patterns", "Layer 4: captures sentence-level meaning", "Layer 5: builds strong contextual understanding", "Layer 6: produces the final, richest representation"). Layers with `index < layerCount` are fully active (opacity 1); others are dimmed to 0.22. Each layer card springs in (initial y -22, scale 0.94, blur 4) staggered by `index * 0.12`, shows the token words, and a horizontal mini-flow "Self-Attention → Add & Normalize → Feed Forward → Add & Normalize". Down-arrows between layers light up cyan/blue when active. A closing summary box changes text by layer count.

The `addnorm` sub-view (rendered inside `EncoderStackStep` itself) is a card headed "Add & Normalize" with subtitle "The stabilizer that runs after every sub-layer in an encoder layer". It shows a mini flow diagram: "x (token vector) → Sub-Layer (attention / FFN) → + (add x back) → LayerNorm (rescale values) → out (refined vector)" with the formula "out = LayerNorm( x + SubLayer(x) )" below it. Two info cards explain "Add (residual)" — "Re-injects the original input x so useful signal is never lost as the layer transforms it." — and "Normalize" — "Rescales each vector to zero mean & unit variance — keeps training stable across deep stacks." Three short paragraphs explain it runs twice per encoder layer. It embeds a YouTube video at `https://www.youtube.com/embed/G45TuC6zRf4` titled "Layer Normalization in Transformer", with the caption "Short video explaining residual connections and layer normalization."

### H.1 Attention sub-view (AttentionStep.jsx)

This sub-view is an interactive self-attention graph. The outer box is 980 pixels wide (`BOX_W`). Layout constants: `GRAPH_W = 620`, `GRAPH_H = 250`, `GRAPH_X = 20`, `GRAPH_Y = 60`, `GRAPH_AREA_H = GRAPH_Y + GRAPH_H + 80`, `NODE_R = 28`, `SCISSOR_SIZE = 34`, `CUT_DISTANCE = 12`, `DOUBLE_TAP_MS = 320`.

The heading is "Self-Attention" with subtitle "Each word compares itself with other words to decide what to focus on." The "Why we use this step" box reads: "We use self-attention so each word can look at other words in the sentence and understand context. This helps the model know which words are important for interpreting meaning."

`getNodePositions(count)` arranges the tokens in a circle: the center is the middle of the graph area, the radius is fixed at 120, and node `i` is placed at angle `-π/2 + (i * 2π / count)` — so the first token sits at the top and the rest go clockwise.

The Q, K, V computation: each token's input vector is `addVectors(generateEmbeddingVector(word), generatePositionVector(index))`. Then `projectVector(input, weights, shift)` computes, element-wise, `(value * weight + shift) % 1` rounded to two decimals. The fixed weight vectors are `WQ = [0.9, 0.3, 0.6, 0.2]`, `WK = [0.2, 0.8, 0.4, 0.7]`, `WV = [0.7, 0.4, 0.9, 0.3]`, and the fixed shift vectors are `Q_SHIFT = [0.03, 0.05, 0.02, 0.04]`, `K_SHIFT = [0.04, 0.02, 0.05, 0.03]`, `V_SHIFT = [0.02, 0.04, 0.03, 0.05]`. So Query = projectVector(input, WQ, Q_SHIFT), Key = projectVector(input, WK, K_SHIFT), Value = projectVector(input, WV, V_SHIFT).

`baseEdges` is every unordered pair of token indices. `edgeState` is an object mapping each edge key (`a-b` with the smaller index first) to a boolean, all initially true. The attention score matrix: each cell `[row][col]` computes `rawScore = dotProduct(query[row], key[col])`, then `normalizeScore(score) = Math.min(0.99, Math.max(0, score / 2.5))`. A cell is `active` if it is on the diagonal, or if its edge is still connected in `edgeState`.

The scissor tool is a draggable circular "✂" button. On pointer-down it sets `dragging` true and updates the scissor position; while dragging, a window `pointermove` listener moves it. `updateScissorFromPointer` converts the client coordinates into local coordinates, clamps the scissor within the graph area, and computes the scissor "tip" at offset (`SCISSOR_SIZE * 0.82`, `SCISSOR_SIZE * 0.52`). `cutIntersectingLines(tipX, tipY)` checks every still-connected edge with `pointToSegmentDistance` — the standard point-to-line-segment distance formula that projects the point onto the segment, clamps the projection parameter `t` to [0,1], and returns the Euclidean distance — and if the distance is at most `CUT_DISTANCE` (12 pixels) it sets that edge's state to false. So dragging the scissor across a line cuts it.

Reconnection works by double-tap: `handleNodeTap` records the tapped node and the tap time; if the same node is tapped again within `DOUBLE_TAP_MS` (320 ms) it counts as a double-tap. The first double-tapped node becomes `selectedNode`; the second double-tapped node forms an edge key with the selected node and sets that edge's state back to true, reconnecting it. Double-tapping the same selected node again deselects it.

Each node is rendered as a circular button. Its border color encodes connection health via `getConnectionStateColor(ratio)` where `ratio` is the fraction of that node's possible edges still active: green (`#22c55e`) at 70 percent or above, amber (`#f59e0b`) at 50–69 percent, red (`#ef4444`) below 50 percent. The connected lines are animated cyan dashed `motion.line` elements with a flowing dash offset and a traveling glowing dot; cut lines are static red dashed lines at 0.4 opacity.

The "Attention details" panel shows, for the currently focused token: the "Input from Positional Encoding" with the equation "Input vector = Embedding + Position" and the embedding, position, and input vectors laid out as "emb + pos → input"; then "Q, K, V from the input vector" explaining "Q (Query) = what this word is looking for", "K (Key) = what this word offers to other words", "V (Value) = the information passed forward", with the focused input vector and the three colored Q/K/V vectors; then the "Attention score matrix" — a full table comparing every row token's Query against every column token's Key, where cyan cells are allowed connections and red cells are cut links; then a numbered explanation "How the graph, Q/K/V, and matrix relate" with four points, the fourth being that disconnecting a graph edge does not change Q, K, or V, it only blocks that attention connection in the demo matrix.

Below the graph there are further panels. "What this graph means" explains each circle is a word and each link shows the words can exchange attention information. "Live attention effect" shows three stat chips — "Active links: {n} / {total}", "Connectivity: {percent}%", "Focused word links: {n}" — and a status message that is green when all links are connected, amber when partially disconnected, red when all links are cut. The "Token Perspective Mode" panel has three cards: "I am this word" (the focused word), "I can still use" (the words still connected to it), "I lost access to" (the disconnected words), plus a status chip reading "Strong output context", "Partial output context", or "Weak output context" depending on how many connections the focused word still has. Finally the "Attention Mistake Simulator" shows one to several educational messages such as "All important context links are available, so the focused word can build a richer encoder representation.", "Some useful context is missing, so the focused word is now built from only part of the sentence.", "The focused word is isolated from the rest of the sentence, so its output becomes much less contextual.", and "Because multiple links were removed, the model may miss important relationships between words."

### H.2 Feed-Forward sub-view (FeedForwardStep.jsx)

This sub-view teaches the feed-forward layer plus ReLU. The card is 980 pixels wide. The heading is "Feed Forward (ReLU)" with subtitle "The feed forward layer transforms each word vector, then ReLU turns negative values into 0". The "Why we use this step" box reads: "We use the feed forward layer to further refine each word representation after attention. It helps the model transform the attended information into a stronger and more useful internal representation."

The computation: each token's `encoderLikeInput` is the embedding plus the position vector. Then a fixed demo "bias" vector `FEED_FORWARD_SHIFT = [0.65, 0.95, 0.55, 1.1]` is subtracted element-wise to produce `transformed`. Then `reluOutput` applies `Math.max(0, v)` to each value. The page explicitly explains this subtraction is a stable teaching stand-in for what learned weights and biases do in a real network.

There is a six-box step-through carousel controlled by `boxIndex` (0–5) with Prev/Next buttons and progress dots. The six box titles are: "Where do the negative values come from?", "Why do we subtract a number here?", "What is ReLU?", "Why do we use ReLU?", "Mini video", "Worked example". Box 0 explains the negatives are not random, the input comes from "embedding + positional encoding", and the demo simulates the feed-forward layer with "new value = input value − fixed shift", showing the four shift values. Box 1 explains the subtraction is for visual clarity and stability. Box 2 defines ReLU: "ReLU means Rectified Linear Unit" with the formula "ReLU(x) = max(0, x)" and the rule "positive value → stays the same / negative value → becomes 0". Box 3 explains ReLU removes negatives, adds non-linearity, and that red values are negative before ReLU while blue values are zeros after ReLU. Box 4 embeds a YouTube video at `https://www.youtube.com/embed/6MmGNZsA5nI` titled "ReLU activation function video". Box 5 is a worked example for the first token showing its input vector, the vector after the feed-forward shift (negatives in red), and the vector after ReLU.

Below the carousel are two toggle buttons "Show Feed Forward Input" and "Show ReLU Output" controlled by `showOutput`. Then every token is rendered as a row showing the input vector ("Input = Embedding + Position") and, depending on the toggle, either the transformed vector (negatives in red) or the ReLU output (zeroed values in blue, positives in green). Negative values pulse with a scale animation. A rotating arrow ("→" or "←") and a caption ("Before ReLU: feed forward transformation can create negative values" or "After ReLU: every negative value becomes 0") accompany each row.

---

## PART I — PAGE 7: ENCODER OUTPUT STEP (EncoderOutputStep.jsx)

This page teaches that the encoder output is the final context-aware representation of the input. The card is 980 pixels wide. The heading is "Encoder Output" with subtitle "Final contextual word representations produced by the encoder stack". The "Why we use this step" box reads: "We use the encoder output because it represents the final contextual understanding of the input sentence. These vectors are the encoder's final result and will later be passed to the decoder."

Each token row is built by `generateEncoderOutputVector(word, index, tokenCount)`: it computes the `encoderInput` as embedding plus position, then a `contextBoost` vector (the four components are `((index+1)*0.08)%1`, `((tokenCount-index)*0.05)%1`, `((word.length%5)*0.07)%1`, `(((index+1)+word.length)*0.04)%1`), and the final `output` is the encoder input plus the context boost.

Two explanatory boxes appear: "What does encoder output mean?" explains that each word started with only its embedding and position, and after the encoder stack each representation is more context-aware through "context refinement"; "Final encoder result" explains the encoder outputs one final vector per input word.

Each token row shows three labeled vector rows: "Encoder input:" (the embedding-plus-position values in cyan/blue), "Context refinement:" (the context boost values shown with "+" prefixes in purple/violet), and "Final output:" (the final values in green). The final-output values spring in individually and then continuously pulse with a vertical bob and a glowing box-shadow animation.

---

## PART J — PAGE 8: ENCODER POST-QUIZ (EncoderPostQuizStep.jsx)

This page tests understanding after the encoder steps and shows a learning-growth analysis. It uses the ten fixed questions from `src/data/encoderQuiz.js`.

### J.1 The ten encoder quiz questions

Each question carries a `stepIndex` (0–4) and `stepLabel` used for "go to step" navigation; `STEP_INDEX_TO_PAGE` maps stepIndex 0→page 3, 1→4, 2→5, 3→6, 4→7. The ten questions are:

1: "What does tokenization do?" — correct "Splits a sentence into individual tokens" — stepLabel "Tokenization". Explanation: "Tokenization breaks the input sentence into smaller units (tokens) so the model can process them one by one."

2: "What is the purpose of embedding?" — correct "To convert each token into a vector of numbers" — stepLabel "Embedding". Explanation: "Embedding maps each token to a numeric vector that the neural network can actually process."

3: "Why do we add positional encoding?" — correct "To give each token information about its position in the sentence" — stepLabel "Positional Encoding". Explanation: "Self-attention is order-agnostic, so positional encoding is added to tell the model where each token sits in the sequence."

4: "In the positional encoding step, what two vectors are added together?" — correct "The token embedding and the position vector" — stepLabel "Positional Encoding". Explanation: "The position vector is added element-wise to the token embedding to produce the input fed into the encoder stack."

5: "What is the main purpose of self-attention?" — correct "To let each token use information from other tokens in the sentence" — stepLabel "Encoder Stack". Explanation: "Self-attention lets every token look at the others to build a context-aware representation of itself."

6: "What is the encoder stack made of?" — correct "Repeated encoder layers stacked on top of each other" — stepLabel "Encoder Stack". Explanation: "The encoder is built by repeating the same encoder layer multiple times to progressively refine token representations."

7: "What does the feed-forward layer do inside an encoder layer?" — correct "Further transforms each token's representation independently" — stepLabel "Encoder Stack". Explanation: "After attention mixes context across tokens, the feed-forward layer refines each token's vector on its own."

8: "What does 'Add & Normalize' help with inside the encoder?" — correct "Stabilizing training and preserving information from earlier layers" — stepLabel "Encoder Stack". Explanation: "The residual addition keeps earlier signal intact, and layer normalization keeps activations well-scaled across depth."

9: "What does the encoder output represent?" — correct "Final context-aware vectors, one per input token" — stepLabel "Encoder Output". Explanation: "Each input token receives a refined vector that carries information about itself plus the surrounding context."

10: "Which of these is the correct order of the encoder pipeline?" — correct "Tokenization → Embedding → Positional Encoding → Encoder Stack → Encoder Output" — stepLabel "Encoder Output". Explanation: "This is the top-level encoder flow you walked through across the visualization steps."

### J.2 Quiz behavior and learning analysis

The quiz card is 1100 pixels wide. Answers are persisted in `localStorage` under the key `encoderPostQuizAnswers` (read with a lazy initializer and written on submit). Submitting computes the percentage `Math.round((correct / 10) * 100)` and calls `submitEncoderPostQuiz(percentage)`, which (per App.js) also mirrors the score into the general post-quiz score.

If `encoderPostCompleted` is true the page shows a "Encoder Learning Analysis" screen. It computes `pre = preQuizScore`, `post = encoderPostScore`, `growth = post - pre`, and `growthPct = pre > 0 ? Math.round(((post - pre) / pre) * 100) : post`. Badge assignment depends on growth: if growth is 30 or more the badge is "Encoder Master", message "Outstanding growth! You've made a huge leap in understanding.", emoji 🚀; if growth is 10 to 29 the badge is "Rising Star", message "Great progress! The visualizations clearly helped you.", emoji 📈; if growth is positive but under 10 the badge is "Steady Learner", message "Nice improvement! Every bit of learning counts.", emoji ✨; if growth is exactly 0 the badge is "Consistent Performer", message "You maintained your knowledge — consistency is key.", emoji 💡; if growth is negative the badge is "Reviewer in Training", message "Learning isn't always linear. Revisit the steps to reinforce concepts.", emoji 🔄. The accent color is green for improvement, slate for no change, amber for a dip.

The analysis screen has decorative blurred background blobs that gently pulse. The badge spins in (rotate -180 to 0). Two `RingChart` components render side by side — "Before Learning / Pre-Quiz" and "After Learning / Post-Quiz". Each ring is an SVG circle of radius 52, circumference `C = 2πR`; the colored progress arc animates its `strokeDashoffset` from `C` to `C - (C * value) / 100` over 1.6 seconds, so the arc fills proportionally to the score. Inside the ring a `CountUp` component animates a number from 0 to the score value using a Framer Motion `useMotionValue` and `useTransform` rounding, over 1.6 seconds. Between the two rings is a large arrow (↑ for improvement, → for same, ↓ for a dip) that floats up and down, the growth value "{+}{growth} pts", and the label "Growth". Below is an "Insight" box whose text is, for improvement, "That's a {growthPct}% relative improvement — the encoder visualizations are working for you.", for same "You held steady from start to finish — your prior knowledge is solid.", for a dip "{abs(growthPct)}% relative dip — try revisiting the attention and encoder steps." A line "Your results have been saved" appears with a green dot.

If the post score is not perfect, a "Review Mistakes ({n})" button at the bottom-left toggles a mistake-review panel. Each wrong question is shown with a numbered badge, the question, the user's answer in a red box, the correct answer in a green box, the explanation, and a "Revisit {stepLabel} →" button that calls `setStep(STEP_INDEX_TO_PAGE[q.stepIndex])` to jump back to the relevant visualization page.

Before completion the page shows the standard quiz form with the heading "Encoder Post-Quiz: Test Your Understanding" and subtitle "Now that you've explored the encoder steps, let's see how much you've learned!", and after a normal submit (before the analysis screen logic) it shows a "Your Grade" panel and a "Review Wrong Answers" section with "Go to {stepLabel} Again" buttons.

The file `EncoderQuizStep.jsx` contains an almost identical screen (same ten questions, same "Your Learning Analysis" growth screen with badge "Transformer Master" at the top tier, answers persisted under `postQuizAnswers`, `STEP_INDEX_TO_PAGE` mapping 0→3 … 4→7), but as noted it is not wired into `PAGE_CONFIG`.

---

## PART K — PAGE 9: DECODER PRE-QUIZ (DecoderPreQuizStep.jsx)

This page measures decoder knowledge before the decoder steps. It uses the ten fixed questions from `src/data/decoderPreQuiz.js`. There is no name gate here — it goes straight to the quiz. The card is 1100 pixels wide; the heading is "Decoder Pre-Quiz: What Do You Already Know?" with subtitle "Test your intuition about the decoder before exploring it." and the reassurance line "Don't worry if you don't know the answers yet — this quiz is designed to activate your thinking before you explore the decoder steps in detail."

The ten questions are:

dpre-1: "Why does the decoder mask future positions during self-attention?" — correct "To prevent the model from cheating by looking at tokens it hasn't generated yet". Explanation: "During autoregressive generation the decoder produces one token at a time. Masking future positions ensures each token can only attend to previously generated tokens, preserving the left-to-right generation order."

dpre-2: "In cross-attention, where do the Query, Key, and Value vectors come from?" — correct "Query from the decoder; Key and Value from the encoder". Explanation: "Cross-attention lets the decoder query the encoder's output. The decoder provides Q (what it's looking for), while the encoder provides K and V (what information is available)."

dpre-3: "What is the role of the feed-forward network inside a decoder layer?" — correct "It independently transforms each token's vector through a non-linear projection". Explanation: "The position-wise FFN applies a two-layer MLP with a non-linearity (ReLU) to each token independently, adding representational capacity after attention has mixed context."

dpre-4: "How many Add & Normalize operations are inside each decoder layer?" — correct "Three — after masked self-attention, cross-attention, and feed-forward". Explanation: "Each decoder layer has three sub-layers (masked self-attention, cross-attention, FFN), and each is followed by a residual connection plus layer normalization."

dpre-5: "What does the linear projection layer do after the decoder stack?" — correct "Projects the decoder output to the vocabulary size to produce logits for each word". Explanation: "The linear layer maps each decoder output vector (dimension d_model) to a vector of size |vocabulary|, producing raw scores (logits) for every possible next token."

dpre-6: "What does the softmax function do to the logits from the linear layer?" — correct "Normalizes them into a probability distribution that sums to 1". Explanation: "Softmax exponentiates each logit and divides by the sum of all exponentials, turning raw scores into probabilities so we can sample or pick the most likely token."

dpre-7: "What does 'autoregressive generation' mean in a decoder?" — correct "Each generated token is fed back as input for predicting the next token". Explanation: "Autoregressive means the model generates one token at a time, feeding each prediction back as part of the input sequence for the next step."

dpre-8: "What signals the decoder to stop generating tokens?" — correct "When the model predicts a special end-of-sequence token (e.g. <END> or <EOS>)". Explanation: "Generation continues until the model produces a special <END>/<EOS> token or hits a maximum length limit."

dpre-9: "What is the purpose of the <START> (or <BOS>) token in the decoder?" — correct "It provides the initial input to kick off autoregressive generation". Explanation: "The <START> token is the seed: the decoder uses it as its first input to predict the very first output token, then continues autoregressively."

dpre-10: "What is the correct order of sub-layers inside a single decoder layer?" — correct "Masked Self-Attention → Cross-Attention → FFN". Explanation: "Each decoder layer first does masked self-attention (look at own past tokens), then cross-attention (look at encoder output), then a feed-forward network."

On submit it computes the percentage and calls `submitDecoderPreQuiz(percentage)`. If `decoderPreCompleted` is true it shows a simple completed screen with a "✓", "Decoder Pre-Quiz Already Completed", "Your score: {decoderPreScore}%", and the line "You have already submitted this quiz. Use the Next button to continue." After a normal submit it shows a score panel (with the same 70-percent threshold messages, decoder-flavored) and a "Review Answers" section. This page does not show a growth-analysis screen.

---

## PART L — PAGE 10: ENCODER → DECODER TRANSFER (DecoderTransitionStep.jsx)

This page animates the transfer of contextual memory from the encoder to the decoder. The card is 980 pixels wide. The heading is "Encoder → Decoder Transfer" with subtitle "Passing contextual memory from the encoder to the decoder". An optional "Show explanation / Hide explanation" toggle reveals a box: "The encoder has finished understanding the input sentence. Now it sends its contextual output vectors to the decoder, so the decoder can use this understanding while generating the output sequence." and "The decoder will use these vectors as Keys (K) and Values (V) in Cross-Attention, allowing it to reference the input while generating output."

`safeTokens` is `tokens.slice(0, 8)`. Each token's encoder output vector is computed with `generateEncoderOutputVector`.

There are four stages defined in `STAGES`: `why` ("Why"), `before` ("Before"), `transfer` ("Transfer"), `after` ("After"). A horizontal stage indicator shows the four as pills with check marks for completed stages; you can click back to completed stages. `goNext` and `goPrev` move between stages. When the user reaches stage 2 (transfer), a `useEffect` sets `transferDone` false, then after 3500 milliseconds sets it true, and after 4500 milliseconds auto-advances to stage 3. The Next button is disabled during the transfer animation (showing "Transferring…").

Stage 0 ("Why") shows a box "Why does this transfer happen?" with the text explaining the encoder computed a rich vector per word capturing meaning in context, that these encode the "understanding" of the input, and that these vectors become Keys and Values in cross-attention. Below are three small cards: "Source — Encoder output", "Carries — K & V vectors", "Destination — Decoder cross-attention".

Stage 1 ("Before") shows a side-by-side layout: a green-bordered "ENCODER" panel marked "✓ Done" listing each token with its encoder output vector, a center column of three pulsing "→" arrows labeled "K, V", and a dimmed "DECODER" panel marked "⏳ Waiting" with four placeholder rows reading "awaiting encoder K, V…".

Stage 2 ("Transfer") shows the encoder output vector cards which then shrink to scale 0.85 and, when `transferDone` becomes true, fade to opacity 0 while flying 320 pixels to the right (a 1.1-second eased motion staggered by `i * 0.08`). A bridge line grows from width 0 to 100 percent over 3.2 seconds with a green-cyan-purple gradient, and five glowing particles travel along it repeatedly until the transfer is done. The caption changes from "Passing encoder context vectors to decoder…" to "Vectors delivered to the decoder."

Stage 3 ("After") shows "Transfer Complete ✓" and "The decoder now has the encoder's understanding — it can start generating". A box explains what the decoder received: two cards "Used as Keys (K) in Cross-Attention" ("The decoder compares its Query against these to score relevance — 'which input word matters most right now?'") and "Used as Values (V) in Cross-Attention" ("Blended by attention weights, these give the decoder the actual content from relevant input words."). It then lists the "Encoder Memory Vectors" — each token with its full output vector. The final line reads "Press Next on the main controller to begin the Decoder steps →". A "↻ Replay" button restarts from stage 0.

A "Key insight" box at the bottom reads: "The encoder's output vectors are the decoder's 'memory' of the input. Without this transfer, the decoder would have no knowledge of what to translate. These vectors will be used as Keys and Values in cross-attention."

---

## PART M — PAGE 11: OUTPUT TOKENIZATION (DecoderTokenStep.jsx)

This page introduces the `<START>` token and autoregressive generation. The card is 680 pixels wide and at least 460 pixels tall. The heading is "Output Tokenization" with subtitle "The decoder builds its output one token at a time". The "Why we use this step" box reads: "The decoder begins with a special <START> token, then predicts each next token one at a time, feeding it back into itself until it produces <END>."

`safeTokens` is `tokens.slice(0, 4)`. The full sequence is `["<START>", ...safeTokens, "<END>"]`. An animation loop runs in a `useEffect`: it sets `phase` to 0, waits 900 milliseconds, then for each position from 1 to the sequence length it animates a pulsing "thinking" indicator (scale 1→1.15→1, opacity 0.6→1→0.6 over 0.9 seconds) and then sets `phase` to that index after another 900-millisecond wait. After completing the sequence it waits 1400 milliseconds and the loop restarts. `visibleTokens` is `sequence.slice(0, phase)`.

Each visible token is a rounded pill that springs in (initial opacity 0, y 14, scale 0.7, spring stiffness 300, damping 20). The `<START>` token is cyan/blue, the `<END>` token is purple, and predicted words are green. While thinking, a dashed "..." placeholder pill is shown. A status line reads "Decoder is ready to begin" at phase 0, "Decoder predicts the next token..." while generating, and "Generation complete" at the end. A small legend below shows three colored squares: "start signal", "predicted", "end of sequence".

A "Show explanation / Hide explanation" toggle reveals: "The decoder cannot generate all tokens at once. It produces one token, then re-runs itself with that token added to the input, this is called autoregressive generation." and "The <START> token is the seed that kicks off the loop. The <END> token is how the decoder signals that it's finished."

---

## PART N — PAGE 12: OUTPUT EMBEDDING (DecoderEmbeddingStep.jsx)

This page teaches decoder-side embedding. The card is 980 pixels wide. The heading is "Output Embedding" with subtitle "Each decoder token is converted into a vector representation".

`getDecoderEmbedding(token)` returns the fixed `START_VECTOR = [0.2, 0.7, 0.1, 0.4]` for `<START>`, and otherwise the standard letter-code `generateEmbeddingVector`. The decoder token sequence is `["<START>", ...tokens.slice(0, 10)]`.

A dedicated box at the top, "<START> special embedding", shows the four values of `START_VECTOR` in cyan/blue pills that continuously glow with an animated box-shadow, with the caption "Fixed demo vector for the <START> token".

Below, each decoder token is rendered as a row: the token name (the `<START>` token highlighted), a pulsing "→" arrow, a label ("fixed start embedding" for `<START>`, "letter-based demo vector" for the rest), and the four vector values in a bordered box. The vector values spring in individually (initial opacity 0, y 14, scale 0.6, spring stiffness 340, damping 22) staggered by `index * 0.12 + i * 0.07`.

A "Show explanation" toggle reveals: "Just like the encoder, the decoder cannot work with raw tokens directly. Each token including the special <START> token must first be converted into a numerical vector so the Transformer can process it." and "The decoder has its own embedding table, separate from the encoder's. The <START> token uses a fixed embedding vector." A "Key insight" box reads: "Embedding converts text into numbers. Words with similar meanings tend to have similar embedding vectors, which helps the model understand relationships between words."

---

## PART O — PAGE 13: POSITIONAL ENCODING — DECODER (DecoderPositionalStep.jsx)

This page teaches decoder positional encoding, framed as tracking the generation step. The card is 900 pixels wide. The heading is "Positional Encoding (Decoder)" with subtitle "tells the decoder which generation step it is currently on, not just word order".

The "Why we use this step — decoder purpose" box reads: "Unlike the encoder where positional encoding orders the input words, the decoder uses it to track which generation step it is currently on. <START> is always step 0, the first predicted word is step 1, and so on. Without this, the decoder cannot distinguish whether it is generating the 1st or the 5th output word."

`safeTokens` is `tokens.slice(0, 6)`; the decoder token sequence is `["<START>", ...safeTokens]`. It uses `getDecoderEmbedding` and the standard `generatePositionVector`. A legend in the top-right names "Decoder embedding" (cyan), "Positional vector" (purple), "Output vector" (green).

A red-bordered toggle switches between "Show Decoder Without Position Info" and "Show Decoder With Position Info". When position info is on, the explanatory line reads "The purple positional vector marks the generation step: <START> = step 0, first predicted word = step 1, and so on — different from the encoder where positions simply order the input words." When off, `shuffleArray` randomly reorders the tokens and a red line reads "Without positional encoding the decoder cannot tell which generation step it is on — all output positions appear equivalent, so the shuffled order below is indistinguishable."

Each token row shows "(Pos {index})", the token, the four-value embedding box, and (when position is on) a pulsing "+", the four-value position vector box labeled "Position vector (Pos {index})", a pulsing "→", and the output box where each value is the element-wise sum `(parseFloat(emb[i]) + parseFloat(pos[i])).toFixed(2)`. Rows use Framer Motion `layout` animation so they smoothly rearrange when shuffled.

---

## PART P — PAGE 14: DECODER STACK (DecoderStackStep.jsx)

This page teaches that the decoder stack is built from repeated decoder layers, and it hosts four sub-views. The overview card is 980 pixels wide and at least 760 pixels tall. The heading is "Decoder Stack" with subtitle "The decoder stack is built from repeated decoder layers".

A `view` state controls five modes: `"overview"`, `"masked-attention"`, `"cross-attention"`, `"feedforward"`, and `"addnorm"`. A `layerCount` state runs 1 to 6, auto-cycling every 2200 milliseconds while in overview.

A "Show explanation" toggle reveals: "The decoder stack repeats decoder layers to progressively refine the output. Each layer combines masked self-attention, cross-attention, and a feed-forward network to produce accurate predictions."

The overview shows a box "What happens inside one decoder layer?" with a numbered "Correct decoder layer order" list of six rows: 1. Masked Self-Attention, 2. Add & Norm, 3. Cross-Attention ← Encoder, 4. Add & Norm, 5. Feed Forward, 6. Add & Norm. A "Key difference from encoder" box reads: "The decoder layer has an extra sub-layer — cross-attention — which connects it to the encoder's output. This is the bridge between understanding the input and generating the output." A "Learn the internal parts" box with the text "Before fully understanding the decoder stack, explore what each sub-layer does. Each sub-view includes its own Add & Norm explanation." holds four navigation buttons: "Learn Masked Self-Attention", "Learn Cross-Attention", "Learn Feed Forward", "Learn Add & Normalize".

Below is an "Understanding Depth" bar identical in style to the encoder's, showing "{layerCount} / 6 decoder layers active" with captions "1 layer — basic context processing begins", "{n} layers — alignment with encoder growing" for 2, "{n} layers — deeper cross-attention patterns forming" for 3–4, "{n} layers — rich, full understanding reached" for 5+.

Then six stacked decoder layers are rendered, each with a color from red (layer 1) through orange/amber/lime/emerald to green (layer 6), a `note` ("Processes decoder context" for layer 1, "Processes deeper context" for layers 2–5, "Produces final decoder representation" for layer 6), the token words, and a six-row internal flow list: 1. Masked Self-Attention, 2. Add & Norm, 3. Cross-Attention ← Encoder (highlighted in amber), 4. Add & Norm, 5. Feed Forward, 6. Add & Norm. Down-arrows between layers bob and pulse when active. A closing summary box changes by layer count.

The `addnorm` sub-view is rendered inline in `DecoderStackStep`. It is a card headed "Add & Normalize" with subtitle "The stabilizer that runs after every sub-layer in a decoder layer" and a "×3 per layer" badge. It shows the same mini flow diagram as the encoder's ("x → Sub-Layer → + → LayerNorm → out" with "out = LayerNorm( x + SubLayer(x) )"), plus a legend explaining each symbol, two info cards "Add (residual)" and "Normalize", and a closing line "Applied after masked self-attention, cross-attention, and feed-forward. Without it, activations would explode or vanish across deep stacks."

### P.1 Masked Self-Attention sub-view (DecoderMaskedAttentionStep.jsx)

This sub-view is a card 980 pixels wide. The heading is "Masked Self-Attention" with subtitle "The decoder can only attend to past and current tokens, future tokens are masked". A "Show explanation" toggle reveals: "Masked self-attention prevents the decoder from 'cheating' by looking at future tokens. Each position can only attend to itself and previous tokens, enforcing left-to-right autoregressive generation."

The decoder token sequence is `["<START>", ...tokens.slice(0, 10)]`. Each token's input vector is `addVectors(getDecoderEmbedding(tok), generatePositionVector(i))`, and Q, K, V are computed with the same `projectVector` function and the same `WQ`, `WK`, `WV`, `Q_SHIFT`, `K_SHIFT`, `V_SHIFT` constants as the encoder's `AttentionStep`. The masked attention matrix: cell `[row][col]` is masked when `col > row`; the score for a non-masked cell is `normalizeScore(dotProduct(query[row], key[col]))` where `normalizeScore` clamps `score / 2.5` to [0, 0.99].

A box "How does masking work?" explains: the attention score matrix is the same as the encoder's — each token's Query compared with every other token's Key — but before softmax all future positions are set to −∞, which makes their attention weight effectively zero, creating a causal mask, a triangular pattern where each token can only see itself and previous tokens.

A "Token perspective" panel lets the user click any decoder token (`focusedIndex`). It shows three cards: "Current token" (the focused token), "Can attend to" (the tokens before it, or "Only self"), "Masked (cannot see)" (the tokens after it, or "None"). Below, a "Q, K, V for: {token}" box shows the focused token's Query (amber), Key (pink), and Value (lime) vectors.

The "Masked attention matrix" is a full table where allowed (blue) cells show the score and masked (red) cells show a "🔒" lock icon, with the caption "Blue cells = allowed attention. Red cells with 🔒 = masked future positions (set to −∞ before softmax)." Allowed cells pulse with an animated box-shadow.

A "Key insight" box reads: "Masking prevents the decoder from 'cheating' by looking at future tokens. This ensures the model learns to predict each word using only past context, just like how you generate speech one word at a time."

### P.2 Cross-Attention sub-view (DecoderCrossAttentionStep.jsx)

This sub-view is a card 980 pixels wide. The heading is "Encoder–Decoder Attention (Cross-Attention)" with subtitle "The decoder consults encoder outputs to understand the original input". A "Show explanation" toggle reveals: "Cross-attention is the bridge between encoder and decoder. The decoder sends Queries from its own tokens, while the encoder provides Keys and Values from its output vectors. This lets the decoder 'look at' the original input while generating each output token — like a translator glancing back at the source text."

`safeTokens` is `tokens.slice(0, 6)`. The encoder outputs use `generateEncoderOutputVector`. Decoder Queries are `projectVector(addVectors(getDecoderEmbedding(tok), generatePositionVector(i)), WQ, Q_SHIFT)`. Encoder Keys are `projectVector(encoderOutputVector, WK, K_SHIFT)`. The cross-attention matrix cell `[decoderRow][encoderCol]` is `normalizeScore(dotProduct(decoderQuery, encoderKey))` where here `normalizeScore` clamps `score / 2.5` to [0.01, 0.99].

A "How Cross-Attention Works — 4 Steps" box has four labeled cards: "① Decoder creates Query (Q)" — "Each decoder token asks: 'What part of the input do I need to focus on right now?'"; "② Encoder provides Keys (K)" — "Each encoder output says: 'Here is what I represent.' Q·K gives a relevance score for each pair."; "③ Scores become attention weights" — "High score = this encoder token is important. Softmax normalizes all scores so they sum to 1."; "④ Encoder Values (V) are blended" — "Weighted mix of encoder Values becomes the decoder's new context — what it 'learned' from the input." A closing analogy line reads "Analogy: Like a translator glancing back at the source text — the decoder 'looks at' encoder output for every word it generates".

The "Interactive Cross-Attention Flow" has three columns. The left column (36 percent width) lists the decoder tokens labeled "DECODER — sends Query (Q)", each showing its Query values; hovering one sets `hoveredDecoder`. The center column (28 percent width) shows, when a decoder token is hovered, "Attention weights from '{token}'" followed by one connection bar per encoder token with a traveling glowing dot and the text "{percent}% on '{word}'", plus a "Result (V blend)" box showing the weighted combination as `[{percent}%·V1 + {percent}%·V2 + ...]`. When nothing is hovered it shows "← Hover a decoder token to see which encoder tokens it queries". The right column (36 percent width) lists the encoder outputs labeled "ENCODER — provides K & V"; when a decoder token is hovered each encoder card glows with an intensity proportional to its attention score, shows a percentage badge, and shows a fill bar whose width is the score percentage.

Below is a "Cross-attention score matrix" table with rows as decoder tokens and columns as encoder tokens; each cell's background opacity is proportional to its score, and cells pulse with an animated box-shadow. The caption explains rows are the Query source and columns are the Key/Value source.

A "Key insight" box reads: "Cross-attention allows the decoder to selectively focus on the most relevant parts of the input sentence while generating each output token. This is what makes translation, summarization, and other sequence-to-sequence tasks possible."

### P.3 Feed Forward sub-view (DecoderFeedForwardStep.jsx)

This sub-view is a card 980 pixels wide. The heading is "Feed Forward (Decoder)" with subtitle "Transforms each decoder vector through a feed-forward network with ReLU activation". A "Show explanation" toggle reveals: "The feed-forward network refines each token independently after attention. It applies a non-linear transformation (ReLU) so the decoder can learn patterns that pure attention cannot capture."

`safeTokens` is `tokens.slice(0, 3)`, and `extraCount` is the number of tokens beyond 3. The decoder token sequence is `["<START>", ...safeTokens]`. The computation: each token's input is `addVectors(getDecoderEmbedding(tok), generatePositionVector(i))`; the transformed vector subtracts the fixed `DECODER_FF_SHIFT = [0.55, 0.85, 0.45, 1.0]` element-wise (this is different from the encoder's `FEED_FORWARD_SHIFT = [0.65, 0.95, 0.55, 1.1]`); the ReLU output applies `Math.max(0, v)`.

A "How it works" box explains each token is independently transformed through two linear layers with ReLU in between, shows the formula "FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂" and "ReLU(x) = max(0, x)", lists the demo shift values, and notes red = negative (before ReLU), blue = zeroed (after ReLU).

Two toggle buttons "Show Feed Forward Input" and "Show ReLU Output" control `showOutput`. Each decoder token is a row showing the input vector and then either the transformed values (negatives in red, pulsing) or the ReLU output (zeroed values in blue, positives in green), with a rotating arrow and a caption. If there are extra tokens beyond 3, a line reads "...and {extraCount} more token(s) processed the same way".

A "Key insight" box reads: "The feed-forward network adds non-linearity via ReLU, enabling the model to learn complex patterns. It processes each token independently (unlike attention, which mixes tokens). Same architecture as the encoder's FFN, but with separate learned weights."

### P.4 DecoderAddNormStep.jsx — the unused reusable component

`DecoderAddNormStep.jsx` is a complete, fully-built component that is currently not wired into the app (neither `MainCanvas` nor `DecoderStackStep` imports it). It accepts a `variant` prop with three possible values, each driving a `VARIANT_CONFIG` entry. The `"masked-attention"` variant has title "Add & Normalize (after Masked Self-Attention)", `prevStep` "Masked Self-Attention", and `sublayerShift = [0.08, -0.05, 0.12, -0.03]`. The `"cross-attention"` variant has title "Add & Normalize (after Cross-Attention)", `prevStep` "Cross-Attention", and `sublayerShift = [0.11, -0.07, 0.04, -0.09]`. The `"feed-forward"` variant has title "Add & Normalize (after Feed Forward)", `prevStep` "Feed Forward", and `sublayerShift = [0.06, -0.11, 0.09, -0.02]`. For each decoder token it computes `input` (embedding + position), `sublayerOutput` (input + sublayerShift), `residual` (input + sublayerOutput), and `normalized` via `normalizeVector` — which computes the mean, the variance, the standard deviation `Math.sqrt(variance + 0.001)`, and returns `(v - mean) / std` for each element. It shows a three-card data-flow ("From previous step", "What happens here", "Goes to next step"), two explanation cards ("Residual connection" with the formula "output = input + {prevStep}(input)", and "Layer normalization" with "norm(x) = (x − mean) / std"), and per-token rows showing Input, Sub-layer, Add (residual), and Normalized vectors. Because it is unused, the actual Add & Normalize explanation in the decoder is the inline `addnorm` sub-view inside `DecoderStackStep`.

---

## PART Q — PAGE 15: LINEAR + SOFTMAX (DecoderLinearSoftmaxStep.jsx)

This page teaches how the decoder output is turned into vocabulary probabilities. The card is 980 pixels wide. The heading is "Linear + Softmax" with subtitle "Converts decoder output into vocabulary probabilities" and the note "This step runs after the full decoder stack, it is not part of the decoder layers".

The sentence is `tokens.join(" ")` or "I love sunny days". `getTranslation(sentence)` looks up a fixed `SENTENCE_TRANSLATIONS` table — for example "i love sunny days" → ["J'aime", "les", "jours", "ensoleillés"], "i love you" → ["Je", "t'aime"], "the cat is big" → ["le", "chat", "est", "grand"], "hello world" → ["bonjour", "le", "monde"], "i am happy" → ["Je", "suis", "heureux"], "the dog is small" → ["le", "chien", "est", "petit"], "i like cats" → ["J'aime", "les", "chats"], "good morning" → ["bonjour"], "she is beautiful" → ["elle", "est", "belle"], "we are friends" → ["nous", "sommes", "amis"] — and if the sentence is not in the table it maps each word through the `WORD_TO_FRENCH` dictionary (a 33-entry English-to-French word map), leaving unknown words unchanged.

`buildVocab(translationTokens)` builds a vocabulary of up to 20 words: the translation tokens plus words from the `BASE_VOCAB` array ("le", "la", "les", "des", "de", "du", "et", "est", "un", "une", "Je", "suis", "bon", "beau", "soleil", "temps", "monde", "chat", "adore", "journées"). `generateLogits(sentence, position, targetWord, vocab)` produces a deterministic pseudo-random logit per vocabulary word using `hashStr` (a string hash) and `prand` (a sine-based pseudo-random generator): the target word gets a high logit `4.8 + prand(...) * 1.2`, and other words get logits in three bands depending on a random draw. The logits are passed through a numerically stable softmax (subtract max, exponentiate, normalize) to produce probabilities, and the candidates are sorted by probability descending.

A "Show explanation" toggle reveals a "How it works" panel explaining the linear layer scores every vocabulary word by multiplying the 512-number decoder output vector by a weight matrix to produce one logit per word, and softmax converts logits into probabilities between 0 and 1 that sum to 1, with the formulas "logits = decoder_output × W_vocab" and "P(word) = e^logit / Σ e^all logits".

A five-step visual flow pipeline runs across the top: ① "Decoder Vector" ("the decoder's 512-number summary"), ② "Linear Layer" ("gives every word a score"), ③ "Logits" ("{vocabSize} raw scores — not % yet"), ④ "Softmax" ("turns the scores into %"), ⑤ "Probabilities" ("a % per word, adding up to 100%"), each in a numbered colored card connected by "→" arrows.

A position selector lets the user pick which decoder output position to inspect (`selectedPos`); each position button reads "Position {i} → {word}". The "Vocabulary probabilities, position {selectedPos}" panel shows the top 5 candidates as horizontal probability bars; the top candidate is highlighted in green with a glow, the bar widths are proportional to `(item.prob / maxProb) * 100`, and each shows the percentage `(prob * 100).toFixed(1)%`. A green box announces "Predicted token at position {selectedPos}: '{word}' ({percent}%)". A note reads "Showing top 5 from a demo vocabulary, a real T5 model scores all 32,128 vocabulary tokens the same way."

A "Key insight" box reads: "This is where the decoder makes its final prediction. The linear layer evaluates every word in the vocabulary (32,128 words for T5), and softmax amplifies the highest score so one word clearly wins. The entire decoder stack exists to produce the single vector that feeds into this step."

---

## PART R — PAGE 16: OUTPUT PREDICTION (DecoderOutputStep.jsx)

This page demonstrates autoregressive generation. The card is 860 pixels wide and at least 560 pixels tall. The heading is "Output Prediction" with subtitle "Each click runs the whole decoder once and produces one new token".

It uses the same `SENTENCE_TRANSLATIONS` table and `WORD_TO_FRENCH` map as the linear+softmax page. The sentence is `tokens.join(" ")` or "I love sunny days". `totalSteps` is `translation.length + 1` (the +1 is for `<END>`).

A "Task" box reads "Translating '{sentence}' → French". The "Decoder input for next run" panel shows `["<START>", ...translation.slice(0, stepIdx)]` as pills — `<START>` in purple, predicted words in green — followed by a dashed "→ ?" placeholder while generation is incomplete. When `stepIdx > 0` and not complete, a line reads "Run {stepIdx} predicted {translation[stepIdx-1]} - now feeding it back in and running again".

There are two controls. The main button reads "Run Decoder" at step 0, "Run Again" afterward, and "Reset" when complete; `handleNext` sets `thinking` true, waits 600 milliseconds, then increments `stepIdx` (or resets if complete). The second button toggles "Auto Run" / "Pause"; when `autoPlay` is on, a `useEffect` runs the loop automatically — it sets `thinking` true, clears it after 800 milliseconds, and advances `stepIdx` after 1100 milliseconds, stopping when `stepIdx >= totalSteps`. When generation completes, a green box reads "Translation complete" and "'{sentence}' → '{translation joined}'".

A "Show explanation" toggle reveals: "Token-by-token generation means the decoder runs its entire stack of layers (masked attention, cross-attention, feed-forward) once per output token and each run produces just one new word." and "After predicting a word, that word is appended to the input and the whole decoder runs again to predict the next word. This loop is called autoregressive generation." and "Generation stops when the model predicts the special <END> token. This is also why text generation feels slower than encoding - the decoder cannot produce all tokens in parallel."

A `useEffect` resets `stepIdx`, `autoPlay`, and `thinking` whenever the sentence changes.

---

## PART S — PAGE 17: DECODER POST-QUIZ (DecoderPostQuizStep.jsx)

This page tests decoder understanding and shows a final cross-section learning analysis. It uses the ten fixed questions from `src/data/decoderPostQuiz.js`. Each question carries a `stepIndex` (0–6) and `stepLabel`; `STEP_INDEX_TO_PAGE` maps stepIndex 0→page 10, 1→11, 2→12, 3→13, 4→14, 5→15, 6→16. The ten questions are:

1: "What does the encoder-to-decoder transition transfer?" — correct "Context-aware vectors (memory) from the encoder's final output" — stepLabel "Encoder → Decoder Transfer". Explanation: "The transition passes the encoder's final context-aware representations to the decoder, which uses them as memory during cross-attention."

2: "What is the first token the decoder receives as input?" — correct "The <START> token to begin generation" — stepLabel "Output Tokenization". Explanation: "The decoder starts with a special <START> token as its initial input, which it uses to predict the first output token."

3: "How does the decoder embed its input tokens?" — correct "Each token is converted into a numeric vector, with <START> using a fixed vector" — stepLabel "Output Embedding". Explanation: "The decoder has its own embedding layer that maps each token to a vector. The <START> token uses a fixed, predefined embedding vector."

4: "Why does the decoder add positional encoding to its embeddings?" — correct "To tell the model the order of the output tokens being generated" — stepLabel "Positional Encoding". Explanation: "Just like the encoder, the decoder needs positional information so it knows which position each token occupies in the output sequence."

5: "In masked self-attention, why are future positions blocked?" — correct "To prevent the decoder from seeing tokens it hasn't generated yet" — stepLabel "Decoder Stack". Explanation: "Masked self-attention ensures each position can only attend to earlier positions, preserving the autoregressive property of left-to-right generation."

6: "In cross-attention, what does the decoder use from the encoder?" — correct "The encoder's Key and Value vectors as context" — stepLabel "Decoder Stack". Explanation: "Cross-attention lets the decoder query (Q) the encoder's output, which provides the Key (K) and Value (V) vectors. This is how the decoder accesses the input context."

7: "What does the feed-forward network do in a decoder layer?" — correct "Transforms each token's vector independently through a non-linear network" — stepLabel "Decoder Stack". Explanation: "The feed-forward network applies the same two-layer MLP to each token position independently, adding non-linear transformation capacity."

8: "What does the linear layer produce from the decoder's output vectors?" — correct "Logits — a raw score for every word in the vocabulary" — stepLabel "Linear + Softmax". Explanation: "The linear layer projects each decoder output vector to the vocabulary size, producing logits (raw scores) that indicate how likely each word is."

9: "What does softmax do to the logits?" — correct "Converts them into probabilities that sum to 1" — stepLabel "Linear + Softmax". Explanation: "Softmax normalizes the raw logits into a probability distribution, so we can interpret each value as the likelihood of that word being the next token."

10: "How does the decoder generate a full output sentence?" — correct "It generates tokens one at a time, feeding each back as input for the next" — stepLabel "Output Prediction". Explanation: "This is autoregressive generation: the decoder predicts one token, appends it to the input, and repeats until it produces an <END> token."

Answers are persisted under the `localStorage` key `decoderPostQuizAnswers`. On submit it computes the percentage and calls `submitDecoderPostQuiz(percentage)`.

When `decoderPostCompleted` is true the page shows a "Decoder Learning Analysis" screen. It compares `pre = decoderPreScore` with `post = decoderPostScore` and computes `growth` and `growthPct` the same way as the encoder analysis. The badge tiers are: growth ≥ 30 → "Decoder Master" with message "Outstanding growth! You've mastered the decoder concepts." and emoji 🚀; growth 10–29 → "Rising Star"; growth 1–9 → "Steady Learner"; growth 0 → "Consistent Performer"; growth negative → "Reviewer in Training" with message "Learning isn't always linear. Revisit the decoder steps to reinforce concepts." It shows the same two large `RingChart` rings ("Before Decoder / Pre-Quiz" and "After Decoder / Post-Quiz") with the animated arc and `CountUp`, a floating arrow, the growth value, and an "Insight" box.

This page additionally shows a "Your Complete Learning Journey" panel with four `MiniRing` components — small 60-pixel rings — for "Enc. Pre" (`preQuizScore`), "Enc. Post" (`encoderPostScore`), "Dec. Pre" (`decoderPreScore`), and "Dec. Post" (`decoderPostScore`) — so the user sees their full progression across all four assessments. As with the encoder analysis, a "Review Mistakes" panel can be toggled, and each wrong question has a "Revisit {stepLabel} →" button that jumps back to the relevant decoder page.

---

## PART T — SHARED COMPONENTS SUMMARY

The header search bar (`StepSearch.jsx`) lets the user type any keyword and jump to a matching page; it searches the title, label, section, and per-page `keywords` strings, shows up to 6 results, supports Enter to jump and Escape to close, and closes on outside click. Navigation between steps is done with the `AnimationController` Back/Next buttons (clamped to 0–17), the section navigator in the top-right of `MainCanvas`, the search bar, and various in-page buttons such as "Explore Encoder Details →" and the quiz "Revisit / Go to step" buttons. The theme toggle in the header flips `theme` between `"dark"` and `"light"`; every component re-derives `isDark` and re-renders with the appropriate Tailwind classes, with a 300-millisecond color transition on the main containers. The progress bar in `MainCanvas` shows `((step + 1) / 18) * 100` percent with an animated fill and a sweeping shine. The shared visual conventions are bordered rounded cards (cyan border in dark mode, blue border with shadow in light mode), "Why we use this step" educational callout boxes, "Key insight" boxes (violet-bordered) on the decoder pages, "Show explanation" toggles, and Framer Motion fade-and-scale entrance based on the `active` prop.

---

## PART U — BACKEND

There are three serverless API handler files in the `api/` folder, each a CommonJS module exporting an async `handler(req, res)`.

`api/save-pre-quiz.js` accepts only POST. It reads `{ name, preQuizScore }` from the body; if either is missing it returns 400 with `{ error: "name and preQuizScore are required" }`. Otherwise it calls `connectToDatabase()`, creates a new `User` document with `{ name, preQuizScore }`, and returns 200 with `{ id: user._id.toString() }`. Errors return 500 with the error message. This is the call that creates the MongoDB record and gives the front-end its `dbRecordId`.

`api/save-post-quiz.js` accepts only POST. It reads `{ id, postQuizScore }`; if either is missing it returns 400. It connects to the database and runs `User.findByIdAndUpdate(id, { postQuizScore }, { returnDocument: "after" })`. If no document is found it returns 404 `{ error: "User not found" }`; otherwise 200 `{ success: true }`.

`api/save-quiz.js` accepts only POST. It reads `{ id, quizType, score }`. `quizType` must be one of the `VALID_TYPES` array `["encoderPostScore", "decoderPreScore", "decoderPostScore"]`, otherwise it returns 400. It builds an update object `{ [quizType]: score }`, and if the quizType is `"encoderPostScore"` it also sets `postQuizScore` to the same score. It runs `User.findByIdAndUpdate(id, update, { returnDocument: "after" })`, returning 404 if not found or 200 `{ success: true }` on success.

`lib/mongodb.js` implements a cached Mongoose connection to survive serverless cold starts. It keeps a `global._mongoose` object `{ conn, promise }`. `connectToDatabase()` returns the cached connection if it exists; otherwise, if no connection promise is in flight, it reads `process.env.MONGODB_URI` (throwing "MONGODB_URI environment variable is not set" if absent) and starts `mongoose.connect(uri, { bufferCommands: false })`, caches the promise, awaits it, caches the resulting connection, and returns it.

`models/User.js` defines the Mongoose schema. The `User` schema has fields: `name` (String, required), `preQuizScore` (Number, default null), `postQuizScore` (Number, default null), `encoderPostScore` (Number, default null), `decoderPreScore` (Number, default null), `decoderPostScore` (Number, default null), and `createdAt` (Date, default `Date.now`). The model is exported as `mongoose.models.User || mongoose.model("User", UserSchema)` so it is not redefined on hot reloads.

The end-to-end flow: the user enters a name on the intro page; submitting the encoder pre-quiz POSTs the name and pre-quiz score to `save-pre-quiz`, which creates the record and returns its id; that id is stored in `localStorage` and used for all subsequent updates; submitting the encoder post-quiz, decoder pre-quiz, and decoder post-quiz each POST to `save-quiz` with the record id and the appropriate `quizType`. The legacy `save-post-quiz` endpoint also exists. All four scores plus `name` and `createdAt` accumulate on the single `User` document.

---

## PART V — PACKAGE.JSON DEPENDENCIES

The runtime dependencies are: `@testing-library/dom` ^10.4.1, `@testing-library/jest-dom` ^6.9.1, `@testing-library/react` ^16.3.2, `@testing-library/user-event` ^13.5.0, `@xenova/transformers` ^2.17.2 (the in-browser ML library — actively used), `d3` ^7.9.0 (declared but not imported anywhere — unused), `framer-motion` ^12.38.0 (actively used for all animation), `mongoose` ^9.5.0 (used by the backend API and model files), `react` ^19.2.4, `react-dom` ^19.2.4, `react-scripts` ^5.0.1, `reactflow` ^11.11.4 (declared but not imported anywhere — unused), and `web-vitals` ^2.1.4 (only referenced by the unused `reportWebVitals`). The dev dependencies are `autoprefixer` ^10.4.27, `cross-env` ^10.1.0, `postcss` ^8.5.8, and `tailwindcss` ^3.4.1. The scripts are `start` (`react-scripts start`), `build` (`cross-env CI=false react-scripts build`), `test` (`react-scripts test`), and `eject`.

---

## PART W — NOTES AND KNOWN ISSUES

The application has exactly 18 pages wired into `PAGE_CONFIG`, spanning nine sections. The decoder content is substantial and is mostly new material beyond a typical encoder-only treatment: the encoder-to-decoder transfer (page 10), output tokenization with `<START>`/`<END>` (page 11), output embedding with the fixed `START_VECTOR` (page 12), decoder positional encoding framed as generation-step tracking (page 13), the decoder stack with four interactive sub-views — masked self-attention, cross-attention, feed-forward, and Add & Normalize (page 14), linear + softmax over a demo French vocabulary (page 15), and autoregressive output prediction (page 16), plus a decoder pre-quiz (page 9) and decoder post-quiz with a full four-ring learning journey (page 17).

`generateEmbeddingVector` and `generatePositionVector` are duplicated across roughly a dozen files rather than being placed in a shared utility module. `EncoderQuizStep.jsx` and `DecoderAddNormStep.jsx` are complete components that exist in the source tree but are not wired into the running app — `EncoderPostQuizStep` is used at page 8 instead of `EncoderQuizStep`, and the decoder's Add & Normalize content is rendered inline inside `DecoderStackStep` instead of via `DecoderAddNormStep`. `d3` and `reactflow` are declared dependencies that are never imported. `App.test.js` is the unmodified CRA placeholder test and would fail because it searches for "learn react" text. All numeric vectors shown to the user (embeddings, positions, Q/K/V, attention scores, feed-forward shifts) are deterministic teaching demonstrations computed from letter codes and fixed constants, not values from a real trained model — the only place a real model runs is page 2, where T5-Small executes in the browser via Transformers.js and produces genuine softmax probabilities.
