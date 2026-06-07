# Occasio

Turn your photos into a custom design for any occasion — and a song to match.
Share, print, or download today; a singing-card link and merch are on the way.

## What it does

- **Custom Design** — upload 1–2 photos, answer a short survey, and generate
  one-of-a-kind images (powered by Google Gemini / "Nanobanana").
- **A Song to Match** — generate a custom song to pair with a design (Suno
  integration is currently mocked).
- Review, rate, regenerate, and export designs as print-ready greeting cards.

## Getting started

```bash
npm install
cp .env.example .env   # add your VITE_NANOBANANA_API_KEY
npm run dev            # http://localhost:5173
npm run build          # production build
```

See [API_SETUP.md](API_SETUP.md) for API key configuration.

## Project structure

```
src/
  types/        Shared TypeScript domain contracts
  data/         Typed static content (occasions, art styles, themes, surveys)
  config/       Runtime config (env, Gemini, feature flags)
  services/     Logic: AI clients, prompt engines, persistence, export
  context/      React providers (product flow, toast, theme, motion)
  components/   UI, grouped by area (gifts, survey, visual, settings, common)
```

A live security note: `VITE_`-prefixed env vars are bundled into the client
build. Treat the Nanobanana key accordingly; a server-side proxy is planned.
