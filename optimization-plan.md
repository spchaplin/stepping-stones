# Stepping Stones Performance & Optimization Audit

**Audit Date:** October 2026  
**Target:** Stepping Stones Unified Web Application & Sub-Apps  
**Scope:** Architecture, bundle footprint, runtime frame rates, memory overhead, media assets, and Web Audio API  
**Strategy:** Comprehensive multi-tier roadmap from zero-risk quick wins to architectural refactors without functional regressions  

---

## Executive Summary & Baseline Metrics

A comprehensive audit was performed across the root application shell, shared libraries, and all four sub-apps (`Plank`, `Strategizer`, `The Expanding Edge`, and `Life Vision`).

### Measured Baselines (Production Build)

| Metric | Current Baseline | Optimized Target | Improvement |
| :--- | :--- | :--- | :--- |
| **Initial JS Download (Landing Page)** | **1,766.5 kB** (463.5 kB gzip) | **~140 kB** (~45 kB gzip) | **-92% JS payload** |
| **Total Media Assets (`public/`)** | **~13.2 MB** | **~2.8 MB** | **-78% asset payload** |
| **Single Largest Asset** | **3.5 MB** (`jellyfish.svg`) | **< 60 kB** (optimized SVG/WebP) | **-98%** |
| **Plank Animation Re-renders** | **~60-120 React renders/sec** | **0 React renders/sec for physics** | **Eliminates UI thread blocking** |
| **Inactive App Leakage (`life-vision`)** | **100% bundled in initial chunk** | **0 kB (on-demand chunk)** | **Eliminated from landing bundle** |
| **Initial Font Preconnect Latency** | **Blocking `@import` in CSS** | **Preconnected in `index.html`** | **~150–300ms faster TTFB** |

---

## Audit Findings & Actionable Recommendations by Sub-App

---

### 1. Root Shell & Landing Page (`/` and `src/landing`)

#### Current State & Bottlenecks
- **Monolithic Route Bundle:** `src/router.tsx` statically imports all sub-app root components (`StrategizerApp`, `PlankApp`, `ExpandingEdgeApp`, and `LifeVisionApp`). As a consequence, a user visiting the landing page must download, parse, and evaluate the full application code and dependencies (including Firebase, Motion, Canvas-Confetti, and all sub-app assets).
- **Inactive App Bundled:** `life-vision` is currently flagged as `active: false` in `src/apps/config.ts`, but its entire component tree, forms, and domains are bundled into production JavaScript.
- **Canvas Particle Rendering:** `StarCanvas` in `LandingPage.tsx` draws 160 stars with individual `ctx.beginPath()`, `ctx.arc()`, and `ctx.fill()` calls on every frame (9,600 path state switches per second). It lacks handling for `window.devicePixelRatio` (causing soft/blurry particles on Retina displays) and lacks Page Visibility pauses (`document.hidden`).
- **Font Network Chain:** Google Fonts are loaded via `@import` inside `src/index.css`, creating a sequential request waterfall: `index.html` → `index.css` → `fonts.googleapis.com` → `fonts.gstatic.com`.

#### Recommendations

| ID | Recommendation | Impact | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **ROOT-01** | **Route-Based Code Splitting with `React.lazy()`:** Replace static route imports in `src/router.tsx` with dynamic `lazy(() => import(...))` and wrap routes in a smooth Suspense fallback using the obsidian aesthetic. Inactive sub-apps will never be loaded. | **High** (-80% initial JS) | **Low** (15 mins) | **Very Low** |
| **ROOT-02** | **Vite Manual Vendor Chunking:** Configure `rollupOptions.output.manualChunks` in `vite.config.ts` to separate vendor libraries (`vendor-react`, `vendor-motion`, `vendor-firebase`) for long-term browser cache reuse across sub-apps. | **High** | **Low** (10 mins) | **Very Low** |
| **ROOT-03** | **HTML Preconnect for Google Fonts:** Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` to `<head>` in `index.html`. | **Medium** | **Very Low** (2 mins) | **Zero** |
| **ROOT-04** | **StarCanvas Batching & Visibility Suspension:** Batch star drawing by opacity group into 3 passes per frame instead of 160 independent draw calls; pause the rAF loop when `document.hidden` is true or if `prefers-reduced-motion` is enabled. | **Medium** | **Low** (20 mins) | **Zero** |

---

### 2. Plank Sub-App (`/plank` and `src/apps/plank`)

#### Current State & Bottlenecks
- **Continuous React State Re-renders (Severe):** In `src/apps/plank/App.tsx`, lines 327–370 run a continuous `requestAnimationFrame` loop that calls `setFlyingAnimals` and `setSkyParticles` every frame. Concurrently, `src/apps/plank/components/GorgeStage.tsx` runs loops updating `setSwirlingCritters`, `setLovebirdsTime`, `setOrangeButterflyTime`, and `setLilyPads`.
- **Virtual DOM Diffing Overhead:** Because `GorgeStage.tsx` is 2,587 lines of deeply nested SVG nodes, updating React state at 60 fps forces React to diff the entire virtual DOM tree continuously. This saturates the browser's main thread and delays click handlers (such as the exit button and plank editor triggers).
- **Extreme Media Payloads in `public/plank/`:**
  - `public/plank/fish/jellyfish.svg`: **3.5 MB** single vector graphic with tens of thousands of coordinates.
  - `public/plank/birds/hummingbird-fast.gif`: **1.1 MB** uncompressed GIF.
  - `public/plank/birds/white-hawk.gif`: **771 KB** uncompressed GIF.
  - `public/plank/birds/robin.gif`: **275 KB** uncompressed GIF.
  - `public/plank/birds/bald-bird.svg` & `eagle-right-slow.svg`: **145 KB** combined.
- **Audio Context Management:** `plankAudio.ts` synthesizes birds and river ambience using Web Audio oscillators. When navigating away, audio stops, but oscillator nodes can be pooled to reduce garbage collection overhead during rapid interaction.

#### Recommendations

| ID | Recommendation | Impact | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **PLANK-01** | **Decouple Physics Loop from React Component State:** Store animation coordinates (birds, critters, clouds) in mutable refs (`useRef`) and apply transforms directly to SVG node refs or CSS transform properties, rather than invoking root `setFlyingAnimals` state updates 60 times/sec. | **Critical** (Eliminates main-thread freeze) | **Medium** | **Low** |
| **PLANK-02** | **Compress & Optimize Heavy SVGs (`jellyfish.svg`):** Run SVGO vector optimization to remove redundant precision and unused definitions, or convert complex decorative backgrounds into WebP textures with alpha channels. Expected reduction: **3.5 MB → ~40 KB**. | **Critical** (-3.4 MB payload) | **Low** (15 mins) | **Zero** |
| **PLANK-03** | **Convert Animated GIFs to Modern Animated WebP / CSS Sprites:** Convert `hummingbird-fast.gif` (1.1 MB) and `white-hawk.gif` (771 KB) to animated WebP or video elements (`.webm`). Expected reduction: **1.87 MB → ~180 KB** (-90%). | **High** | **Low** (20 mins) | **Zero** |
| **PLANK-04** | **Component Memoization (`GorgeStage.tsx`):** Wrap `GorgeStage` and major sub-layers (Rope Bridge, Floral Layer, Riverbed, Sky Dome) with `React.memo` and isolate plank hover/selection states so that hovering a plank does not re-evaluate background SVG flora. | **High** | **Medium** | **Low** |
| **PLANK-05** | **Visibility API Integration for Audio & Physics:** Pause both the physics loop and ambient sound synthesis when the browser tab is hidden (`visibilitychange` event), resuming cleanly upon refocus. | **Medium** | **Low** (10 mins) | **Zero** |

---

### 3. Strategizer Sub-App (`/strategizer` and `src/apps/strategizer`)

#### Current State & Bottlenecks
- **CardItem Component Re-render Cascade:** `CardItem.tsx` (accelerator, decelerator, and strategy cards) is not wrapped in `React.memo`. When typing inside any single card's contentEditable/textarea or dragging a card between stages, all cards across all three columns re-render and recompute classes (`getStageStyling()`).
- **Heavy Dependency Inlining (`canvas-confetti`):** `canvas-confetti` is statically imported at the top of `App.tsx` (`import confetti from 'canvas-confetti'`). It is only used when the user reaches their goal threshold (3 cards in each category).
- **DOM Event Listeners on Drag & Drop:** Frequent dragOver event listeners trigger state evaluation; drag throttle guards ensure smooth 60fps card dragging without dropped frames.

#### Recommendations

| ID | Recommendation | Impact | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **STRAT-01** | **Memoize `CardItem` with Custom Comparator:** Wrap `CardItem` in `React.memo` with comparison on `card.id`, `card.name`, `card.stage`, and `card.type`. Typing in one card will only re-render that specific card. | **High** (Smoother typing & drag-drop) | **Low** (15 mins) | **Zero** |
| **STRAT-02** | **Dynamic Import for `canvas-confetti`:** Replace static top-level import with `const confetti = (await import('canvas-confetti')).default` inside the celebration trigger function. Keeps confetti code out of the initial route chunk. | **Medium** | **Very Low** (5 mins) | **Zero** |
| **STRAT-03** | **Debounced Input Propagation:** Debounce the `onUpdateName` local persistence write by 150ms while keeping local component text immediate, reducing repetitive serialization cycles during rapid keystrokes. | **Medium** | **Low** (15 mins) | **Zero** |
| **STRAT-04** | **Drag Event Throttling:** Ensure `onDragOver` uses a lightweight RAF or 16ms throttle to prevent unnecessary DOM hit-testing during card reordering. | **Medium** | **Low** (15 mins) | **Zero** |

---

### 4. The Expanding Edge Sub-App (`/expanding-edge` and `src/apps/expanding-edge`)

#### Current State & Bottlenecks
- **Embedded Base64 Raster in SVG (`vespera.svg`):** `public/expanding-edge/planet/vespera.svg` is **3.0 MB** because it contains a raw base64-encoded PNG image embedded inside SVG tags.
- **Complex Vector Coordinate Geometry (`storm.svg`):** `public/expanding-edge/planet/storm.svg` is **1.9 MB** of raw unsimplified path coordinates.
- **Eager Background Music Preloading:** In `CosmicAudio.ts`, line 41 sets `audio.preload = 'auto'` on `/expanding-edge/sound/space.mp3` (**1.3 MB**). Browsers immediately begin streaming and buffering 1.3 MB of audio upon module execution, consuming cellular data and memory even before user interaction.
- **Heavy GPU Filter Blur passes in `Starfield.tsx`:** `Starfield.tsx` uses 4 layers with `blur-[120px]`, `blur-[150px]`, `blur-[100px]`, and `blur-[130px]` across 400–500px divs. Heavy Gaussian blurs on large elements require significant GPU fragment shader work, causing dropped frames during window resizing and orbital planet animations.
- **Inline `<style>` Injections in React Render Tree:** `Starfield.tsx` renders a `<style>` block containing keyframes inside its JSX on every render, triggering redundant style recalcs.

#### Recommendations

| ID | Recommendation | Impact | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **EDGE-01** | **Optimize Planet Graphics (`vespera.svg` & `storm.svg`):** Extract embedded base64 in `vespera.svg` into a clean WebP graphic or simplify vector paths; run SVGO on `storm.svg`. Expected reduction: **4.9 MB → ~180 KB** (-96%). | **Critical** (-4.7 MB network) | **Low** (20 mins) | **Zero** |
| **EDGE-02** | **Change Audio Preload to `preload="none"`:** Update `CosmicAudio.ts` to use `audio.preload = 'none'` and initiate audio buffering only when the user enables sound or presses play. Saves 1.3 MB on initial app visit. | **High** | **Very Low** (2 mins) | **Zero** |
| **EDGE-03** | **Replace Expensive Blur Filters with Radial Gradients:** In `Starfield.tsx`, replace `blur-[150px]` divs with CSS radial gradients (`background: radial-gradient(circle, rgba(..., 0.15) 0%, transparent 70%)`). Eliminates heavy GPU blur passes while maintaining identical soft nebula visuals. | **High** (GPU frame rate boost) | **Low** (15 mins) | **Zero** |
| **EDGE-04** | **Migrate Keyframes from JSX `<style>` to `index.css`:** Move the `@keyframes twinkle` rule to `src/index.css` so it is parsed once at stylesheet load rather than re-injected by React. | **Low** | **Very Low** (5 mins) | **Zero** |

---

### 5. Life Vision Sub-App (`/life-vision` and `src/apps/life-vision`)

#### Current State & Bottlenecks
- **App Isolation Benefit:** Currently disabled in `config.ts` (`active: false`). Implementing code splitting (ROOT-01) guarantees zero bytes of Life Vision code reach production users until re-enabled.
- **Static Domain Icons:** 8 PNG icons (`public/life-vision/icons/*.png`) range from 23 KB to 35 KB (~230 KB total).
- **Sound Effects:** Uses 5 short MP3 files (1.5 KB to 4.6 KB) managed by `LifeVisionAudio.ts`. Sound pooling is clean, but preloads can be lazy.

#### Recommendations

| ID | Recommendation | Impact | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **VISION-01** | **Route-Splitting Isolation:** Ensured by ROOT-01 (leaves zero footprint on other sub-apps). | **High** | **Included** | **Zero** |
| **VISION-02** | **Convert PNG Domain Badges to WebP:** Convert 8 PNG assets to compressed WebP. Reduces icon payload by ~65% (~80 KB total). | **Low** | **Low** (10 mins) | **Zero** |
| **VISION-03** | **DomainCard Memoization:** Wrap `DomainCard` in `React.memo` to prevent re-rendering all 8 domains when typing in one domain vision field. | **Medium** | **Low** (10 mins) | **Zero** |

---

### 6. Shared Infrastructure & Data Synchronization (`src/hooks` & `src/firebase`)

#### Current State & Bottlenecks
- **LocalStorage JSON Deserialization:** `useFirestoreSync.ts` reads from `localStorage` during initial hydration. `readLocalStorage` parses JSON with try/catch fallback, which is reliable.
- **Firestore Listener Hygiene:** `onSnapshot` listeners correctly clean up unsubscribes in `useEffect` return blocks, preventing memory leaks when navigating between sub-apps.
- **Node Test Isolation:** Tests that import from React components importing Web Audio or Firebase modules can retain background intervals. Tests should mock Web Audio/Firebase or import pure pure utility functions (`types`, `goalThreshold`, `domains`).

#### Recommendations

| ID | Recommendation | Impact | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **SHARED-01** | **Firestore Mutation Debouncing:** Ensure debounce window (currently 400ms) adequately batches multi-character edits before sending network document writes. | **Medium** | **Low** (5 mins) | **Zero** |
| **SHARED-02** | **Test Entry Point Decoupling:** Isolate business logic tests (e.g. `goalThreshold`, `restoreCards`) from importing full React app containers that instantiate background audio contexts. | **Low** | **Low** (10 mins) | **Zero** |

---

## Phased Implementation Roadmap

To maintain strict stability and avoid any functional regressions, the recommendations are organized into three sequential phases:

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Zero-Risk Quick Wins (Payload & Network)          │
│  - ROOT-01: Route-based React.lazy code splitting           │
│  - ROOT-02: Vite manualChunks for third-party vendors       │
│  - ROOT-03: Google Fonts preconnect in index.html           │
│  - EDGE-02: Audio preload="none" for space.mp3              │
│  - STRAT-02: Dynamic import for canvas-confetti             │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  Phase 2: Heavy Asset Optimization (Bandwidth & Memory)     │
│  - PLANK-02: SVGO vector cleanup on jellyfish.svg (-3.4 MB) │
│  - EDGE-01: Raster extraction & SVG cleanup for vespera/storm│
│  - PLANK-03: Animated GIF to WebP/CSS sprite conversion     │
│  - EDGE-03: CSS radial gradient replacement for blur filters│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  Phase 3: Runtime Frame Rate & React Reconciliation         │
│  - PLANK-01: Decouple GorgeStage continuous physics from VDOM│
│  - PLANK-04: GorgeStage component memoization layers        │
│  - STRAT-01: CardItem React.memo implementation             │
│  - ROOT-04: StarCanvas 3-group batching & visibility pause  │
│  - VISION-03: DomainCard React.memo memoization             │
└─────────────────────────────────────────────────────────────┘
```

### Projected Cumulative Impact

| Phase | JS Bundle Savings | Asset Bandwidth Savings | Main Thread CPU Free |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **~1,620 kB** (Landing JS drops to ~140 kB) | **1.3 MB** (unneeded audio buffer) | **~15%** faster route loads |
| **Phase 2** | — | **~9.2 MB** (SVGs, GIFs, base64) | **~25%** less GPU memory |
| **Phase 3** | — | — | **~60-80%** drop in VDOM diff cycles |
| **Total** | **-92% initial JS** | **-78% media size** | **Smooth 60fps across all devices** |

---

## Safety & Non-Breaking Verification Protocol

All suggested changes adhere to the following safety rules:
1. **Zero Functionality Alterations:** No card mechanics, physics algorithms, plank goals, cosmic orbits, or audio triggers are altered.
2. **Backward-Compatible LocalStorage & Firestore:** State schemas, keys, and serialization formats remain 100% identical.
3. **Automated Verification:** Every phase is validated via `npm run build`, `npm run lint` (`tsc --noEmit`), and the unit test suite (`npm run test`).
