# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Transformer Encoder Visualizer — an educational React web app that walks users through each stage of a transformer encoder pipeline via animated, step-by-step visualizations. Users type a sentence and navigate through 7 ordered steps, from tokenization through to an interactive quiz. Step 0 runs a real T5-Small model in the browser for live translation inference.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.4 |
| Toolchain | Create React App (react-scripts) | 5.0.1 |
| Styling | Tailwind CSS 3 + PostCSS + Autoprefixer | 3.4.1 |
| Animation | Framer Motion | 12.38.0 |
| Charts/SVG | D3.js | 7.9.0 |
| Flow diagrams | ReactFlow (imported but unused in current steps) | 11.11.4 |
| In-browser ML | @xenova/transformers (Transformers.js / ONNX Runtime / WASM) | 2.17.2 |
| Testing | Jest + React Testing Library | — |
| Deployment | Vercel (`.vercel/` config present), Netlify (`_redirects`) | — |

## Commands

All commands run from `transformer-encoder-visualizer/`:

```bash
npm start        # Dev server (CRA, port 3000)
npm run build    # Production build
npm test         # Jest + React Testing Library
```

## Folder Structure

```
Project_Web/
├── CLAUDE.md
├── README.md
├── .gitignore
├── .env.local
├── .vercel/                          # Vercel deployment config
│
└── transformer-encoder-visualizer/   # The React app (all code lives here)
    ├── package.json
    ├── package-lock.json
    ├── tailwind.config.js            # Tailwind config — scans src/**/*.{js,jsx,ts,tsx}
    ├── postcss.config.js             # PostCSS with tailwindcss + autoprefixer
    ├── .gitignore
    ├── .vercel/
    │
    ├── public/
    │   ├── index.html                # SPA shell (title: "React App")
    │   ├── _redirects                # Netlify SPA routing: /* → /index.html 200
    │   ├── manifest.json
    │   ├── robots.txt
    │   ├── favicon.ico
    │   ├── logo192.png
    │   └── logo512.png
    │
    └── src/
        ├── index.js                  # ReactDOM entry point (StrictMode)
        ├── index.css                 # Tailwind directives (@tailwind base/components/utilities)
        ├── App.js                    # Root component — owns tokens, step, theme state
        ├── App.css                   # Legacy CRA styles (mostly unused)
        ├── App.test.js               # Single placeholder test (broken — looks for "learn react")
        ├── reportWebVitals.js        # CRA performance reporting
        ├── setupTests.js             # Jest DOM setup
        ├── logo.svg                  # CRA default logo (unused)
        │
        ├── assets/
        │   └── logo.png              # App header logo
        │
        ├── components/
        │   ├── TokenInput.jsx         # Text input → splits sentence into token pills
        │   ├── StageDetailView.jsx    # Expandable detail panels for Step 0 stage nodes
        │   └── AnimationRuleEditor.jsx # Rule-based animation controls (presets, sliders, toggles)
        │
        ├── controllers/
        │   └── AnimationController.jsx # Prev/Next step navigation buttons
        │
        ├── visualizers/
        │   └── MainCanvas.jsx         # Step router — maps step index → component, progress bar
        │
        ├── steps/
        │   ├── TransformerArchitectureStep.jsx  # Step 0: Full arch diagram + live T5-Small
        │   ├── TransformerIntroStep.jsx         # Standalone intro (not wired into step pipeline)
        │   ├── TokenStep.jsx                    # Step 1: Tokenization animation
        │   ├── EmbeddingStep.jsx                # Step 2: Token → vector embedding
        │   ├── PositionalStep.jsx               # Step 3: Positional encoding addition
        │   ├── EncoderStackStep.jsx             # Step 4: Encoder layer overview (hosts sub-views)
        │   ├── AttentionStep.jsx                # Sub-step: Interactive self-attention graph
        │   ├── FeedForwardStep.jsx              # Sub-step: Feed-forward + ReLU visualization
        │   ├── EncoderOutputStep.jsx            # Step 5: Final encoder representations
        │   └── EncoderQuizStep.jsx              # Step 6: 12-question randomized quiz
        │
        └── data/
            └── encoderQuiz.js         # 30 quiz questions with options, answers, explanations
```

## Architecture

### Core data flow

`App.js` owns three pieces of state — `tokens`, `step`, and `theme` — and passes them down:

- **`TokenInput`** — text input that splits the sentence into tokens on every keystroke via `.split(/\s+/)`.
- **`AnimationController`** — Prev/Next buttons; `step` is clamped to 0–6.
- **`MainCanvas`** — maps the current `step` index to a step component via `stepComponents[]` array, renders with `AnimatePresence` page transitions (slide left/right), and shows a progress bar.

### Step pipeline (in order)

| Index | Component | What it visualizes |
|-------|-----------|-------------------|
| 0 | `TransformerArchitectureStep` | Full encoder+decoder architecture with live T5-Small inference, animation rule editor, stage detail panels |
| 1 | `TokenStep` | Sentence splitting into tokens with split/combine button animation |
| 2 | `EmbeddingStep` | Token-to-vector embedding with expandable math explanation |
| 3 | `PositionalStep` | Positional encoding addition with shuffle toggle to show importance of order |
| 4 | `EncoderStackStep` | Multi-layer encoder overview with sub-views for self-attention and feed-forward |
| 5 | `EncoderOutputStep` | Final encoder representations showing input → context refinement → output per token |
| 6 | `EncoderQuizStep` | Interactive quiz — 12 random questions from a pool of 30, grading + wrong-answer review |

### Key conventions

- Every step component receives `{ active, tokens, setStep, theme }` props.
- Dark/light theming is string-based (`"dark"` / `"light"`); each component derives `isDark = theme === "dark"` locally and applies conditional Tailwind classes.
- Animations use Framer Motion's `useAnimation` + async `sleep()` sequences within `useEffect`.
- Tokens are capped at 10 across all steps (`safeTokens = tokens.slice(0, 10)`).
- A deterministic `generateEmbeddingVector(word)` function is duplicated across `EmbeddingStep`, `PositionalStep`, `AttentionStep`, `FeedForwardStep`, and `EncoderOutputStep` — it uses character codes, vowel count, and word length to produce a stable 4-dimensional demo vector.
- A matching `generatePositionVector(position)` function is also duplicated across steps — produces a 4-dim vector from position index.
- Each step has a "Why we use this step" educational callout box.

### TransformerArchitectureStep (Step 0) — detailed design

This is the most complex step (~1170 lines). It combines a live ML model, an SVG pipeline diagram, generation controls, an animation rule editor, and clickable stage detail panels.

#### Layout & SVG

- Full-width SVG (`960x440`) with 6 stage nodes arranged horizontally at `CY=220`.
- Stages defined in `STAGES[]`: Embed (x=140) → Self-Attention (x=270) → Feed-Forward (x=390) | Cross-Attention (x=560) → Feed-Forward (x=690) → Output (x=820).
- Encoder and decoder halves separated by a dashed vertical divider at `x=475`.
- Bezier curves (`bez()` helper) connect stages with animated flowing dashes (CSS `@keyframes df/dr`).
- Residual connections shown as reverse-flowing arcs below the main path (orange color, `rev: true`).
- Cross-attention arc connects encoder FFN to decoder cross-attention above the main path (`isCrossArc: true`).
- Input tokens displayed as pills on the left; output tokens with probability percentages on the right.
- Hover tooltips on each stage node show a short description from `DESC{}`. Click opens `StageDetailView`.
- Color palette object `PAL` has `dark` and `light` variants with keys: `embed`, `selfAttn`, `ffn`, `crossAttn`, `output`, `dim`, `text`, `sub`, `pill`, `res`.

#### In-browser ML model

- Uses `@xenova/transformers` to run `Xenova/t5-small` entirely in the browser via ONNX Runtime / WebAssembly.
- Lazy singleton pattern: `getModel()` loads tokenizer + model once with a progress callback, subsequent calls return the cached `modelBundle`. A `waiters[]` queue handles concurrent load requests.
- Progressive loading bar shown while model downloads (~60MB on first visit, cached after via `env.useBrowserCache = true`).
- Real per-token probabilities computed via `softmax()` over model output scores (logits). Subword tokens are merged into whole-word pills with joint probability.

#### Generation controls (6 sliders in `GenerationControls` component)

- **Beams** (1–6): Beam search when >1, disables sampling controls.
- **Temperature** (0.1–2.0): Controls randomness in sampling mode.
- **Top-P** (0.1–1.0): Nucleus sampling threshold.
- **Top-K** (1–100): Limits candidate pool size.
- **Max tokens** (4–32): Output length cap.
- **Repetition penalty** (1.0–2.0): Discourages repeated tokens.
- Dynamic hint text below each slider changes based on current value.

#### Animation rule editor (`AnimationRuleEditor` component)

- Collapsible panel with 5 presets (Default, Calm, Energetic, Minimal, Bold).
- Rules control: flow speed, stage delay, pulse period, auto-play, line thickness, line opacity, dash pattern, node size, show/hide residuals, show/hide cross-arc, probability threshold filter.
- Rules are applied to SVG flow line rendering (opacity, thickness, dash pattern, animation duration).

#### Stage detail panels (`StageDetailView` component)

- Clicking a stage node in the SVG opens a detail panel with: SVG diagram, intuition explanation, step-by-step math walkthrough, and key insights.
- Covers all 6 stages: Embed, Self-Attention, Encoder FFN, Cross-Attention, Decoder FFN, Output Projection.
- Detail SVGs use helper components: `Box`, `Arrow`, `VectorViz`, `MatrixViz`, `SvgDefs`.

#### State variables

- `task` — T5 task prefix string (e.g., `"translate English to French:"`)
- `inputText` — user's editable sentence
- `activeExample` — index of selected preset (0–2)
- `numBeams`, `topP`, `topK`, `temperature`, `maxTokens`, `repetitionPenalty` — generation sliders
- `inToks` / `outToks` — displayed input/output token arrays (outToks are `{tok, prob, rank, subwordCount}[]`)
- `modelStatus` — `"idle"` | `"loading"` | `"ready"` | `"error"`
- `modelProgress` — 0–100 download progress
- `loading` / `flowing` — animation state flags
- `hov` / `selectedStage` — hover tooltip and detail panel state
- `rules` — animation rule object from `AnimationRuleEditor`
- `error` — error message string

### AttentionStep — interactive self-attention graph

- Rendered as a sub-view inside `EncoderStackStep` (view state: `"attention"`).
- Tokens arranged in a circle graph (SVG + absolute-positioned buttons) with animated connection lines.
- **Scissor tool**: drag to cut attention links between tokens. Double-tap two nodes to reconnect.
- Computes Q, K, V vectors from input using fixed weight matrices (`WQ`, `WK`, `WV`) and shift vectors.
- Displays attention score matrix (Q dot K per pair), color-coded by active/cut state.
- "Token Perspective Mode" panel shows which words the focused word can/cannot attend to.
- "Attention Mistake Simulator" shows educational messages about the effect of cutting links.
- Connection health indicated by node border color: green (70%+), amber (50-69%), red (<50%).
- Layout constants: `BOX_W=980`, `GRAPH_W=620`, `GRAPH_H=250`, `NODE_R=28`.

### FeedForwardStep — feed-forward + ReLU visualization

- Rendered as a sub-view inside `EncoderStackStep` (view state: `"feedforward"`).
- Shows how each token's vector is transformed by a fixed subtraction (`FEED_FORWARD_SHIFT = [0.65, 0.95, 0.55, 1.1]`) then passed through ReLU (`max(0, x)`).
- Toggle between "Show Feed Forward Input" (pre-ReLU, red = negative) and "Show ReLU Output" (post-ReLU, blue = zeroed).
- Includes educational panels explaining the subtraction rule, ReLU definition, and an embedded YouTube video.

### EncoderStackStep — encoder layer stacking

- Shows 1–5 encoder layers with Add/Remove buttons.
- Each layer displays tokens with pulsing animation and the internal flow: Self-Attention → Add & Norm → Feed Forward → Add & Norm.
- Layer colors gradient from red (layer 1) through orange/lime to green (layer 5).
- Includes an embedded YouTube video about layer normalization.
- Navigation buttons to switch to AttentionStep or FeedForwardStep sub-views.

### EncoderQuizStep — interactive quiz

- Randomly selects 12 questions from a pool of 30 in `data/encoderQuiz.js`.
- Questions are linked to step indices (0–4) with step labels for navigation.
- After submission: shows grade (correct/total + percentage), wrong-answer review with explanations, and "Go to [Step] Again" buttons.
- "Try Same Quiz Again" resets answers; "Generate New 12 Questions" re-shuffles.

### TransformerIntroStep (not in pipeline)

- Standalone educational component explaining encoder/decoder at a high level.
- Not wired into `MainCanvas` step array — exists as a separate file that could be integrated.

## Theming

- Dark mode: `bg-slate-950`, cyan accents (`text-cyan-300`, `border-cyan-500`), gradient header from slate to cyan.
- Light mode: `bg-slate-100`, blue accents (`text-blue-800`, `border-blue-300`), gradient header from blue-800 to blue-900.
- Toggle button in the app header switches between modes.
- Each component handles theme independently via `isDark` boolean.

## Deployment

- **Vercel**: `.vercel/project.json` exists in both root and `transformer-encoder-visualizer/`.
- **Netlify**: `public/_redirects` handles SPA routing (`/* /index.html 200`).

## Known Issues / Notes

- `App.test.js` is the default CRA test — it looks for "learn react" text which doesn't exist in the app, so it will fail.
- `reactflow` is listed as a dependency but not imported or used in any current component.
- The `generateEmbeddingVector()` and `generatePositionVector()` functions are duplicated across 5 files — a shared utility would reduce duplication.
- `TransformerIntroStep.jsx` exists but is not included in the step pipeline.
- `App.css` contains only the default CRA styles (spin animation, header styles) which are not used.
- The `logo.svg` in `src/` is the default CRA logo, unused — the app uses `assets/logo.png` instead.
