# Refactoring Prompt

### Date: 10.17.26

Examine the stepping-stones app that is a typescript/react landing page containing 4 sub-apps: stratgizer (aka speed-visualizer), the-expanding-edge, plank, and life-vision. The apps should use uniform clean-coding practices, consistent conventions, sound architecture,reusable components where practical, and be written maintainability. Unused logic, functions, and components may be removed, but don't remove or alter valid comments. Create a thorough plan to refactor the entire app and sub-apps step by step by adding your plan to this markdown file. Your most important guiding principle is: don't change any functionality or break anything (including database integration), only refactor for code and architecture and quality.

One of the sub-apps was renamed from "speed-visualizer" to "strategizer". Please update the name to be "strategizer" throughout, except do not change the names of anything related to the firestore storage, which would require reconfiguration in the firestore portal. If other aspects of the app have inconsistent naming conventions and the names or references can be updated to reflect the current implementation consistently without breaking anything, then update for consistency.

Once you complete the plan and I review it, I will give a further command to begin work. In your future work after permission is granted, you must log all your changes in a file you must create called "refactor-log.md". You will place it in the root directory.

---

# Refactoring Plan

> [!IMPORTANT]
> **Guiding principle:** Zero functional changes. No Firestore collection paths, document IDs, or localStorage keys may change (these are storage contracts). Only code quality, architecture, naming consistency, and maintainability are in scope.

---

## Codebase Audit Summary

### Architecture Overview
The app is a single Vite/React SPA with React Router v7. All four sub-apps share:
- A global `AuthProvider` wrapping the entire app (`src/firebase/AuthContext.tsx`)
- A shared `AuthWidget` component with per-app themes (`src/components/AuthWidget.tsx`)
- Shared hooks: `useFirestoreSync.ts` (persistence layer), `useAudioService.ts` (audio lifecycle)
- A shared Firebase init module (`src/firebase/firebase.ts`)
- A sub-app registry (`src/apps/config.ts`)

### Issues Found

#### 1. Stale "speed-visualizer" Name References (Non-Firestore)
The name "speed-visualizer" still appears in three source files and must be updated to "strategizer":
- **`src/router.tsx` line 14** — comment says `→ Strategizer (speed-visualizer) sub-app`
- **`src/apps/strategizer/App.tsx` line 429** — `console.warn` message references `'speed-visualizer'` Firebase project name
- **`src/apps/strategizer/App.tsx` line 936** — hardcoded Firebase Console URL contains `/project/speed-visualizer/`

> [!NOTE]
> `firebase-applet-config.json`, Firestore collection paths (`users/{uid}/cards`, `users/{uid}/strategyCards`), and localStorage keys (e.g. `strategizer_local_cards`) are **intentionally left unchanged** because they are storage identifiers tied to the Firebase project configuration.

#### 2. Duplicate AuthWidget in AuthContext
`src/firebase/AuthContext.tsx` contains a second, standalone `AuthWidget` implementation (lines 96–181) that is never imported or used elsewhere in the app. The canonical `AuthWidget` lives in `src/components/AuthWidget.tsx` and is used by all sub-apps. The duplicate in `AuthContext.tsx` is dead code.

#### 3. `any` Type Annotations
- `src/apps/strategizer/App.tsx` line 419: `} catch (e: any) {` — uses `any` instead of a typed catch
- `src/apps/plank/App.tsx` lines 436, 453, 474: `(window as any).webkitAudioContext` — repeated casts; same pattern also in `src/apps/strategizer/App.tsx`
- `src/apps/expanding-edge/components/CosmicAudio.ts` line 24: `(window as any).webkitAudioContext`
- `src/apps/expanding-edge/components/ExpandingEdgeModel.tsx` line 52: `useRef<any>`

#### 4. Strategizer App.tsx — Monolithic File (991 lines)
`src/apps/strategizer/App.tsx` is very large and mixes concerns:
- Firebase Firestore write operations (CRUD) for both `cards` and `strategyCards`
- Auth overlay/error UI rendered inline in the return
- Guest-mode logic
- Celebration/confetti logic
- Hydration gating logic
- User profile sync (`onSnapshot` on the user doc)

The Firestore CRUD logic and the `saveExistingToFirestore`/`saveExistingStrategyToFirestore` functions can be extracted to a dedicated module. The auth overlay JSX can be extracted to a component. The `fireCelebration` function is a good candidate for a custom hook.

#### 5. Plank App.tsx — Very Large File (1,290 lines)
`src/apps/plank/App.tsx` is the largest file and also mixes concerns:
- All physics animation data (large `initialAnimals()` function with 11 hardcoded bird objects, cloud data, and a large celebration flock)
- Audio helper functions (`playPing`, `playBirdSound`, `playSplash`, `triggerPlankChime`) defined inline in the component
- All ROADMAP_PRESETS data (4 presets × 7 steps)
- All physics tick logic in a single `useEffect`

These data constants and audio helpers can be extracted to separate files to slim down the component.

#### 6. Inconsistent Import Style (`.tsx` extension in imports)
Several files use explicit `.tsx` file extensions in import paths, which is unconventional in TypeScript projects (the resolver handles this automatically):
- `src/apps/strategizer/App.tsx` — imports like `'./components/Header.tsx'`, `'./types.ts'`, etc.
- `src/apps/strategizer/components/CardItem.tsx` — `'../types.ts'`
- `src/apps/strategizer/components/PaceColumn.tsx` — `'../types.ts'`, `'./CardItem.tsx'`, `'./CustomHeaderIcons.tsx'`
- `src/apps/strategizer/components/StrategyColumn.tsx` — `'../types.ts'`, `'./CustomHeaderIcons.tsx'`
- `src/apps/strategizer/utils/goalThreshold.ts` — `'../types.ts'`

These should be normalized to omit the extension (consistent with all other files in the project).

#### 7. Strategizer `handleLogout` Partially Duplicates Auth State Reset
In `App.tsx`, `handleLogout` manually resets state and calls `setIsGuestMode(true)`. The existing `useEffect` on `[user]` already handles resetting state when the user changes. This creates redundant logic that could cause race conditions or double-resets.

#### 8. `handleLogin` Duplicates Error Handling Already in `AuthContext`
`src/apps/strategizer/App.tsx`'s `handleLogin` reimplements `signInWithGoogle` error handling (including popup-closed suppression) that is already handled inside `AuthContext.signInWithGoogle`. The strategizer-specific local error state (`authError`) for the unauthorized-domain and popup-blocked cases is valid, but the popup-closed-by-user guard is redundant.

#### 9. Strategizer `firebase.ts` Re-export File
`src/apps/strategizer/firebase.ts` is a 9-line re-export barrel that only re-exports from `../../firebase/firebase`. All consumers of this file inside the strategizer can import directly from `../../firebase/firebase`, and this redundant indirection file can be removed.

#### 10. `usePersistentState` / `useAppState` Alias
`src/hooks/useFirestoreSync.ts` exports both `usePersistentState` and `useAppState = usePersistentState` (line 108). `useAppState` is the alias used everywhere. The original name `usePersistentState` is exported but not used by any consumer. The unused export adds noise.

#### 11. Inline `fallbackCopy` Textarea Hack
`src/apps/strategizer/App.tsx` contains a `fallbackCopy` function that uses the deprecated `document.execCommand('copy')` approach with a hidden `<textarea>`. This is called from `handleCopyDomain`. The primary path already uses `navigator.clipboard`. The fallback is a reasonable defensive pattern, but uses `execCommand` which is deprecated. This can be noted for future cleanup but is low risk to touch since it's a true fallback.

#### 12. Plank Audio Singleton Pattern
`src/apps/plank/App.tsx` exposes `getPlankAudio()` and `stopPlankAudio()` as module-level singletons. These are imported in `LandingPage.tsx` to stop the audio when navigating away. This cross-module coupling is necessary given the current architecture, but is worth noting. No changes needed here—it works correctly.

#### 13. `AuthContext.tsx` — `AuthWidget` Export Inconsistency
`AuthContext.tsx` exports both a dead-code `AuthWidget` function *and* a named re-export `export { AuthWidget }` at the bottom, which could cause import confusion. Once the dead code is removed, this is resolved.

#### 14. Life Vision Summary View Logic Bug (Non-Breaking)
In `src/apps/life-vision/App.tsx` line 383: `{(viewMode === 'summary' || true) && ...}` — the `|| true` condition means the summary view block is **always rendered** (just hidden via CSS). This is intentional for print support (the summary needs to be in the DOM for `window.print()`). It's not a bug but the condition reads confusingly. A comment clarifying this is appropriate.

#### 15. Strategizer `main.tsx` Unused Entry Point
`src/apps/strategizer/main.tsx` is a standalone entry point (renders `<App />` in `StrictMode` without `AuthProvider` or `RouterProvider`). This appears to be a legacy artifact from when the sub-apps were standalone apps. It's not wired into the Vite config and is not reachable in production. It can be removed.

> [!NOTE]
> The other `main.tsx` files (`src/apps/plank/main.tsx`, `src/apps/expanding-edge/main.tsx`, `src/apps/life-vision/main.tsx`) should be checked and removed if they are also unused artifacts.

---

## Step-by-Step Refactoring Plan

### Phase 1 — Name Consistency (speed-visualizer → strategizer)

**Step 1.1 — `src/router.tsx`**
Update the comment on line 14 from:
```
*   /strategizer       → Strategizer (speed-visualizer) sub-app
```
to:
```
*   /strategizer       → Strategizer sub-app
```

**Step 1.2 — `src/apps/strategizer/App.tsx` (two occurrences)**
- Line 429: Update `console.warn` message — replace `'speed-visualizer'` Firebase project name reference with `'strategizer'` (the app name, not the Firestore project ID, which stays).
- Line 936: Update the hardcoded Firebase Console URL in the JSX link from `/project/speed-visualizer/authentication/settings` to `/project/strategizer/authentication/settings`.

> [!NOTE]
> The Firebase project ID in `firebase-applet-config.json` is `"speed-visualizer"` and **must not change**. The console URL in App.tsx is a user-facing convenience link; updating it to match the current project name in context is acceptable and does not affect any Firebase API calls.

---

### Phase 2 — Remove Dead Code

**Step 2.1 — Remove duplicate `AuthWidget` from `src/firebase/AuthContext.tsx`**
Delete the standalone `AuthWidget` function (lines 96–181) and its accompanying `AuthWidgetProps` interface. Also remove the unused named re-export `export { AuthWidget }` at the bottom of the file. The `useAuth` hook and `AuthProvider` remain untouched.

Remove unused imports from `AuthContext.tsx` that were only used by the deleted widget:
- `LogIn`, `LogOut`, `Cloud`, `ShieldAlert`, `Loader2` from `lucide-react`
- `useState` from `react` (if no longer used after removal)

> [!CAUTION]
> Before removing, verify no file imports `AuthWidget` from `AuthContext.tsx`. The codebase uses `src/components/AuthWidget.tsx` (confirmed by audit). Safe to remove.

**Step 2.2 — Remove `src/apps/strategizer/firebase.ts`**
This 9-line re-export file is pure indirection. Update the single consumer (`src/apps/strategizer/App.tsx`) to import directly from `../../firebase/firebase`. Then delete `src/apps/strategizer/firebase.ts`.

**Step 2.3 — Audit and remove unused `main.tsx` files**
Check `src/apps/strategizer/main.tsx`, `src/apps/plank/main.tsx`, `src/apps/expanding-edge/main.tsx`, and `src/apps/life-vision/main.tsx`. Verify none are referenced in `vite.config.ts` or any other build config. Remove all that are unused standalone entry artifacts.

---

### Phase 3 — Import Style Normalization

**Step 3.1 — Remove `.tsx`/`.ts` extensions from imports in strategizer files**
Normalize all imports across the strategizer sub-app to omit file extensions (matching the style used throughout the rest of the codebase):

Files to update:
- `src/apps/strategizer/App.tsx` — remove `.tsx` and `.ts` from all local imports
- `src/apps/strategizer/components/CardItem.tsx` — `'../types.ts'` → `'../types'`
- `src/apps/strategizer/components/PaceColumn.tsx` — `'../types.ts'`, `'./CardItem.tsx'`, `'./CustomHeaderIcons.tsx'`
- `src/apps/strategizer/components/StrategyColumn.tsx` — `'../types.ts'`, `'./CustomHeaderIcons.tsx'`
- `src/apps/strategizer/utils/goalThreshold.ts` — `'../types.ts'` → `'../types'`

---

### Phase 4 — Type Safety Improvements

**Step 4.1 — Remove `any` type in Strategizer auth error handler**
In `src/apps/strategizer/App.tsx`, change:
```ts
} catch (e: any) {
```
to use `unknown` and add proper type narrowing:
```ts
} catch (e: unknown) {
  const code = e instanceof Error && 'code' in e ? (e as { code: string }).code : '';
  const message = e instanceof Error ? e.message : '';
  ...
```

**Step 4.2 — Define a shared `WebkitAudioContext` type helper**
The pattern `(window as any).webkitAudioContext` appears in:
- `src/apps/plank/App.tsx` (×3)
- `src/apps/strategizer/App.tsx` (×2)

`src/apps/expanding-edge/components/CosmicAudio.ts` already uses `(window as any).webkitAudioContext` but only once.

`src/apps/life-vision/components/LifeVisionAudio.ts` uses the clean pattern:
```ts
(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
```

Normalize all occurrences in Plank and Strategizer to use this same typed cast pattern, matching the existing Life Vision audio approach.

**Step 4.3 — Fix `useRef<any>` in ExpandingEdgeModel**
In `src/apps/expanding-edge/components/ExpandingEdgeModel.tsx` line 52:
```ts
const hoverTimeoutRef = useRef<any>(null);
```
Change to:
```ts
const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

---

### Phase 5 — Extract Data and Logic from Large Files

**Step 5.1 — Extract Plank physics/animation data**
Create `src/apps/plank/data/animals.ts` to house:
- The `initialAnimals()` function and all its hardcoded bird/cloud data
- The celebration flock data array (currently defined inline in the `celebrationActive` effect)

Create `src/apps/plank/data/presets.ts` to house:
- The `ROADMAP_PRESETS` array

`App.tsx` imports these from the new data files. No functional change.

**Step 5.2 — Extract Plank audio helpers**
Create `src/apps/plank/audio/plankAudio.ts` to house:
- `getPlankAudio()` and `stopPlankAudio()` (currently exported from `App.tsx`, must remain exported for `LandingPage.tsx` to use)
- `playPing()`, `playBirdSound()`, `playSplash()`, `triggerPlankChime()` (currently inline in the component)

Update `src/landing/LandingPage.tsx` import of `stopPlankAudio` to point to the new module. `App.tsx` imports the audio functions from the new module.

**Step 5.3 — Extract Strategizer CRUD helpers**
Create `src/apps/strategizer/firestoreHelpers.ts` to house the two async "seed" functions currently in `App.tsx`:
- `saveExistingToFirestore(userId, cards)` 
- `saveExistingStrategyToFirestore(userId, strategyCards)`

These are standalone async functions with no component state dependencies; they accept args and call Firestore. Moving them to a separate module makes them independently testable and slims down `App.tsx`.

**Step 5.4 — Extract Strategizer auth overlay to a component**
Extract the large inline auth/error overlay JSX (lines 870–986 in `App.tsx`) into a new component:
`src/apps/strategizer/components/AuthOverlay.tsx`

Props:
```ts
interface AuthOverlayProps {
  authError: { code: string; message: string; domain?: string } | null;
  copiedDomain: boolean;
  onLogin: () => void;
  onContinueAsGuest: () => void;
  onCopyDomain: (domain: string) => void;
}
```

This component renders conditionally in `App.tsx` via `{!user && !authLoading && !isGuestMode && <AuthOverlay ... />}`.

---

### Phase 6 — Code Clarity Improvements

**Step 6.1 — Add clarifying comment to Life Vision summary view condition**
In `src/apps/life-vision/App.tsx` line 383, the condition `(viewMode === 'summary' || true)` always evaluates to true. Add a comment:
```ts
{/* Always rendered (hidden via CSS in card mode) so window.print() captures the summary */}
{(viewMode === 'summary' || true) && (
```

**Step 6.2 — Remove `usePersistentState` re-export noise**
In `src/hooks/useFirestoreSync.ts`, `usePersistentState` is exported as a name but all consumers use `useAppState`. Remove the `usePersistentState` function name from the public export (keep only the internal function definition and the `useAppState = usePersistentState` alias export). This makes the public API of the module clearer.

> [!NOTE]
> If `usePersistentState` is not used by any external consumer (confirmed by audit — no file imports it), this is safe. If it turns out to be imported anywhere, keep it and skip this step.

**Step 6.3 — Strategizer `handleLogout` cleanup**
The `handleLogout` in `App.tsx` calls `setCards(...)`, `setStrategyCards(...)`, `setActiveCategory('faster')`, and `setIsGuestMode(true)` after `signOutUser()`. The existing `useEffect(() => { ... }, [user])` already resets `cardsInitialized`, `strategyInitialized`, `isHydrated`, and similar flags when `user` changes to null.

To avoid double-resetting, simplify `handleLogout` to only call `signOutUser()` and `setIsGuestMode(true)`. The `[user]` effect will handle the rest. Verify behavior is identical (the `useFirestoreCollectionSync` hooks also react to `uid` change and will reset).

---

### Phase 7 — Final Review and Verification

**Step 7.1 — Type-check pass**
Run `npm run lint` (which runs `tsc --noEmit`) to confirm zero TypeScript errors after all changes.

**Step 7.2 — Smoke test all routes**
Manually navigate to `/`, `/plank`, `/strategizer`, `/expanding-edge`, and `/life-vision` to confirm all apps load and behave correctly, auth flows work, and Firestore sync still functions.

**Step 7.3 — Verify Firestore storage contracts**
Confirm that no Firestore paths, document IDs, or localStorage keys were changed:
- `users/{uid}/cards` — Strategizer pace cards ✓
- `users/{uid}/strategyCards` — Strategizer strategy cards ✓
- `users/{uid}/plank/current` — Plank planks ✓
- `users/{uid}/expandingEdge/current` — Expanding Edge journey ✓
- `users/{uid}/lifeVision/current` — Life Vision data ✓
- `strategizer_local_cards`, `strategizer_local_strategy_cards`, `plank_bridge_steps`, `expanding_edge_journey`, `life_vision_state` — localStorage keys ✓

---

## Summary Table

| Phase | Scope | Files Affected | Risk |
|---|---|---|---|
| 1 — Name consistency | `speed-visualizer` → `strategizer` | 2 files | Low |
| 2 — Remove dead code | Duplicate widget, re-export barrel, unused mains | 3–6 files | Low |
| 3 — Import normalization | Remove `.tsx`/`.ts` extensions | 5 files | Very Low |
| 4 — Type safety | Eliminate `any`, improve typing | 4 files | Low |
| 5 — Extract data/logic | Slim down large App files | 4–5 new files, 3 modified | Medium |
| 6 — Clarity improvements | Comments, export cleanup, logout simplification | 3 files | Low |
| 7 — Verification | Build, type-check, smoke test | — | — |
