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
| 0 | TransformerArchitectureStep | High-level transformer architecture overview |
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

## Deployment

Deployed to Netlify. `public/_redirects` handles SPA routing (`/* /index.html 200`).