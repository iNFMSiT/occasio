# Occasio Codebase Refactor — Design

**Date:** 2026-06-06
**Branch:** `refactor`
**Status:** Approved, pending implementation plan

## Context

Occasio is a React + Vite app (occasion reminder + gift platform: generates images,
songs, and eventually physical merch). It was built statically with no backend. A prior
cleanup deleted ~6,200 lines of dead "Custom Cards"-era code. The live app is reasonably
well-separated, but has accumulated:

- ~46 MB of non-source cruft (stale docs, one-off generation scripts + outputs,
  committed test artifacts, junk files).
- A committed `.env` containing a live API key (security issue).
- Hardcoded content tangled into logic (e.g. an art style's label lives in
  `config/constants.js` while its prompt instruction lives in `services/promptEngine.js`).
- Two parallel survey-config files and scattered real/mock service conditionals.
- No type system.

## Goals

1. Make the repo "look like a proper codebase" — clear, conventional structure.
2. Turn static data into a **proper, typed structure** that is local now and ready for
   backend/infra later. Types become the contract a backend must later satisfy.
3. Convert to **TypeScript incrementally**, typed seams first, build green at every step.
4. Stay **local** — do not build users/projects/fulfillment, but model the domain so they
   slot in later as a wrapper, not a rewrite.

Non-goals (this phase): backend/API, auth, persistence beyond existing IndexedDB,
physical fulfillment/dropship, any new product formats.

## Domain vision (informs naming, not built now)

Eventual model: **users** log in → create **projects/folders** → which contain
**products** (generated images, songs, …) → a product can become a postcard, a 52-image
card deck, a mug (dropship). There is a customize page (define prompt / what it is) →
generate → review → regenerate → history → edit again.

Implication: today's "gift" is really a **Product** with a *medium* (image/song) and a
future *format* (postcard, deck, mug). The current flow (survey → generate → review →
gallery) is already the product lifecycle. We name types accordingly **now** so the
users/projects layer is later an additive wrapper.

## Architecture decision: layer-first structure (Option B)

Chosen over feature-first because it is simpler now and splits cleanly into features
later. The organizing principle for "make it dynamic": **separate content (data) from
runtime config from logic.**

```
src/
  main.tsx  App.tsx
  types/        domain contracts (the future-facing model)
  data/         typed static content  ← the "make it dynamic" layer
  config/       runtime settings (env, gemini, feature flags) — NOT content
  services/     logic: ai/ (real+mock behind one factory), prompts/, persistence/, export/
  context/      providers (ProductFlow, Toast, Theme, Motion)
  components/    all UI, grouped: gifts/  survey/  visual/  settings/  common/
  styles/
```

## Type model (local now, designed for the vision)

Located in `src/types/`. Shapes are the contract; field types refined during implementation.

```ts
// ── Static content (backs data/) ──
interface Occasion     { id; label; emoji?; preset?: OccasionPreset }
interface OccasionPreset { moodSliders?; suggestedGenres?; suggestedVibes?; suggestedMadLib? }
interface ArtStyle     { id; label; thumbnail?; promptInstruction }  // unifies today's split label + instruction
interface Theme        { id; label; promptTemplate }                 // template string w/ placeholders, not a function
interface SurveySchema { id; sections: SurveySection[] }
interface SurveySection { id; kind: SurveyFieldKind; title; placement: 'core' | 'advanced'; config }

// ── Core entity (the vision, local for now) ──
type ProductMedium = 'image' | 'song'
type ProductFormat = 'digital' | 'postcard' | 'card-deck' | 'mug'   // declared, not built
interface ProductType {            // = today's gift registry, forward-named
  id; medium: ProductMedium; label; tagline; steps: StepId[]; surveyId; enabled: boolean
}
interface Product {                // what GiftFlowContext builds today; persisted later
  id; typeId; spec: ProductSpec; outputs: GenerationOutput[]
  status: 'draft' | 'generating' | 'review' | 'complete'; createdAt; updatedAt
  // later: projectId, ownerId  ← seam for users/folders
}
interface ProductSpec      { occasionId?; surveyData; selections; prompt? }  // the "customize" page
interface GenerationOutput { id; medium: ProductMedium; url; prompt; rating?; createdAt }
```

Mapping to today: `registry.js` GIFT_TYPES → `ProductType[]`; `GiftFlowContext` state →
a `Product` being built; `sessionStore` history → saved `Product[]`.

## Data layer (`src/data/`)

All hardcoded content moves here as typed `.ts`, read by logic instead of inlined:

- `occasions.ts` — from `occasionPresets.config.js`
- `artStyles.ts` — **unify** `ART_STYLES` (constants) + `STYLE_INSTRUCTIONS` (promptEngine)
- `themes.ts` — **unify** `THEMES` (constants) + `THEME_BUILDERS` (promptEngine)
- `surveys/image.ts`, `surveys/song.ts` — from `features/survey/configs/*`
- `productTypes.ts` — from `features/gifts/registry.js`
- `inspiration.ts` — from `config/inspirationRecipes.js`
- `copy.ts` — from `config/messaging.js` (HERO_VARIANTS, COPY)
- `prompts/` — extracted prompt fragments

Dead data dropped: `STYLE_BATTLES`, `MYSTERY_BOXES` (defined, never used).

## Config layer (`src/config/`) — runtime, not content

- `env.ts` — typed env access
- `gemini.ts` — model tiers, vision prompt, rate limits (from `gemini.config.js`)
- `flags.ts` — feature flags / limits (from `mvp.config.js`)

## Services (`src/services/`)

- `ai/` — `gemini.ts` (real) + `gemini.mock.ts`, `suno.ts` (stub) + `suno.mock.ts`,
  with `index.ts` factory selecting real vs mock once (replaces scattered
  `isApiConfigured()` / `settings.devMode` checks).
- `prompts/` — `imagePrompt.ts`, `songPrompt.ts`, `messagePrompt.ts` (logic only; content
  fragments come from `data/`).
- `persistence/` — `sessionStore.ts` (IndexedDB).
- `export/` — `cardExport.ts`, `shareCard.ts`.

## TypeScript approach

Incremental, typed seams first. Add `tsconfig.json` with `allowJs: true` so `.js` and
`.ts` coexist and the build never breaks. Convert in dependency order: types → data →
services → components. Strictness raised over time.

## Phasing

Each phase ends with a green `npm run build` and is its own commit.

| Phase | What | Risk |
|---|---|---|
| **0** | Cruft cleanup + security: delete stale docs & `scripts/`; untrack `.env` (after key rotation), `.DS_Store`, `.playwright-mcp/`; rewrite `README.md`; keep `API_SETUP.md` | none |
| **1** | TS scaffolding: install TypeScript + types, `tsconfig.json` (`allowJs:true`), add `src/types/` contracts. No file conversions | none |
| **2** | Data layer: extract hardcoded content into typed `src/data/*.ts`; unify split records; logic reads from data; drop dead `STYLE_BATTLES`/`MYSTERY_BOXES` | low |
| **3** | Folder reorg to Option B; convert `services/` to `.ts` | medium (import churn) |
| **4** | Service factory: real/mock behind one `ai/` interface; remove scattered conditionals | low |
| **5** | Convert components `.jsx → .tsx` incrementally (ongoing) | low |

Phases 0–2 deliver most of the "proper codebase" payoff; 3–5 land over time.

## Security action (independent of refactor)

`.env` with a live `VITE_NANOBANANA_API_KEY` is committed and pushed. Rotate the key in
Google Cloud, then `git rm --cached .env`. Removing it from *past* history requires a
force-push rewrite — separate decision. Note `VITE_`-prefixed vars are bundled into the
client build (shipped to browsers); a future backend proxy for image generation is worth
considering.

## Verification

After each phase: `npm run build` must pass. The import-graph orphan trace
(0 orphans expected) and a manual smoke of the two flows (image, song) confirm no
runtime regressions where feasible.
