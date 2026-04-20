# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Transformer Encoder Visualizer — a React app that walks users through each stage of a transformer encoder pipeline via animated, step-by-step visualizations. Users type a sentence and navigate through 7 ordered steps.

## Commands

All commands run from `transformer-encoder-visualizer/`:

```bash
npm start        # Dev server (CRA, port 3000)
npm run build    # Production build
npm test         # Jest + React Testing Library
```

## Architecture

**Single-page app** built with Create React App, Tailwind CSS 3, Framer Motion, and D3.

### Core data flow

`App.js` owns three pieces of state — `tokens`, `step`, and `theme` — and passes them down:

- `TokenInput` — text input that splits the sentence into tokens on every keystroke.
- `AnimationController` — Prev/Next buttons; `step` is clamped to 0–6.
- `MainCanvas` — maps the current `step` index to a step component and renders it with `AnimatePresence` page transitions.

### Step pipeline (in order)

| Index | Component | What it visualizes |
|-------|-----------|-------------------|
| 0 | TransformerArchitectureStep | Full encoder+decoder architecture with live T5-Small inference |
| 1 | TokenStep | Sentence splitting into tokens |
| 2 | EmbeddingStep | Token-to-vector embedding |
| 3 | PositionalStep | Positional encoding addition |
| 4 | EncoderStackStep | Multi-head attention + feed-forward |
| 5 | EncoderOutputStep | Final encoder representations |
| 6 | EncoderQuizStep | Interactive quiz (data in `data/encoderQuiz.js`) |

### Key conventions

- Every step component receives `{ active, tokens, setStep, theme }` props.
- Dark/light theming is string-based (`"dark"` / `"light"`); each component derives `isDark` locally and applies conditional Tailwind classes.
- Animations use Framer Motion's `useAnimation` + async `sleep()` sequences within `useEffect`.
- The AttentionStep (rendered inside EncoderStackStep) uses SVG with manual coordinate math for the attention graph — constants like `GRAPH_W`, `NODE_R`, `BOX_W` control layout.
- Tokens are capped at 10 (`safeTokens = tokens.slice(0, 10)`).

### TransformerArchitectureStep (Step 0) — detailed design

This is the most complex step. It was redesigned from a simple encoder-only diagram into a full encoder+decoder architecture visualization with a real ML model running in-browser.

#### Layout & SVG

- Full-width SVG (`960×440`) with 6 stage nodes arranged horizontally at `CY=220`.
- Stages: Embed → Self-Attention → Feed-Forward (encoder) | Cross-Attention → Feed-Forward → Output (decoder).
- Encoder and decoder halves separated by a dashed vertical divider at `x=475`.
- Bezier curves (`bez()` helper) connect stages with animated flowing dashes (CSS `@keyframes df/dr`).
- Residual connections shown as reverse-flowing arcs below the main path (orange color, `rev: true`).
- Cross-attention arc connects encoder FFN to decoder cross-attention above the main path.
- Input tokens displayed as pills on the left; output tokens with probability percentages on the right.
- Hover tooltips on each stage node show a short description.
- Color palette object `PAL` has `dark` and `light` variants with keys: `embed`, `selfAttn`, `ffn`, `crossAttn`, `output`, `dim`, `text`, `sub`, `pill`, `res`.

#### In-browser ML model

- Uses `@xenova/transformers` (Transformers.js) to run `Xenova/t5-small` entirely in the browser via ONNX Runtime / WebAssembly.
- Lazy singleton pattern: `getGenerator()` loads the model once with a progress callback, subsequent calls return the cached instance. Waiters queue handles concurrent load requests.
- Progressive loading bar shown while model downloads (~60MB on first visit, cached after).
- Model was switched from HuggingFace Inference API → `@xenova/transformers` to avoid CORS/auth issues.

#### User interaction

- Three preset translation examples (English → French/German/Romanian) selectable via buttons.
- Full sentence is editable in a text input field — user can type any sentence.
- The task prefix (e.g., `translate English to French:`) is shown as a label; the sentence is the editable part.
- Generation auto-triggers 600ms after the user stops typing (debounced via `useEffect` + `setTimeout`).

#### Generation controls (sliders)

- **Beam Search** slider (1–6): When >1, uses `num_beams` with `num_return_sequences` to generate multiple candidates. Probability is calculated as agreement ratio across sequences. Disables Top-P when active.
- **Top-P** slider (0.1–1.0): When beam=1, uses `do_sample: true` with `top_p`. Low values = predictable output, high values = creative/varied. Probability is synthetic based on top_p and position.
- Dynamic description text explains the current slider effect in plain language.

#### Output display

- Output tokens are `{tok, prob}[]` where `prob` is 0–1.
- Probability affects: pill border thickness/opacity, text weight/opacity, flow line opacity, and a percentage label.
- Tokens animate in sequentially with Framer Motion.

#### State variables

- `task` — the T5 task prefix string (e.g., `"translate English to French:"`)
- `inputText` — the user's editable sentence
- `activeExample` — index of selected preset example
- `numBeams` / `topP` — slider values
- `inToks` / `outToks` — displayed input/output token arrays
- `modelStatus` — `"idle"` | `"loading"` | `"ready"` | `"error"`
- `modelProgress` — 0–100 download progress
- `loading` / `flowing` — animation state flags

## Deployment

Deployed to Netlify. `public/_redirects` handles SPA routing (`/* /index.html 200`).