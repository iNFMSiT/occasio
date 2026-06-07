# Occasio Refactor — Phases 0–2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean the repo of non-source cruft, stand up incremental TypeScript with shared domain types, and dissolve hardcoded content (`config/constants.js`, survey configs) into a typed `src/data/` layer — keeping the build green at every step.

**Architecture:** Layer-first structure (types / data / config / services / components). Phase 0 removes cruft. Phase 1 adds TypeScript tooling (`allowJs: true`, so `.js` and `.ts` coexist) and `src/types/` domain contracts. Phase 2 extracts static content into typed `src/data/*.ts` and unifies records that are currently split across files (an art style's label and its prompt instruction; a theme's label and its scene builder).

**Tech Stack:** React 19, Vite 7, TypeScript (new), Tailwind 4, Google GenAI SDK.

**Verification convention (read once):** This repo has **no test framework**. The gate for every task is:
- `npm run build` → expect it to end with `✓ built in …`. Vite/Rollup fails the build on any missing or broken import, so this catches relocation errors.
- After Phase 1: `npx tsc --noEmit` → expect no errors (type gate).
- Targeted `grep` checks where noted, to confirm no stale references remain.

**Scope note:** Phases 0–2 only. Within Phase 2, content that is entangled with component imports or resolver logic — the gift registry (`registry.js` → `ProductType[]`), marketing copy + `getHeroVariant` (`messaging.js`), and inspiration recipes (image imports) — is intentionally **deferred to Phase 3** (folder reorg), where moving files is the unit of work. Phase 2 handles the pure-data wins: `constants.js` breakup, survey configs, and the split-record unifications.

---

## Phase 0 — Cruft cleanup & security

### Task 0.1: Delete stale docs and junk files

**Files:**
- Delete: `BACKEND_IMPLEMENTATION.md`, `ENDPOINTS_SETUP_GUIDE.md`, `LOCAL_VS_EXTERNAL_ANALYSIS.md`, `MVP_PLAN.md`, `Untitled`

- [ ] **Step 1: Remove the files**

```bash
git rm BACKEND_IMPLEMENTATION.md ENDPOINTS_SETUP_GUIDE.md LOCAL_VS_EXTERNAL_ANALYSIS.md MVP_PLAN.md Untitled
```

- [ ] **Step 2: Confirm nothing in source references them**

```bash
grep -rIl --exclude-dir=node_modules --exclude-dir=.git -e 'BACKEND_IMPLEMENTATION' -e 'ENDPOINTS_SETUP_GUIDE' -e 'LOCAL_VS_EXTERNAL_ANALYSIS' -e 'MVP_PLAN' . || echo "no references — good"
```
Expected: `no references — good`

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `✓ built in …`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove stale Custom Cards-era docs and junk"
```

---

### Task 0.2: Delete one-off generation scripts

**Files:**
- Delete: `scripts/` (contains `genHallOfFame.mjs`, `genOptionPreviews.mjs`, and ~30 MB of `out-previews/` output)

- [ ] **Step 1: Confirm scripts are not wired into the build**

Run: `grep -nE '"scripts"|genHallOfFame|genOptionPreviews' package.json || echo "not referenced — good"`
Expected: shows only the `dev`/`build`/`preview` block, no script references → `not referenced — good`

- [ ] **Step 2: Confirm no source imports from `scripts/`**

```bash
grep -rIl --include=*.js --include=*.jsx --exclude-dir=node_modules 'scripts/' src || echo "no source imports — good"
```
Expected: `no source imports — good`

- [ ] **Step 3: Remove the directory**

```bash
git rm -r scripts
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ built in …`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove one-off image-generation scripts and outputs"
```

---

### Task 0.3: Untrack secrets and machine artifacts, enforce gitignore

**Files:**
- Modify: `.gitignore`
- Untrack (keep on disk): `.env`, `.DS_Store`, `public/.DS_Store`, `.playwright-mcp/`

> **PRECONDITION:** The user must rotate `VITE_NANOBANANA_API_KEY` in Google Cloud before this task, because `.env` is in pushed history. Untracking stops future tracking but does not purge history. Do not proceed until the user confirms rotation.

- [ ] **Step 1: Verify which artifacts are currently tracked**

```bash
git ls-files | grep -E '(^|/)\.env$|\.DS_Store$|^\.playwright-mcp/'
```
Expected: lists `.env`, one or more `.DS_Store`, and `.playwright-mcp/...` files.

- [ ] **Step 2: Untrack them (files stay on disk)**

```bash
git rm --cached .env
git rm --cached --ignore-unmatch .DS_Store public/.DS_Store
git rm -r --cached .playwright-mcp
```

- [ ] **Step 3: Ensure `.gitignore` covers them**

Confirm these lines exist in `.gitignore` (append any that are missing):

```
.env
.env.*
.DS_Store
.playwright-mcp/
dist/
```

- [ ] **Step 4: Verify they are now ignored and untracked**

```bash
git ls-files | grep -E '(^|/)\.env$|\.DS_Store$|^\.playwright-mcp/' || echo "untracked — good"
git check-ignore .env .DS_Store .playwright-mcp/ | wc -l
```
Expected: first line → `untracked — good`; second → `3`

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "chore: untrack .env, .DS_Store, and .playwright-mcp; enforce gitignore"
```

---

### Task 0.4: Rewrite README to current Occasio reality

**Files:**
- Modify: `README.md` (currently describes the obsolete 52-card playing-card deck)

- [ ] **Step 1: Replace README contents**

Overwrite `README.md` with:

```markdown
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

A live design key note: `VITE_`-prefixed env vars are bundled into the client
build. Treat the Nanobanana key accordingly; a server-side proxy is planned.
```

- [ ] **Step 2: Create `.env.example` referenced above**

Create `.env.example`:

```
# Google Gemini / Nanobanana API key (client-bundled — see README security note)
VITE_NANOBANANA_API_KEY=
```

- [ ] **Step 3: Commit**

```bash
git add README.md .env.example
git commit -m "docs: rewrite README for Occasio; add .env.example"
```

---

## Phase 1 — TypeScript scaffolding

### Task 1.1: Install TypeScript and add tsconfig

**Files:**
- Create: `tsconfig.json`, `tsconfig.node.json`
- Modify: `package.json` (devDependencies + scripts)

- [ ] **Step 1: Install TypeScript and React type packages**

```bash
npm install -D typescript @types/react @types/react-dom @types/node
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "checkJs": false,
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": false,
    "types": ["vite/client", "node"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.js"]
}
```

- [ ] **Step 4: Add a `typecheck` script to `package.json`**

In the `"scripts"` block, add:

```json
"typecheck": "tsc --noEmit"
```

- [ ] **Step 5: Verify typecheck runs clean against existing JS**

Run: `npm run typecheck`
Expected: no output / exit 0 (with `checkJs:false`, existing `.js` is not type-checked yet).

- [ ] **Step 6: Verify build still works**

Run: `npm run build`
Expected: `✓ built in …`

- [ ] **Step 7: Commit**

```bash
git add tsconfig.json tsconfig.node.json package.json package-lock.json
git commit -m "build: add TypeScript with allowJs (incremental migration)"
```

---

### Task 1.2: Add shared domain types

**Files:**
- Create: `src/types/content.ts`, `src/types/survey.ts`, `src/types/product.ts`, `src/types/index.ts`

These types are the contract the rest of the refactor targets. They are not imported by runtime code yet (that happens in Phase 2), so adding them cannot break the build.

- [ ] **Step 1: Create `src/types/content.ts`**

```ts
// Static content contracts (back the src/data layer).

export interface ArtStyle {
  id: string;
  label: string;
  description: string;
  /** Narrative rendering instruction injected into image prompts. */
  promptInstruction: string;
  thumbnail?: string;
}

/** A theme pairs display metadata with a scene-builder over survey answers.
 *  (Builder stays a function for now; template-ization is a later phase.) */
export interface Theme {
  id: string;
  label: string;
  description: string;
  buildScene: (survey: SurveyData) => string;
}

export interface MadLibField {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface MadLibTemplate {
  id: string;
  template: string;
  fields: MadLibField[];
}

export interface Occasion {
  id: string;
  label: string;
  emoji?: string;
  preset?: OccasionPreset;
}

export interface OccasionPreset {
  moodSliders?: Record<string, number>;
  suggestedGenres?: string[];
  suggestedVibes?: string[];
  suggestedMadLib?: string;
}

// Forward-declared here, defined in survey.ts; re-exported via index.ts.
import type { SurveyData } from './survey';
```

- [ ] **Step 2: Create `src/types/survey.ts`**

```ts
export type SurveyFieldKind =
  | 'chips'
  | 'sliders'
  | 'madlib'
  | 'details'
  | 'vision'
  | 'occasion';

export interface SurveySection {
  id: string;
  kind: SurveyFieldKind;
  title: string;
  placement: 'core' | 'advanced';
  config: Record<string, unknown>;
}

export interface SurveySchema {
  id: string;
  sections: SurveySection[];
}

/** Loose for now — survey answers vary by gift type. Tightened in a later phase. */
export interface SurveyData {
  occasion?: string | { label: string } | null;
  freeText?: string;
  recipient?: { name: string; relationship: string };
  moodSliders?: Record<string, number>;
  hobbies?: string[];
  favoriteShows?: string[];
  favoriteMusic?: string[];
  madLibs?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}
```

- [ ] **Step 3: Create `src/types/product.ts`**

```ts
import type { SurveyData } from './survey';

export type ProductMedium = 'image' | 'song';
export type ProductFormat = 'digital' | 'postcard' | 'card-deck' | 'mug';

export interface ProductType {
  id: string;
  medium: ProductMedium;
  label: string;
  description: string;
  steps: string[];
  surveyId: string;
  enabled: boolean;
}

export interface GenerationOutput {
  id: string;
  medium: ProductMedium;
  url: string;
  prompt: string;
  rating?: number;
  createdAt: number;
}

export interface ProductSpec {
  occasionId?: string;
  surveyData: SurveyData;
  selections: Record<string, string[]>;
  prompt?: string;
}

export interface Product {
  id: string;
  typeId: string;
  spec: ProductSpec;
  outputs: GenerationOutput[];
  status: 'draft' | 'generating' | 'review' | 'complete';
  createdAt: number;
  updatedAt: number;
  // Future seam for users/folders: projectId?, ownerId?
}
```

- [ ] **Step 4: Create `src/types/index.ts` (barrel)**

```ts
export type * from './content';
export type * from './survey';
export type * from './product';
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: `✓ built in …`

- [ ] **Step 7: Commit**

```bash
git add src/types
git commit -m "feat(types): add shared domain contracts (content, survey, product)"
```

---

## Phase 2 — Data layer

> Each task moves existing content out of logic files into a typed `src/data/*.ts`,
> then points the original consumers at the new module. Because Vite fails the build
> on a broken import, `npm run build` is the regression gate for every move.

### Task 2.1: Unify art styles into `src/data/artStyles.ts`

Today an art style's label/description live in `src/config/constants.js` (`ART_STYLES`, lines 2–13) and its prompt instruction lives in `src/services/promptEngine.js` (`STYLE_INSTRUCTIONS`, lines 19–30). Unify into one typed record.

**Files:**
- Create: `src/data/artStyles.ts`
- Modify: `src/services/promptEngine.js` (remove local `STYLE_INSTRUCTIONS`, import from data)
- Modify: `src/config/constants.js` (remove `ART_STYLES`)

- [ ] **Step 1: Create `src/data/artStyles.ts`**

Combine each entry from `ART_STYLES` (constants.js:2–13) with its matching `STYLE_INSTRUCTIONS` string (promptEngine.js:19–30), keyed by `id`. Pattern (first two shown; produce all 10 ids: hand-animated, pixar, hyper-realistic, watercolor, oil-painting, digital-art, sketch, anime, comic-book, vintage-poster):

```ts
import type { ArtStyle } from '../types';

export const ART_STYLES: ArtStyle[] = [
  {
    id: 'hand-animated',
    label: 'Hand Animated',
    description: 'Classic 2D animation style',
    promptInstruction:
      'classic 2D hand-animated style with visible brushstrokes, cel-shading outlines, and soft painted backgrounds reminiscent of Studio Ghibli. Organic, slightly imperfect linework.',
  },
  {
    id: 'pixar',
    label: 'Pixar 3D',
    description: '3D animated movie style',
    promptInstruction:
      'Pixar 3D CGI with smooth subsurface scattering on skin, large expressive eyes, slightly exaggerated proportions, and cinematic volumetric lighting.',
  },
  // … remaining 8, copied verbatim from the two source files, matched by id …
];

/** id → promptInstruction, for prompt building. */
export const STYLE_INSTRUCTIONS: Record<string, string> = Object.fromEntries(
  ART_STYLES.map((s) => [s.id, s.promptInstruction]),
);
```

- [ ] **Step 2: Update `promptEngine.js` to import from data**

Remove the local `STYLE_INSTRUCTIONS` object (lines 19–30). Change the import on line 6 so `ART_STYLES` comes from data and add `STYLE_INSTRUCTIONS`:

```js
import { COMPOSITION_TYPES, MOOD_TYPES } from '../config/constants.js';
import { ART_STYLES, STYLE_INSTRUCTIONS } from '../data/artStyles.ts';
```

(Leave all `STYLE_INSTRUCTIONS[...]` and `ART_STYLES.find(...)` usages unchanged.)

- [ ] **Step 3: Remove `ART_STYLES` from `constants.js`**

Delete lines 1–13 (the `ART_STYLES` block). Update any other importers: run the grep in Step 5 first if unsure.

- [ ] **Step 4: Repoint other `ART_STYLES` importers**

```bash
grep -rn "ART_STYLES" src --include=*.js --include=*.jsx
```
For every file that imports `ART_STYLES` from `'../config/constants.js'` (e.g. `src/features/survey/configs/imageSurvey.config.js`), change the import source to `'../../data/artStyles.ts'` (adjust relative depth per file).

- [ ] **Step 5: Verify no remaining import of `ART_STYLES` from constants**

```bash
grep -rn "constants.*ART_STYLES\|ART_STYLES.*constants" src && echo "FIX THESE" || echo "clean"
```
Expected: `clean`

- [ ] **Step 6: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: no type errors; `✓ built in …`

- [ ] **Step 7: Commit**

```bash
git add src/data/artStyles.ts src/services/promptEngine.js src/config/constants.js src/features
git commit -m "refactor(data): unify art styles (label + prompt instruction) into data/artStyles"
```

---

### Task 2.2: Unify themes into `src/data/themes.ts`

`THEMES` metadata lives in constants.js (lines 16–27); the per-theme scene builders live in `promptEngine.js` `THEME_BUILDERS` (lines 33–81). Builders are functions over survey data (with branching/randomness), so they stay functions — unified onto the theme record as `buildScene`.

**Files:**
- Create: `src/data/themes.ts`
- Modify: `src/services/promptEngine.js`
- Modify: `src/config/constants.js`

- [ ] **Step 1: Create `src/data/themes.ts`**

Merge each `THEMES` entry with its `THEME_BUILDERS[id]` function. Pattern (first one shown; produce all 10 ids: celebrities, careers, time-traveler, wildcard, sports, superhero, sci-fi, fantasy, historical, food — copy each builder body verbatim from promptEngine.js:33–81):

```ts
import type { Theme, SurveyData } from '../types';

export const THEMES: Theme[] = [
  {
    id: 'celebrities',
    label: 'Celebrities',
    description: 'Transform into famous personalities',
    buildScene: (survey: SurveyData) => {
      const shows = survey.favoriteShows?.length
        ? `inspired by ${survey.favoriteShows[0]}`
        : 'on a red carpet';
      const music = survey.favoriteMusic?.length
        ? `, with subtle nods to ${survey.favoriteMusic[0]} fandom`
        : '';
      return `as a famous celebrity ${shows}${music}, surrounded by paparazzi and glamour`;
    },
  },
  // … remaining 9, builder bodies copied verbatim …
];

/** id → buildScene, for prompt building. */
export const THEME_BUILDERS: Record<string, (survey: SurveyData) => string> =
  Object.fromEntries(THEMES.map((t) => [t.id, t.buildScene]));
```

- [ ] **Step 2: Update `promptEngine.js`**

Remove the local `THEME_BUILDERS` object (lines 33–81). Update imports: drop `THEMES` from constants and import the unified versions:

```js
import { COMPOSITION_TYPES, MOOD_TYPES } from '../config/constants.js';
import { ART_STYLES, STYLE_INSTRUCTIONS } from '../data/artStyles.ts';
import { THEME_BUILDERS } from '../data/themes.ts';
```

(All `THEME_BUILDERS[theme]` usages remain unchanged.)

- [ ] **Step 3: Remove `THEMES` from `constants.js`** (the block at lines 16–27).

- [ ] **Step 4: Repoint other `THEMES` importers**

```bash
grep -rn "THEMES" src --include=*.js --include=*.jsx
```
Repoint each importer of `THEMES` from constants to `'../../data/themes.ts'` (adjust depth). Confirm:

```bash
grep -rn "constants.*\bTHEMES\b\|\bTHEMES\b.*constants" src && echo "FIX THESE" || echo "clean"
```
Expected: `clean`

- [ ] **Step 5: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: no type errors; `✓ built in …`

- [ ] **Step 6: Commit**

```bash
git add src/data/themes.ts src/services/promptEngine.js src/config/constants.js src/features
git commit -m "refactor(data): unify themes (metadata + scene builder) into data/themes"
```

---

### Task 2.3: Move mad-lib templates to `src/data/madlibs.ts`

**Files:**
- Create: `src/data/madlibs.ts`
- Modify: `src/config/constants.js`
- Modify: importers of `MAD_LIBS_TEMPLATES`

- [ ] **Step 1: Find current importers**

```bash
grep -rn "MAD_LIBS_TEMPLATES" src --include=*.js --include=*.jsx
```
Record the list (e.g. `imageSurvey.config.js`).

- [ ] **Step 2: Create `src/data/madlibs.ts`**

Move the entire `MAD_LIBS_TEMPLATES` array verbatim from `constants.js` (lines 49–366) and annotate the type:

```ts
import type { MadLibTemplate } from '../types';

export const MAD_LIBS_TEMPLATES: MadLibTemplate[] = [
  // … paste the 6 templates verbatim from constants.js:49–366 …
];
```

- [ ] **Step 3: Remove the block from `constants.js`** (lines 48–366).

- [ ] **Step 4: Repoint importers** to `'../../data/madlibs.ts'` (adjust depth). Verify:

```bash
grep -rn "constants.*MAD_LIBS_TEMPLATES\|MAD_LIBS_TEMPLATES.*constants" src && echo "FIX THESE" || echo "clean"
```
Expected: `clean`

- [ ] **Step 5: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: clean; `✓ built in …`

- [ ] **Step 6: Commit**

```bash
git add src/data/madlibs.ts src/config/constants.js src/features
git commit -m "refactor(data): move mad-lib templates to data/madlibs"
```

---

### Task 2.4: Move generation enums/constraints to `src/data/generation.ts`

`COMPOSITION_TYPES`, `MOOD_TYPES`, `DIVERSITY_CONSTRAINTS` (constants.js:369–397) are generation-logic constants used by `promptEngine.js`.

**Files:**
- Create: `src/data/generation.ts`
- Modify: `src/config/constants.js`
- Modify: `src/services/promptEngine.js`

- [ ] **Step 1: Find importers**

```bash
grep -rn "COMPOSITION_TYPES\|MOOD_TYPES\|DIVERSITY_CONSTRAINTS" src --include=*.js --include=*.jsx
```

- [ ] **Step 2: Create `src/data/generation.ts`**

Move the three blocks verbatim from constants.js:369–397:

```ts
export const COMPOSITION_TYPES = {
  CLOSE_UP: 'close-up',
  MID_SHOT: 'mid-shot',
  FULL_BODY: 'full-body',
} as const;

export const MOOD_TYPES = {
  EPIC: 'epic',
  FUNNY: 'funny',
  SERIOUS: 'serious',
  ABSTRACT: 'abstract',
} as const;

export const DIVERSITY_CONSTRAINTS = {
  MAX_COLOR_DOMINANCE: 10,
  COMPOSITION_TARGETS: {
    [COMPOSITION_TYPES.CLOSE_UP]: 15,
    [COMPOSITION_TYPES.MID_SHOT]: 20,
    [COMPOSITION_TYPES.FULL_BODY]: 17,
  },
  MOOD_DISTRIBUTION: {
    [MOOD_TYPES.EPIC]: 13,
    [MOOD_TYPES.FUNNY]: 13,
    [MOOD_TYPES.SERIOUS]: 13,
    [MOOD_TYPES.ABSTRACT]: 13,
  },
} as const;
```

- [ ] **Step 3: Remove the three blocks from `constants.js`** (lines 368–397).

- [ ] **Step 4: Update `promptEngine.js` import** (line 6) to:

```js
import { COMPOSITION_TYPES, MOOD_TYPES } from '../data/generation.ts';
```
Repoint any other importers similarly. Verify:

```bash
grep -rn "constants.*\(COMPOSITION_TYPES\|MOOD_TYPES\|DIVERSITY_CONSTRAINTS\)" src && echo "FIX THESE" || echo "clean"
```
Expected: `clean`

- [ ] **Step 5: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: clean; `✓ built in …`

- [ ] **Step 6: Commit**

```bash
git add src/data/generation.ts src/config/constants.js src/services/promptEngine.js
git commit -m "refactor(data): move composition/mood/diversity constants to data/generation"
```

---

### Task 2.5: Move print/export specs to `src/data/print.ts`

`PRINT_SPECS` (constants.js:409–414) and `CARD_EXPORT` (constants.js:417–446) are static export configuration.

**Files:**
- Create: `src/data/print.ts`
- Modify: `src/config/constants.js`
- Modify: importers (`src/services/cardExport.js` and any others)

- [ ] **Step 1: Find importers**

```bash
grep -rn "PRINT_SPECS\|CARD_EXPORT" src --include=*.js --include=*.jsx
```

- [ ] **Step 2: Create `src/data/print.ts`**

Move `PRINT_SPECS` and `CARD_EXPORT` verbatim from constants.js:408–446:

```ts
export const PRINT_SPECS = {
  DPI: 300,
  CARD_SIZE: { width: 2.5, height: 3.5 },
  BLEED: 0.125,
  MIN_RESOLUTION: { width: 3000, height: 4500 },
};

export const CARD_EXPORT = {
  // … paste verbatim from constants.js:417–446 …
};
```

- [ ] **Step 3: Remove both blocks from `constants.js`** (lines 408–446).

- [ ] **Step 4: Repoint importers** to `'../data/print.ts'` (adjust depth). Verify:

```bash
grep -rn "constants.*\(PRINT_SPECS\|CARD_EXPORT\)" src && echo "FIX THESE" || echo "clean"
```
Expected: `clean`

- [ ] **Step 5: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: clean; `✓ built in …`

- [ ] **Step 6: Commit**

```bash
git add src/data/print.ts src/config/constants.js src/services
git commit -m "refactor(data): move print and card-export specs to data/print"
```

---

### Task 2.6: Drop dead constants and retire `constants.js`

After 2.1–2.5, `constants.js` should hold only unused data: `STYLE_BATTLES` (30–36), `MYSTERY_BOXES` (39–46), and `API_ENDPOINTS` (400–406, referenced only the deleted `services/api.js`).

**Files:**
- Delete: `src/config/constants.js` (if empty of live exports)

- [ ] **Step 1: Confirm each remaining export is unused**

```bash
for sym in STYLE_BATTLES MYSTERY_BOXES API_ENDPOINTS; do
  echo "== $sym =="
  grep -rn "$sym" src --include=*.js --include=*.jsx | grep -v 'config/constants.js'
done
```
Expected: no usages printed for any symbol (only their definition in constants.js, which is filtered out).

- [ ] **Step 2: Confirm nothing still imports from `constants.js`**

```bash
grep -rn "config/constants" src --include=*.js --include=*.jsx || echo "no importers — safe to delete"
```
Expected: `no importers — safe to delete`

- [ ] **Step 3: Delete the file**

```bash
git rm src/config/constants.js
```

- [ ] **Step 4: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: clean; `✓ built in …`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(data): drop dead constants and retire config/constants.js"
```

---

### Task 2.7: Move occasion presets to `src/data/occasions.ts`

`src/features/survey/configs/occasionPresets.config.js` exports `OCCASIONS` and `OCCASION_PRESETS` — pure data, no component deps. Relocate and type it.

**Files:**
- Create: `src/data/occasions.ts`
- Delete: `src/features/survey/configs/occasionPresets.config.js`
- Modify: importers (`promptEngine.js:8` and survey components)

- [ ] **Step 1: Find importers**

```bash
grep -rn "occasionPresets.config\|\bOCCASIONS\b\|OCCASION_PRESETS" src --include=*.js --include=*.jsx
```

- [ ] **Step 2: Create `src/data/occasions.ts`**

Move both exports verbatim from the old file, typing `OCCASIONS`:

```ts
import type { Occasion } from '../types';

export const OCCASIONS: Occasion[] = [
  // … paste verbatim …
];

export const OCCASION_PRESETS = {
  // … paste verbatim …
};
```

- [ ] **Step 3: Delete the old file**

```bash
git rm src/features/survey/configs/occasionPresets.config.js
```

- [ ] **Step 4: Repoint importers.** For `promptEngine.js` line 8:

```js
import { OCCASIONS } from '../data/occasions.ts';
```
Repoint survey-component importers to the correct relative path. Verify:

```bash
grep -rn "occasionPresets.config" src && echo "FIX THESE" || echo "clean"
```
Expected: `clean`

- [ ] **Step 5: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: clean; `✓ built in …`

- [ ] **Step 6: Commit**

```bash
git add src/data/occasions.ts src/features src/services/promptEngine.js
git commit -m "refactor(data): move occasion presets to data/occasions"
```

---

### Task 2.8: Move survey schemas to `src/data/surveys/`

`src/features/survey/configs/imageSurvey.config.js` and `songSurvey.config.js` are survey definitions (data) that import other data (ART_STYLES, THEMES, mad-libs). Relocate under `src/data/surveys/` so all content lives in one place.

**Files:**
- Create: `src/data/surveys/image.ts`, `src/data/surveys/song.ts`
- Delete: `src/features/survey/configs/imageSurvey.config.js`, `src/features/survey/configs/songSurvey.config.js`
- Modify: importers (the survey step components)

- [ ] **Step 1: Find importers of each config**

```bash
grep -rn "imageSurvey.config\|songSurvey.config" src --include=*.js --include=*.jsx
```

- [ ] **Step 2: Create `src/data/surveys/image.ts`**

Move the full contents of `imageSurvey.config.js` here. Update its internal imports to the new data locations (e.g. `ART_STYLES`/`THEMES` from `'../artStyles.ts'`/`'../themes.ts'`, mad-libs from `'../madlibs.ts'`). Keep all exported names (`IMAGE_SURVEY_SECTIONS`, `IMAGE_SLIDERS`, `IMAGE_DETAIL_FIELDS`) identical.

- [ ] **Step 3: Create `src/data/surveys/song.ts`**

Move the full contents of `songSurvey.config.js` here, updating internal data imports. Keep exported names identical (`SONG_SURVEY_SECTIONS`, `GENRES`, `VIBES`, `SONG_SLIDERS`, `LYRIC_MAD_LIBS`, `SONG_DETAIL_FIELDS`).

- [ ] **Step 4: Delete the old config files**

```bash
git rm src/features/survey/configs/imageSurvey.config.js src/features/survey/configs/songSurvey.config.js
```

- [ ] **Step 5: Repoint importers** (the step components) to `'../../../data/surveys/image.ts'` / `'song.ts'` (adjust depth per file). Verify:

```bash
grep -rn "survey/configs/" src && echo "FIX THESE" || echo "clean"
```
Expected: `clean` (the `configs/` directory should now be empty — remove it if so: `rmdir src/features/survey/configs` ).

- [ ] **Step 6: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: clean; `✓ built in …`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(data): move image/song survey schemas to data/surveys"
```

---

## Phase 2 wrap-up verification

- [ ] **Final orphan + import sanity check**

```bash
grep -rn "config/constants\|survey/configs\|occasionPresets.config" src && echo "STRAGGLERS — fix" || echo "no stale references"
npm run typecheck && npm run build
```
Expected: `no stale references`; typecheck clean; `✓ built in …`

After this phase, `src/data/` holds: `artStyles.ts`, `themes.ts`, `madlibs.ts`, `generation.ts`, `print.ts`, `occasions.ts`, `surveys/image.ts`, `surveys/song.ts`. `config/constants.js` is gone. Deferred to Phase 3: relocating `registry.js`, `messaging.js`, `inspirationRecipes.js`; converting `config/*` and `services/*` to `.ts`; the `ai/` service factory; component `.tsx` conversion.

---

## Self-review notes (author check)

- **Spec coverage:** Phase 0 (cruft + security + README) ✔; Phase 1 (tsconfig allowJs + types/) ✔; Phase 2 data extraction + unification + dead-data drop ✔. Spec items `copy.ts`, `productTypes.ts`, `inspiration.ts`, `prompts/`, `config/env.ts|flags.ts`, service factory, component conversion are explicitly **deferred to Phase 3** (stated in Scope note) — not gaps.
- **Type consistency:** `ArtStyle.promptInstruction`, `Theme.buildScene`, `MadLibTemplate`, `Occasion` used consistently between `types/` (Task 1.2) and `data/` (Tasks 2.1–2.8). `STYLE_INSTRUCTIONS`/`THEME_BUILDERS` retain their original shape (`Record<string, …>`) so `promptEngine.js` call sites are untouched.
- **Deviation from spec:** spec sketched `Theme.promptTemplate` (a string); reality is a function with branching/randomness, so the plan uses `Theme.buildScene(survey)` and defers template-ization. Called out in Task 2.2 and `types/content.ts`.
- **Import-extension note:** imports use explicit `.ts` extensions to match the project's existing explicit-extension `.js` import style under Vite. If the executor finds Vite rejects `.ts` in import specifiers, drop the extension (bundler resolution handles it) — verified per task by the build gate.
