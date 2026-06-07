# Occasio

Turn your photos into a custom design for any occasion — and a song to match.
Share, print, or download today; a singing-card link and merch are on the way.

## What it does

- **Custom Design** — upload 1–2 photos, answer a short survey, and generate
  one-of-a-kind images (powered by Google Gemini / "Nanobanana").
- **A Song to Match** — generate a custom song to pair with a design (Suno
  integration is currently mocked).
- Review, rate, regenerate, and export designs as print-ready greeting cards.

## Overview

Occasio is a client-only React + Vite single-page app (no backend yet). A user
picks a **gift type** (image or song), works through a short **wizard**, the app
generates results via an **AI provider**, and the user reviews, regenerates, and
exports them.

```
Landing                Wizard (per gift type)              Output
─────────              ──────────────────────              ──────
GiftTypeSelector  ─►   image: upload → survey → generate   review · rate ·
InspirationGallery     → message → gallery                 regenerate ·
("Make this")          song:  survey → generate → preview  export PDF · share
```

The codebase is organized as **layers**, not features, and is mid-migration to
TypeScript (the data, types, and service layers are `.ts`; UI components are
still `.jsx`):

- **`data/` is the single source of truth** for all static content — occasions,
  art styles, themes, survey schemas, mad-libs, marketing copy, inspiration
  recipes. Logic reads from here; adding an art style or occasion is a data edit.
- **`types/`** holds the domain contracts (`Product`, `ProductType`, `Occasion`,
  `ArtStyle`, `SurveySection`, …) — designed so a future users → projects →
  products backend can slot in without a rewrite.
- **`services/ai/`** is the one seam between the app and generation: a typed
  `getImageProvider()` factory returns either the real Gemini client or a mock
  (dev mode / no API key), so UI never branches on real-vs-mock itself.

State for an in-progress gift flows through `GiftFlowContext` (a reducer);
generated history is persisted locally in IndexedDB (`services/sessionStore`).

## Getting started

```bash
npm install
cp .env.example .env   # add your VITE_NANOBANANA_API_KEY
npm run dev            # http://localhost:5173
npm run build          # production build
npm run typecheck      # tsc --noEmit (app + vite config)
```

See [API_SETUP.md](API_SETUP.md) for API key configuration.

## Project structure

```
src/
  main.jsx  App.jsx
  types/        Domain contracts (content, survey, product)
  data/         Typed static content — occasions, artStyles, themes, madlibs,
                generation, print, copy, inspiration, surveys/{image,song}
  config/       Runtime config — gemini, flags, textStyles  (still .js)
  services/     Logic (all .ts):
    ai/           getImageProvider() factory + song/message services + types
    promptEngine, songPromptEngine, messagePromptEngine
    geminiService, mockService, mockSunoService, mockMessageService
    sessionStore (IndexedDB), cardExport (PDF), shareCard
  context/      React providers — GiftFlowContext (reducer), ToastContext
  components/   UI grouped by area:
    gifts/        flow container, type selector, inspiration, registry, hero/, steps/
    survey/       reusable survey inputs (chips, sliders, mad-libs, …)
    visual/       theme + motion providers, ambient background, tilt card
    settings/     model/dev-mode toggle
    common/       rating slider, prompt viewer, session history
  styles/       index.css
  assets/       hall-of-fame/ (inspiration gallery images)
```

## Notes

- **Security:** `VITE_`-prefixed env vars are bundled into the client build, so
  the Nanobanana key ships to the browser. A server-side proxy is planned.
- **Song generation** runs against a mock service; real Suno integration is a TODO.
- **TypeScript migration** is incremental (`allowJs`): data/types/services are
  converted; component `.jsx → .tsx` conversion is the remaining pass.
```
