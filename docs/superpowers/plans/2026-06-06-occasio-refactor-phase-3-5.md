# Occasio Refactor — Phases 3–5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the Occasio restructure — flatten to the layer-first (Option B) tree, eliminate the duplicated real/mock service selection behind one typed AI provider, convert the service + component layers to TypeScript, and close the known type/data gaps.

**Architecture:** Three sequential phases, each ending on a green `npm run typecheck` + `npm run build` and committed per task. Phase 3 is a pure structural move (no `.js`→`.ts` conversion — files keep their extension, only locations + imports change) so it is low-risk and easy to verify. Phase 4 introduces a single `services/ai/` provider factory and converts the service (logic) layer to typed `.ts`. Phase 5 converts components `.jsx`→`.tsx` and tightens the domain types against real data.

**Tech Stack:** React 19, Vite 7, TypeScript (strict, `allowJs`), Tailwind 4, Google GenAI SDK.

**Verification convention (read once):** No test runner exists. Per-task gate is `npm run typecheck` (zero errors; runs `tsc --noEmit` over `src` + `tsc -p tsconfig.node.json`) and `npm run build` (ends `✓ built`). Vite fails the build on any unresolved import, so a move with a wrong path is caught immediately. Import-extension rule (unchanged from Phases 0–2): references to `.ts` modules and the `src/types` barrel are **extensionless**; existing `.js` imports of other `.js` files keep their `.js` extension until that target is converted.

---

## Sequencing note (deviation from the original spec phasing)

The Phase 0–2 spec sketched Phase 3 as "folder reorg **+** convert services to `.ts`." Splitting those is safer:
- **Phase 3 = move only.** Files keep `.js`/`.jsx`; nothing new gets type-checked, so a large mechanical diff can't introduce type regressions. Pure path churn, verified by the build.
- **Phase 4 = AI provider factory + services→`.ts`.** Conversion to `.ts` under `strict:true` is real typing work (implicit-any, strict-null). It belongs with the service-layer cleanup, not bundled into a move.
- **Phase 5 = components→`.tsx` + type tightening.** Mechanical per-file conversion plus closing the `OccasionPreset` / `SurveySection` gaps the Phase 2 review flagged.

**Recommendation:** land Phase 3 on its own PR/commit-group first (trivially reviewable as "files moved, build green"), then 4, then 5. Phase 5's per-file conversion is a repeatable procedure (Task 5.x), not a unique design each time.

---

## Target structure (Option B, flat)

```
src/
  main.jsx  App.jsx
  styles/        index.css
  types/         (exists) content.ts survey.ts product.ts index.ts
  data/          (exists) artStyles themes madlibs generation print occasions surveys/
                 + copy.ts (from config/messaging.js)  + inspiration.ts (from config/inspirationRecipes.js)
  config/        gemini.js (was gemini.config.js)  flags.js (was mvp.config.js)  textStyles.js
  services/      (Phase 4 converts these to .ts; Phase 4 adds ai/)
  context/       ToastContext.jsx  GiftFlowContext.jsx (moved from features/gifts)
  components/
    gifts/       GiftFlowContainer GiftTypeSelector InspirationGallery registry  components/ hero/ steps/
    survey/      ChipSelect OccasionCombobox SliderBank MadLibBuilder FreeTextInputs VisionTextBox  randomize.js
    visual/      (unchanged: AmbientBackground MotionProvider ThemeContext ThemeSwitcher TiltCard confetti themes useAllowMotion)
    settings/    ModelToggle
    common/      PromptViewer RatingSlider SessionHistory
```

**Judgment calls locked here (so the implementer doesn't freelance):**
- `features/` is dissolved: `features/gifts/*` → `components/gifts/*` (same internal subtree), `features/survey/components/*` + `randomize.js` → `components/survey/*`.
- Only `GiftFlowContext` moves into `context/`. `ThemeContext`/`MotionProvider` **stay** in `components/visual/` (they are visual providers; moving them is churn without benefit). This intentionally diverges from the spec's "context/ holds all providers" sketch.
- `config/messaging.js` and `config/inspirationRecipes.js` are **content** → move to `data/copy.ts` and `data/inspiration.ts`. `gemini.config.js`/`mvp.config.js` are **runtime config** → stay in `config/`, renamed to `gemini.js`/`flags.js`. `textStyles.js` stays in `config/`.

---

# Phase 3 — Flatten to Option B (move only)

> Each task: move with `git mv`, fix every relative import that referenced the moved files (both inside the moved file and in its importers), verify, commit. Use this discovery command after each move to find stale importers: `grep -rn "<old-path-fragment>" src`.

### Task 3.1: Move content configs into the data layer

**Files:**
- `git mv src/config/messaging.js src/data/copy.ts`
- `git mv src/config/inspirationRecipes.js src/data/inspiration.ts`

- [ ] **Step 1: Move both files**

```bash
git mv src/config/messaging.js src/data/copy.ts
git mv src/config/inspirationRecipes.js src/data/inspiration.ts
```

- [ ] **Step 2: Fix imports INSIDE the moved files for their new depth**

`src/data/inspiration.ts` imports hall-of-fame images from `../assets/...` today (depth from `src/config/`). From `src/data/` the asset path is the same number of `../` — verify by reading its import lines and confirming each resolves (`ls` the resolved path). `copy.ts` has no relative imports. Update the stale `src/config/constants.js` comment reference if any remains (it was already fixed to point at `src/data/`).

- [ ] **Step 3: Repoint all importers**

```bash
grep -rn "config/messaging\|config/inspirationRecipes" src
```
For each hit, change the import path to `'.../data/copy'` or `'.../data/inspiration'` (extensionless, correct relative depth). Known importers include `src/features/gifts/registry.js` (messaging → `COPY`), `src/features/gifts/GiftTypeSelector.jsx`, `src/features/gifts/InspirationGallery.jsx`, and any hero component using `getHeroVariant`/`COPY`. Verify none remain:
```bash
grep -rn "config/messaging\|config/inspirationRecipes" src && echo "FIX" || echo "clean"
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build`
Expected: zero type errors; `✓ built`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(structure): move messaging + inspiration into data/ (copy, inspiration)"
```

### Task 3.2: Rename runtime config files

**Files:**
- `git mv src/config/gemini.config.js src/config/gemini.js`
- `git mv src/config/mvp.config.js src/config/flags.js`

- [ ] **Step 1: Rename**

```bash
git mv src/config/gemini.config.js src/config/gemini.js
git mv src/config/mvp.config.js src/config/flags.js
```

- [ ] **Step 2: Repoint importers**

```bash
grep -rn "config/gemini.config\|config/mvp.config" src
```
Change each to `'.../config/gemini.js'` / `'.../config/flags.js'` (keep `.js` extension — these are still `.js` files importing `.js`). Importers include `src/services/geminiService.js`, `src/services/messageService.js`, `src/components/settings/ModelToggle.jsx`, `src/features/gifts/steps/image/*` (ImageUploadStep, ImageGenerateStep, ImageGalleryStep), and `src/data/surveys/image.ts` (imports `MVP_CONFIG` from `'../../config/mvp.config.js'` → change to `'../../config/flags.js'`). Verify:
```bash
grep -rn "config/gemini.config\|config/mvp.config" src && echo "FIX" || echo "clean"
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build`
Expected: clean; `✓ built`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(structure): rename gemini.config.js→gemini.js, mvp.config.js→flags.js"
```

### Task 3.3: Move GiftFlowContext into context/

**Files:**
- `git mv src/features/gifts/GiftFlowContext.jsx src/context/GiftFlowContext.jsx`

- [ ] **Step 1: Move**

```bash
git mv src/features/gifts/GiftFlowContext.jsx src/context/GiftFlowContext.jsx
```

- [ ] **Step 2: Fix imports inside GiftFlowContext.jsx**

It imports `registry.js` (`GIFT_TYPES`) and possibly nothing else from siblings. From `src/context/`, `registry.js` (still at `src/features/gifts/registry.js` until Task 3.4) is `'../features/gifts/registry.js'`. Update accordingly. (Task 3.4 will move registry; this path gets fixed again there — that's fine, each task ends green.)

- [ ] **Step 3: Repoint importers of GiftFlowContext**

```bash
grep -rn "gifts/GiftFlowContext\|GiftFlowContext.jsx" src
```
Many step components and `GiftFlowContainer` import `useGiftFlow`/the provider from it. Repoint each to `'.../context/GiftFlowContext.jsx'` (correct depth). Verify:
```bash
grep -rn "features/gifts/GiftFlowContext" src && echo "FIX" || echo "clean"
```

- [ ] **Step 4: Verify + commit**

```bash
npm run typecheck && npm run build
git add -A && git commit -m "refactor(structure): move GiftFlowContext into context/"
```

### Task 3.4: Move features/gifts/* → components/gifts/*

**Files:** move the whole gift subtree (minus GiftFlowContext, already moved): `GiftFlowContainer.jsx`, `GiftTypeSelector.jsx`, `InspirationGallery.jsx`, `registry.js`, `components/CardFront.jsx`, `hero/*`, `steps/*`.

- [ ] **Step 1: Move the subtree**

```bash
mkdir -p src/components/gifts
git mv src/features/gifts/GiftFlowContainer.jsx src/components/gifts/
git mv src/features/gifts/GiftTypeSelector.jsx src/components/gifts/
git mv src/features/gifts/InspirationGallery.jsx src/components/gifts/
git mv src/features/gifts/registry.js src/components/gifts/
git mv src/features/gifts/components src/components/gifts/components
git mv src/features/gifts/hero src/components/gifts/hero
git mv src/features/gifts/steps src/components/gifts/steps
```

- [ ] **Step 2: Fix imports inside the moved files**

These files reference: data modules (`../../../data/...` etc.), types, services (`../../../../services/...`), `context/` (ToastContext, GiftFlowContext), `components/` (PromptViewer, RatingSlider — moving in 3.6), config (`gemini.js`/`flags.js`), and `survey` components (moving in 3.5). Every relative path changes because depth changed (`src/features/gifts/steps/image/` → `src/components/gifts/steps/image/` is the SAME depth from `src/`, so paths that go up to `src/` and back down are unchanged length — but the segment count to reach `src/` is identical: both are 4 levels deep). **Key insight:** `features/gifts/steps/image/X.jsx` and `components/gifts/steps/image/X.jsx` are both 4 directories below `src/`, so relative imports that traverse up to `src/<area>` keep the **same** `../` count. Imports that pointed INTO `features/` (e.g. `../../survey/...` or `../../GiftFlowContext`) are the ones that break. Recompute only those. Rely on the build to surface every break; fix until green.

- [ ] **Step 3: Repoint external importers**

```bash
grep -rn "features/gifts" src
```
`src/App.jsx` imports `GiftTypeSelector`, `InspirationGallery`, `GiftFlowContainer`, and `registry` (`GIFT_TYPES`). `src/context/GiftFlowContext.jsx` imports `registry`. Repoint all to `components/gifts/...`. Verify:
```bash
grep -rn "features/gifts" src && echo "FIX" || echo "clean"
```

- [ ] **Step 4: Verify + commit**

```bash
npm run typecheck && npm run build
git add -A && git commit -m "refactor(structure): move gifts feature into components/gifts"
```

### Task 3.5: Move features/survey/* → components/survey/*

**Files:** `components/survey/components/*` (ChipSelect, OccasionCombobox, SliderBank, MadLibBuilder, FreeTextInputs, VisionTextBox) and `randomize.js` → `src/components/survey/`.

- [ ] **Step 1: Move**

```bash
mkdir -p src/components/survey
git mv src/features/survey/components/* src/components/survey/
git mv src/features/survey/randomize.js src/components/survey/
rmdir src/features/survey/components src/features/survey 2>/dev/null || true
```

- [ ] **Step 2: Fix imports inside moved files**

Survey components import data modules (`occasions`, etc.), types, and possibly each other. Recompute paths for `src/components/survey/` depth (3 below `src/`). Build will surface breaks.

- [ ] **Step 3: Repoint importers**

```bash
grep -rn "features/survey" src
```
Importers are the survey step components (now in `components/gifts/steps/`) and `SurveyStep.jsx`. Repoint to `components/survey/...`. Verify:
```bash
grep -rn "features/survey" src && echo "FIX" || echo "clean"
ls src/features 2>&1   # expect: No such file or directory (features/ fully dissolved)
```

- [ ] **Step 4: Verify + commit**

```bash
npm run typecheck && npm run build
git add -A && git commit -m "refactor(structure): move survey feature into components/survey; remove features/"
```

### Task 3.6: Move loose components into components/common/ and css into styles/

**Files:** `PromptViewer.jsx`, `RatingSlider.jsx`, `SessionHistory.jsx` → `components/common/`; `src/index.css` → `src/styles/index.css`.

- [ ] **Step 1: Move**

```bash
mkdir -p src/components/common
git mv src/components/PromptViewer.jsx src/components/common/
git mv src/components/RatingSlider.jsx src/components/common/
git mv src/components/SessionHistory.jsx src/components/common/
mkdir -p src/styles
git mv src/index.css src/styles/index.css
```

- [ ] **Step 2: Repoint importers**

```bash
grep -rn "components/PromptViewer\|components/RatingSlider\|components/SessionHistory" src
grep -rn "index.css" src
```
Repoint component importers (e.g. step components import `PromptViewer`/`RatingSlider`; `App.jsx` imports `SessionHistory`) to `components/common/...`. Update the CSS import (in `src/main.jsx`) to `'./styles/index.css'`. Verify:
```bash
grep -rn "components/PromptViewer\|components/RatingSlider\|components/SessionHistory" src | grep -v "components/common" && echo "FIX" || echo "clean"
```

- [ ] **Step 3: Verify + commit**

```bash
npm run typecheck && npm run build
git add -A && git commit -m "refactor(structure): move shared components to common/, css to styles/"
```

### Task 3.7: Phase 3 sanity sweep

- [ ] **Step 1: Confirm no stale paths and the tree matches target**

```bash
grep -rn "features/\|config/messaging\|config/inspirationRecipes\|config/gemini.config\|config/mvp.config" src && echo "STRAGGLERS" || echo "clean"
find src -maxdepth 2 -type d | sort
npm run typecheck && npm run build
```
Expected: `clean`; directory tree matches the target structure; typecheck + build green. No commit (verification only) unless a fix was needed.

---

# Phase 4 — AI provider factory + services → TypeScript

> Goal: one typed seam for "real vs mock", and a typed service layer. Convert services to `.ts` one file at a time, fixing strict-mode errors using the `src/types` contracts. Each conversion is its own commit.

## Task 4.1: Define the AI provider interface and image providers

The 3 image step components currently each compute `settings.devMode || !isApiConfigured() ? mockService : geminiService` and call `.generateBatch` / `.analyzeImage` / `.fileToBase64` on the result, with a `service === geminiService` guard to decide whether to attach a reference image. Replace this with one factory.

**Files:**
- Create: `src/services/ai/types.ts`, `src/services/ai/imageProvider.ts`, `src/services/ai/index.ts`

- [ ] **Step 1: Create `src/services/ai/types.ts`**

```ts
import type { GenerationOutput } from '../../types';

export interface BlueprintItem {
  cardIndex: number;
  prompt: string;
  style: string;
  theme: string;
  composition: string;
  mood: string;
  madLibId: string | null;
}

export interface GenerateBatchOptions {
  modelTier?: string;
  refBase64?: string | null;
  onProgress?: (current: number, total: number) => void;
}

export interface GeneratedCard {
  imageUrl: string;
  prompt: string;
}

export interface ImageProvider {
  /** Whether this provider consumes a reference photo (real) or ignores it (mock). */
  usesReferenceImage: boolean;
  analyzeImage(file: File): Promise<string>;
  fileToBase64(file: File): Promise<string | null>;
  generateBatch(items: BlueprintItem[], options: GenerateBatchOptions): Promise<GeneratedCard[]>;
}
```

> Note: confirm the real return shapes of `geminiService.generateBatch` / `mockService.generateBatch` while implementing and adjust `GeneratedCard` to match the actual fields the gallery consumes (e.g. it may also carry `style`/`theme`). Keep the interface matching reality, not aspiration.

- [ ] **Step 2: Create `src/services/ai/imageProvider.ts`** wrapping the existing services as `ImageProvider`s

```ts
import geminiService from '../geminiService.js';
import { mockService } from '../mockService.js';
import type { ImageProvider } from './types';

export const geminiImageProvider: ImageProvider = {
  usesReferenceImage: true,
  analyzeImage: (file) => geminiService.analyzeImage(file),
  fileToBase64: (file) => geminiService.fileToBase64(file),
  generateBatch: (items, options) => geminiService.generateBatch(items, options),
};

export const mockImageProvider: ImageProvider = {
  usesReferenceImage: false,
  analyzeImage: (file) => mockService.analyzeImage(file),
  fileToBase64: async () => null,
  generateBatch: (items, options) => mockService.generateBatch(items, options),
};
```

> While implementing: verify `mockService` actually exports `analyzeImage`. If it does NOT (the grep showed only `generateBatch` confirmed), then `mockImageProvider.analyzeImage` must provide an inline stub that returns a placeholder anchor string — read `mockService.js` and match whatever the upload step expects. Report which path you took.

- [ ] **Step 3: Create `src/services/ai/index.ts`** with the factory

```ts
import { isApiConfigured } from '../../config/gemini.js';
import { geminiImageProvider, mockImageProvider } from './imageProvider';
import type { ImageProvider } from './types';

/** Pick the image provider. Mock when dev mode is on or no API key is configured. */
export function getImageProvider({ devMode }: { devMode: boolean }): ImageProvider {
  return devMode || !isApiConfigured() ? mockImageProvider : geminiImageProvider;
}

export type { ImageProvider } from './types';
```

- [ ] **Step 4: Verify + commit**

```bash
npm run typecheck && npm run build
git add src/services/ai
git commit -m "feat(ai): add typed image-provider factory (real/mock behind one seam)"
```

## Task 4.2: Adopt the factory in the 3 image step components

**Files (modify):** `src/components/gifts/steps/image/ImageUploadStep.jsx`, `ImageGenerateStep.jsx`, `ImageGalleryStep.jsx`

- [ ] **Step 1: ImageUploadStep.jsx** — replace the ternary + direct imports

Remove `import { mockService }` and `import geminiService` and the `import { isApiConfigured }` (if only used for the ternary). Add `import { getImageProvider } from '<rel>/services/ai';`. Replace `const service = settings.devMode || !isApiConfigured() ? mockService : geminiService;` with `const provider = getImageProvider({ devMode: settings.devMode });` and update the call site (`service.analyzeImage(...)` → `provider.analyzeImage(...)`).

- [ ] **Step 2: ImageGenerateStep.jsx** — same swap, plus the reference-image guard

Replace the ternary with `const provider = getImageProvider({ devMode: settings.devMode });`. The current guard `if (images?.[0]?.file && service === geminiService)` (which decides whether to compute `fileToBase64`) becomes `if (images?.[0]?.file && provider.usesReferenceImage)`. All `service.generateBatch` → `provider.generateBatch`; `geminiService.fileToBase64` → `provider.fileToBase64`.

- [ ] **Step 3: ImageGalleryStep.jsx** — same ternary swap (regenerate path uses `provider.generateBatch`).

- [ ] **Step 4: Confirm no component imports the raw services anymore**

```bash
grep -rn "mockService\|geminiService" src/components && echo "CHECK (should be none in components)" || echo "clean"
```
Expected: `clean` (raw services now only referenced inside `services/ai/`).

- [ ] **Step 5: Verify + commit**

```bash
npm run typecheck && npm run build
git add src/components/gifts/steps/image
git commit -m "refactor(ai): image steps use getImageProvider; drop duplicated real/mock ternary"
```

## Task 4.3: Unify song + message services under services/ai/

- [ ] **Step 1:** Move `songService.js` → `src/services/ai/song.ts` and `messageService.js` → `src/services/ai/message.ts` via `git mv`, fixing their internal imports (mock services, gemini config, prompt engines) for the new depth. Keep exported function names (`generateSong`, `generateSongBatch`, `generateMessageOptions`) so call sites only change the import path.

- [ ] **Step 2:** Repoint importers (`SongGenerateStep`, `MessageStep`) to `services/ai/song` / `services/ai/message`. Confirm with grep.

- [ ] **Step 3:** Verify + commit:
```bash
npm run typecheck && npm run build
git add -A && git commit -m "refactor(ai): consolidate song + message services under services/ai"
```

## Task 4.4–4.x: Convert service-layer files to `.ts` (one commit each)

For EACH of these files, in this order (leaf logic first): `promptEngine.js`, `songPromptEngine.js`, `messagePromptEngine.js`, `geminiService.js`, `mockService.js`, `mockSunoService.js`, `mockMessageService.js`, `sessionStore.js`, `cardExport.js`, `shareCard.js` — apply this repeatable procedure:

- [ ] **Procedure (per file):**
  1. `git mv <file>.js <file>.ts`.
  2. Update importers of this file to extensionless imports (drop the `.js`).
  3. Run `npm run typecheck`. Fix the strict-mode errors it surfaces **using the `src/types` contracts** (`SurveyData`, `BlueprintItem`, `GeneratedCard`, `ArtStyle`, etc.) — annotate function params/returns, type class fields, narrow nullables. Do NOT use `any` to silence errors except as a last resort with a `// TODO: tighten` comment, and report any such case.
  4. `npm run build`.
  5. Commit: `git commit -am "refactor(ts): convert <file> to TypeScript"`.
  6. If a single file produces a large/ambiguous error surface (e.g. `cardExport.ts` with canvas/jspdf types), it is acceptable to report DONE_WITH_CONCERNS and leave a focused `// TODO` rather than over-invest — flag it for follow-up.

> This is the same procedure applied N times; it is a complete instruction, not a placeholder. The controller dispatches one subagent per file.

---

# Phase 5 — Components → TSX + type tightening

## Task 5.1: Close the OccasionPreset type gap, then type OCCASION_PRESETS

**Files:** `src/types/content.ts`, `src/data/occasions.ts`

- [ ] **Step 1:** In `src/types/content.ts`, extend `OccasionPreset` to match the real data. The Phase 2 review found entries carry `suggestedMadLibFields` (e.g. `{ occasion: 'birthday', adjective: 'banging' }` / `{}`). Add:
```ts
  suggestedMadLibFields?: Record<string, string>;
```
Read `src/data/occasions.ts` to confirm there are no OTHER fields present beyond the interface; add any that exist.
- [ ] **Step 2:** Annotate the export: `export const OCCASION_PRESETS: Record<string, OccasionPreset> = { ... };`
- [ ] **Step 3:** `npm run typecheck` (zero errors) — if it errors, the interface still doesn't match the data; reconcile by widening the type to the data, not by editing data. `npm run build`.
- [ ] **Step 4:** Commit: `git commit -am "fix(types): complete OccasionPreset and type OCCASION_PRESETS"`

## Task 5.2: Reconcile SurveySection/SurveySchema with real survey data

**Files:** `src/types/survey.ts`, then `src/data/surveys/image.ts` + `song.ts`

- [ ] **Step 1:** Read the actual section objects in `src/data/surveys/image.ts` and `song.ts`. The Phase 2 review found real fields are `component`, `label`, `subtitle`, `placement`, `action`, `stateKey`, `dataKey`, `config` — not the sketched `kind`/`title`. Rewrite `SurveySection` in `src/types/survey.ts` to match the real shape exactly (make genuinely-optional fields optional). Keep `SurveySchema { id; sections: SurveySection[] }` if `id` exists in the data; otherwise drop `id` to match.
- [ ] **Step 2:** Annotate the section arrays in both survey data files (`IMAGE_SURVEY_SECTIONS: SurveySection[]`, `SONG_SURVEY_SECTIONS: SurveySection[]`).
- [ ] **Step 3:** `npm run typecheck` + `npm run build`. Reconcile mismatches by fixing the TYPE to the data.
- [ ] **Step 4:** Commit: `git commit -am "fix(types): align SurveySection with real survey schema data"`

## Task 5.3–5.x: Convert components `.jsx` → `.tsx` (repeatable procedure, one commit per file or per cohesive group)

Convert in dependency order — leaf/presentational first, then containers, then `App.jsx` last. Suggested order: `components/common/*`, `components/visual/*`, `components/survey/*`, `components/settings/*`, `components/gifts/components/*` + `hero/*`, `components/gifts/steps/**`, `components/gifts/*` containers, `context/*`, `App.jsx`, `main.jsx`.

- [ ] **Procedure (per file):**
  1. `git mv <file>.jsx <file>.tsx`.
  2. Update importers to extensionless imports.
  3. `npm run typecheck`. Fix errors: type component props with an explicit `interface Props { ... }`, type `useState`/`useReducer` generics, type event handlers. Reuse `src/types` contracts for domain objects (a `ProductType` for registry entries, `Occasion`, `SurveyData`, etc.). Avoid `any`; flag unavoidable cases with `// TODO: tighten`.
  4. `npm run build`.
  5. Commit: `git commit -am "refactor(ts): convert <file> to TSX"`.

> Same complete procedure per file — not a placeholder. The controller dispatches per file (or per small sibling group, e.g. all of `hero/`) and reviews. Expect `GiftFlowContext` (the `useReducer` with ~30 actions) and `registry` to need the most type work — type the reducer `state`/`action` against a discriminated union and the registry entries against `ProductType` extended with the React component refs.

## Task 5.last: Final sweep — enable stricter checking of converted code (optional)

- [ ] Once most components are `.tsx`, consider enabling `checkJs` only if few `.js` files remain, or leave it off. Confirm `npm run typecheck && npm run build` green and that no `.jsx` remain except any intentionally deferred. Commit any config change separately.

---

## Self-review notes (author check)

- **Spec coverage:** spec Phase 3 (folder reorg → Tasks 3.1–3.7; services→.ts → moved to Phase 4.4 with rationale), Phase 4 (service factory → 4.1–4.3) ✔, Phase 5 (component conversion → 5.3) ✔. Added 5.1/5.2 to close the type gaps the Phase 0–2 review logged. Deviation (split move from conversion; keep Theme/Motion providers in visual/) is documented in the Sequencing note and target-structure call-outs.
- **Placeholder scan:** the two repeatable procedures (4.4, 5.3) are complete per-file instructions applied N times, not "implement later" — explicitly justified. No TBDs.
- **Type consistency:** `ImageProvider`/`BlueprintItem`/`GeneratedCard`/`GenerateBatchOptions` defined in 4.1 and reused in 4.2 and the 4.4 conversions. `getImageProvider({ devMode })` signature identical across 4.1/4.2. `OccasionPreset.suggestedMadLibFields` (5.1) and the `SurveySection` rewrite (5.2) are flagged as "match the type to the data, never edit data" to avoid content drift.
- **Risk flags:** Task 3.4 relies on the depth-invariance insight (features/gifts/* and components/gifts/* are equidistant from `src/`) — the build gate catches any miscount. The 4.1 `GeneratedCard`/`mockService.analyzeImage` shapes must be verified against real code during implementation (called out inline).
