# Refactor Log

### Date: 10.17.26

Tracking all changes made during the refactor of the stepping-stones app per the plan in `refactor-plan.md`.

> **Guiding principle:** Zero functional changes. No Firestore paths, localStorage keys, or storage contracts changed.

---

## Phase 1 — Name Consistency (speed-visualizer → strategizer)

### Step 1.1 — `src/router.tsx`
- Updated comment on line 14: removed `(speed-visualizer)` from `→ Strategizer (speed-visualizer) sub-app` → `→ Strategizer sub-app`

### Step 1.2 — `src/apps/strategizer/App.tsx`
- Line 429: Updated `console.warn` message — replaced `'speed-visualizer'` Firebase project reference with `'strategizer'`
- Line 936: Updated hardcoded Firebase Console URL from `/project/speed-visualizer/authentication/settings` to `/project/strategizer/authentication/settings`

---

## Phase 2 — Remove Dead Code

### Step 2.1 — `src/firebase/AuthContext.tsx`
- Removed dead-code `AuthWidget` function (lines 96–181) and its `AuthWidgetProps` interface
- Removed unused `export { AuthWidget }` named re-export (none existed, duplicate was a dead function export)
- Removed unused imports: `LogIn`, `LogOut`, `Cloud`, `ShieldAlert`, `Loader2` from `lucide-react`; `useState` from `react`

### Step 2.2 — Remove `src/apps/strategizer/firebase.ts`
- Updated `src/apps/strategizer/App.tsx` to import directly from `../../firebase/firebase` instead of `./firebase`
- Deleted `src/apps/strategizer/firebase.ts`

### Step 2.3 — Remove unused `main.tsx` files
- Confirmed all four sub-app `main.tsx` files are unused standalone artifacts (not wired into vite.config.ts)
- Deleted: `src/apps/strategizer/main.tsx`, `src/apps/plank/main.tsx`, `src/apps/expanding-edge/main.tsx`, `src/apps/life-vision/main.tsx`

---

## Phase 3 — Import Style Normalization

### Step 3.1 — Remove `.tsx`/`.ts` extensions from strategizer imports
- `src/apps/strategizer/App.tsx` — removed all `.tsx`/`.ts` extensions from local imports
- `src/apps/strategizer/components/CardItem.tsx` — `'../types.ts'` → `'../types'`
- `src/apps/strategizer/components/PaceColumn.tsx` — removed `.ts`/`.tsx` from `'../types.ts'`, `'./CardItem.tsx'`, added import for `CustomHeaderIcons`
- `src/apps/strategizer/components/StrategyColumn.tsx` — `'../types.ts'` → `'../types'`, `'./CustomHeaderIcons.tsx'` → `'./CustomHeaderIcons'`
- `src/apps/strategizer/utils/goalThreshold.ts` — `'../types.ts'` → `'../types'`

---

## Phase 4 — Type Safety Improvements

### Step 4.1 — `src/apps/strategizer/App.tsx` — `any` in catch block
- Changed `catch (e: any)` → `catch (e: unknown)` with proper type narrowing using `instanceof Error` + `'code' in e` pattern

### Step 4.2 — `(window as any).webkitAudioContext` normalization
- `src/apps/plank/App.tsx` (×3): changed to `(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext`
- `src/apps/expanding-edge/components/CosmicAudio.ts` (×1): changed to same typed cast pattern

### Step 4.3 — `useRef<any>` in ExpandingEdgeModel
- `src/apps/expanding-edge/components/ExpandingEdgeModel.tsx` line 52: changed `useRef<any>(null)` → `useRef<ReturnType<typeof setTimeout> | null>(null)`

---

## Phase 5 — Extract Data and Logic from Large Files

### Step 5.1 — Extract Plank physics/animation data
- Created `src/apps/plank/data/animals.ts` — houses `initialAnimals()`, celebration flock base data, and cloud data
- Created `src/apps/plank/data/presets.ts` — houses `ROADMAP_PRESETS` array
- Updated `src/apps/plank/App.tsx` to import from new data files

### Step 5.2 — Extract Plank audio helpers
- Created `src/apps/plank/audio/plankAudio.ts` — houses `getPlankAudio()`, `stopPlankAudio()`, `playPing()`, `playBirdSound()`, `playSplash()`, `triggerPlankChime()`
- Updated `src/apps/plank/App.tsx` to import audio functions from new module
- Updated `src/landing/LandingPage.tsx` — `stopPlankAudio` import now points to `../apps/plank/audio/plankAudio`

### Step 5.3 — Extract Strategizer CRUD helpers
- Created `src/apps/strategizer/firestoreHelpers.ts` — houses `saveExistingToFirestore()` and `saveExistingStrategyToFirestore()`
- Updated `src/apps/strategizer/App.tsx` to import from new module

### Step 5.4 — Extract Strategizer auth overlay
- Created `src/apps/strategizer/components/AuthOverlay.tsx` — standalone component for the auth/error overlay UI
- Updated `src/apps/strategizer/App.tsx` to use `<AuthOverlay>` component

---

## Phase 6 — Code Clarity Improvements

### Step 6.1 — Life Vision summary view comment
- `src/apps/life-vision/App.tsx` line 383: Added clarifying comment explaining `|| true` is intentional for print support

### Step 6.2 — `usePersistentState` export cleanup
- `src/hooks/useFirestoreSync.ts`: Removed `export` keyword from internal `usePersistentState` function; kept only `useAppState` as the public export alias

### Step 6.3 — Strategizer `handleLogout` simplification
- `src/apps/strategizer/App.tsx`: Simplified `handleLogout` to only call `signOutUser()` and `setIsGuestMode(true)`. Removed redundant `setCards()`, `setStrategyCards()`, `setActiveCategory()` calls (handled by existing `[user]` effect and collection sync hooks)

---

## Phase 7 — Verification

### Step 7.1 — Type-check & Build passes
- Ran `npm run lint` (`tsc --noEmit`) — exit code 0, zero TypeScript errors.
- Ran `npm run build` (`vite build`) — exit code 0, 2,147 modules transformed, production build succeeded in 10.82s.
- Ran test suite — all unit tests in `test/confetti.test.ts` and `test/expanding_edge_audio.test.ts` passed.

### Step 7.2 — Storage contracts and consistency verified
- Zero functional changes.
- All Firestore paths (`users/{uid}/cards`, `users/{uid}/strategyCards`, `users/{uid}/plank/current`, `users/{uid}/expandingEdge/current`, `users/{uid}/lifeVision/current`) preserved exactly.
- All localStorage keys (`strategizer_local_cards`, `strategizer_local_strategy_cards`, `plank_bridge_steps`, `expanding_edge_journey`, `life_vision_state`) preserved exactly.
- All files touched were strictly within `/home/scott/projects/stepping-stones`.
