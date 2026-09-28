# Stepping Stones — Unified App Plan

## Overview

**Stepping Stones** is a new React + TypeScript + Vite application that serves as a cool landing page and unified host for three existing sub-apps: **Strategizer** (speed-visualizer), **Plank**, and **The Expanding Edge**. It lives in `/projects/stepping-stones` with its own Git repository. The three original repositories are **not modified**.

---

## Existing App Inventory

| App | Folder | Key Tech | Unique Dependencies |
|-----|--------|----------|---------------------|
| Strategizer | `speed-visualizer/` | React 19, Vite, Tailwind v4, Motion | `firebase ^12`, `canvas-confetti`, `@types/canvas-confetti` |
| Plank | `plank/` | React 19, Vite, Tailwind v4, Motion | *(none unique)* |
| The Expanding Edge | `the-expanding-edge/` | React 19, Vite, Tailwind v4, Motion | *(none unique)* |

### Shared Dependencies (all three apps)
`react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `lucide-react`, `motion`, `@google/genai`, `express`, `dotenv`, `typescript`, `@types/node`, `autoprefixer`, `esbuild`, `tsx`, `@types/express`

### Shared Config Patterns
- All use identical `vite.config.ts` (Tailwind + React plugin, `@` alias, HMR env toggle)
- All use identical `tsconfig.json` (ES2022, bundler module resolution, react-jsx)
- All use the same `src/main.tsx` → `src/App.tsx` → components pattern
- All use Tailwind v4 with `@import "tailwindcss"` in `src/index.css`

---

## Architecture Decision: Vite Monorepo with React Router

### Approach: Single Vite App with React Router DOM

The new `stepping-stones` project will be a **single Vite + React application** with client-side routing via `react-router-dom`. Each sub-app's source code is copied into a sub-directory of `stepping-stones/src/apps/` and rendered at a dedicated route. A single `package.json` hosts all unified dependencies, eliminating duplication.

```
/projects/stepping-stones/
├── .git/                          ← new repo
├── .gitignore
├── index.html
├── package.json                   ← unified deps (no duplication)
├── tsconfig.json
├── vite.config.ts
├── plan.md                        ← this file
├── public/
│   └── plank/                     ← copied static assets from plank/public/
├── src/
│   ├── main.tsx                   ← app entry, renders <RouterProvider>
│   ├── index.css                  ← global Tailwind import + landing page styles
│   ├── router.tsx                 ← createBrowserRouter with all routes
│   ├── landing/
│   │   └── LandingPage.tsx        ← Stepping Stones homepage with 3 app buttons
│   └── apps/
│       ├── strategizer/           ← copied from speed-visualizer/src/
│       │   ├── App.tsx
│       │   ├── components/
│       │   ├── firebase.ts
│       │   ├── types.ts
│       │   └── utils/
│       ├── plank/                 ← copied from plank/src/
│       │   ├── App.tsx
│       │   ├── components/
│       │   ├── types.ts
│       │   └── utils.ts
│       └── expanding-edge/        ← copied from the-expanding-edge/src/
│           ├── App.tsx
│           ├── components/
│           └── types.ts
```

### Why This Approach?
- **Single `node_modules`** — shared deps installed once, not three times.
- **React Router** — `history.back()` / browser Back button works naturally between the landing page and sub-apps. No per-app back button needed.
- **No monorepo tooling overhead** — no Turborepo, Nx, or pnpm workspaces complexity.
- **Minimal code changes** — sub-app source is copied as-is; only import paths and routing wrappers are adjusted.
- **Tailwind v4 is global** — one CSS file, one build.

---

## Routing Map

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `LandingPage` | Stepping Stones home with three app cards |
| `/strategizer/*` | `StrategizerApp` | Wraps `apps/strategizer/App.tsx` |
| `/plank/*` | `PlankApp` | Wraps `apps/plank/App.tsx` |
| `/expanding-edge/*` | `ExpandingEdgeApp` | Wraps `apps/expanding-edge/App.tsx` |

The `/*` wildcard on sub-app routes ensures any internal navigation the sub-apps may do stays within their namespace. The browser Back button returns users to `/` from any sub-app route.

---

## Step-by-Step Implementation Plan

### Phase 1 — Scaffold the New Repository

1. `mkdir /projects/stepping-stones && cd stepping-stones`
2. `git init`
3. Create `.gitignore` (node_modules, dist, .env, *.local)
4. Create root `package.json` with name `"stepping-stones"` combining all shared + unique dependencies (see Dependency Plan below)
5. Create `tsconfig.json` (identical pattern to existing apps)
6. Create `vite.config.ts` (identical pattern + `react-router-dom` no special config needed)
7. Create `index.html` with title "Stepping Stones"

### Phase 2 — Copy Sub-App Source

8. Copy `speed-visualizer/src/` → `stepping-stones/src/apps/strategizer/`
9. Copy `plank/src/` → `stepping-stones/src/apps/plank/`
10. Copy `the-expanding-edge/src/` → `stepping-stones/src/apps/expanding-edge/`
11. Copy `plank/public/` → `stepping-stones/public/plank/` (static assets)
12. Copy `the-expanding-edge/sound/` → `stepping-stones/public/expanding-edge/sound/`
13. Copy `speed-visualizer/firebase-applet-config.json` and other Firebase config files as needed.
14. Copy `speed-visualizer/.env.example` → `stepping-stones/.env.example` (Firebase env vars)

### Phase 3 — Fix Import Paths in Sub-Apps

Each sub-app uses the `@/` alias (which resolves to the project root). After copying, update the alias in `vite.config.ts` to map `@/` to `src/` so existing `@/src/...` imports still resolve correctly. Alternatively, audit each sub-app's imports and adjust relative paths as needed.

- `apps/strategizer/`: imports `./firebase.ts`, `./types.ts`, `./utils/...` — relative paths remain valid ✓  
- `apps/plank/`: imports `./types`, `./components/...` — relative paths remain valid ✓  
- `apps/expanding-edge/`: imports `./types`, `./components/...` — relative paths remain valid ✓
- Update any `@/` absolute alias paths found within sub-app files to use relative paths.
- Update static asset references in the Plank app (images, SVGs) to use `/plank/...` public paths.
- Update static asset references in Expanding Edge (sound file) to use `/expanding-edge/sound/space.mp3`.

### Phase 4 — Remove Per-App CSS Duplication

Each sub-app has its own `src/index.css` with `@import "tailwindcss"`. Since Tailwind runs once at the root level:

- Remove the `src/index.css` files from each sub-app directory.
- Ensure the global `src/index.css` in the root has `@import "tailwindcss"` plus any global styles.
- If sub-apps have unique non-Tailwind CSS, merge it into the root `src/index.css` under namespaced comments, or inline it as component-level styles.

### Phase 5 — Build the Router

Create `src/router.tsx`:
```tsx
import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import StrategizerApp from './apps/strategizer/App';
import PlankApp from './apps/plank/App';
import ExpandingEdgeApp from './apps/expanding-edge/App';

export const router = createBrowserRouter([
  { path: '/',               element: <LandingPage /> },
  { path: '/strategizer/*',  element: <StrategizerApp /> },
  { path: '/plank/*',        element: <PlankApp /> },
  { path: '/expanding-edge/*', element: <ExpandingEdgeApp /> },
]);
```

Update `src/main.tsx`:
```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

### Phase 6 — Build the Landing Page

Create `src/landing/LandingPage.tsx` — a visually polished page featuring:
- **App name**: "Stepping Stones" with a tagline
- **Three app cards**, each with:
  - App icon / visual identifier
  - App name and short description
  - A button/link using React Router's `<Link to="/app-path">` (pushes to history, Back button works)
- **Design direction**: Cool, modern aesthetic — dark gradient background, glassmorphism cards, subtle animations using `motion` (already a shared dependency), and icons from `lucide-react`.

### Phase 7 — Handle Firebase Configuration

The Strategizer (speed-visualizer) app requires Firebase. Its config is sourced from environment variables:

- Copy `.env.example` from `speed-visualizer/` to `stepping-stones/` as the template.
- Firebase is initialized in `apps/strategizer/firebase.ts` — no changes needed there.
- Ensure `stepping-stones/.gitignore` excludes `.env`.
- Document in `README.md` that users must supply their Firebase credentials in `.env`.

### Phase 8 — Verify No `@google/genai` API Key Conflicts

All three apps reference `@google/genai`. The API key is typically set via `process.env.GEMINI_API_KEY` or an equivalent `.env` variable. Since all three apps are in the same project, a single `.env` entry covers all.

### Phase 9 — Install & Test

```bash
cd /projects/stepping-stones
npm install       # or pnpm install
npm run dev       # verify landing page loads at localhost:3000
# Navigate to each sub-app and verify it renders
# Verify browser Back button returns to landing page
npm run build     # verify clean production build
npm run lint      # TypeScript check
```

### Phase 10 — README & Documentation

Create `README.md` documenting:
- Project purpose
- Local dev setup (env vars needed for Firebase + Gemini API)
- How to run, build, and lint
- Architecture overview (single Vite app, three routed sub-apps)
- Links to original repos (read-only / source of truth for sub-apps)

---

## Unified Dependency Plan

The new `package.json` merges all three apps' dependencies, deduplicated:

### Dependencies
| Package | Version | Source |
|---------|---------|--------|
| `react` | `^19.0.1` | all |
| `react-dom` | `^19.0.1` | all |
| `react-router-dom` | `^7.x` | **new** (routing) |
| `vite` | `^6.2.3` | all |
| `@vitejs/plugin-react` | `^5.0.4` | all |
| `@tailwindcss/vite` | `^4.1.14` | all |
| `tailwindcss` | `^4.1.14` | all |
| `lucide-react` | `^0.546.0` | all |
| `motion` | `^12.23.24` | all |
| `@google/genai` | `^2.4.0` | all |
| `express` | `^4.21.2` | all |
| `dotenv` | `^17.2.3` | all |
| `firebase` | `^12.14.0` | strategizer only |
| `canvas-confetti` | `^1.9.4` | strategizer only |
| `@types/canvas-confetti` | `^1.9.0` | strategizer only |

### DevDependencies
| Package | Version | Source |
|---------|---------|--------|
| `typescript` | `~5.8.2` | all |
| `@types/node` | `^22.14.0` | all |
| `@types/express` | `^4.17.21` | all |
| `@types/react` | `^19.2.15` | strategizer |
| `@types/react-dom` | `^19.2.3` | strategizer |
| `autoprefixer` | `^10.4.21` | all |
| `esbuild` | `^0.25.0` | all |
| `tsx` | `^4.21.0` | all |
| `@firebase/eslint-plugin-security-rules` | `^0.0.2` | strategizer |

---

## File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `stepping-stones/package.json` | **Create** | Merged deps, no duplication |
| `stepping-stones/tsconfig.json` | **Create** | Identical to existing pattern |
| `stepping-stones/vite.config.ts` | **Create** | Identical to existing pattern |
| `stepping-stones/index.html` | **Create** | Title: "Stepping Stones" |
| `stepping-stones/plan.md` | **Create** | This file |
| `stepping-stones/README.md` | **Create** | Setup & architecture docs |
| `stepping-stones/.gitignore` | **Create** | Standard node/vite gitignore |
| `stepping-stones/.env.example` | **Create** | Firebase + Gemini API keys template |
| `stepping-stones/src/main.tsx` | **Create** | RouterProvider entry point |
| `stepping-stones/src/index.css` | **Create** | Global Tailwind import |
| `stepping-stones/src/router.tsx` | **Create** | All app routes |
| `stepping-stones/src/landing/LandingPage.tsx` | **Create** | Stepping Stones homepage UI |
| `stepping-stones/src/apps/strategizer/` | **Copy** from `speed-visualizer/src/` | Adjust asset paths |
| `stepping-stones/src/apps/plank/` | **Copy** from `plank/src/` | Adjust asset paths, remove index.css |
| `stepping-stones/src/apps/expanding-edge/` | **Copy** from `the-expanding-edge/src/` | Adjust asset paths, remove index.css |
| `stepping-stones/public/plank/` | **Copy** from `plank/public/` | Static assets |
| `stepping-stones/public/expanding-edge/` | **Copy** from `the-expanding-edge/sound/` | Sound assets |
| `speed-visualizer/*` | **Unchanged** | Original repo untouched |
| `plank/*` | **Unchanged** | Original repo untouched |
| `the-expanding-edge/*` | **Unchanged** | Original repo untouched |

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Sub-app CSS resets conflict globally | Audit each `index.css`; merge carefully or scope with CSS layers |
| `@/` path alias broken after copying | Audit all sub-app imports; update alias or convert to relative paths |
| Firebase `initializeApp` called multiple times if app re-renders | Keep Firebase init in a singleton module (`apps/strategizer/firebase.ts`), not in component bodies |
| Plank's `public/` asset paths break | Move to `public/plank/` and update all `<img src="...">` references accordingly |
| Expanding Edge's `space.mp3` path breaks | Move to `public/expanding-edge/sound/space.mp3` and update the reference in `CosmicAudio.ts` |
| Browser Back from a sub-app goes to a non-`/` URL | Using `<Link>` (pushState) instead of `window.location.href` ensures history stack is correct |
| React Router's `/*` causes 404 on hard refresh in production | Configure server (Express or Vite preview) to serve `index.html` for all routes |

---

## Out of Scope

- Modifying or committing to the original three repositories
- Adding auth to Plank or The Expanding Edge (only Strategizer uses Firebase auth)
- Creating a shared component library (sub-apps are self-contained)
- CI/CD pipeline (can be added later)
- Deployment configuration (can be added after local dev is confirmed working)
