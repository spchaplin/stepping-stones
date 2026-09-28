# Stepping Stones

**Stepping Stones** is a unified dashboard web application that brings together three distinct TypeScript + React applications into a single cohesive, high-performance experience:

1. **Plank** (`/plank`) — Visual stepping stone & goal builder across a living river gorge with animated wildlife and soundscapes.
2. **Strategizer** (`/strategizer`) — Pacing & race strategy dashboard with Google authentication and real-time Firebase Firestore synchronization.
3. **The Expanding Edge** (`/expanding-edge`) — Cosmic milestone tracker visualizing life goals as an expanding planetary orbit model with interactive audio.

---

## Architecture Overview

- **Unified Single-App Architecture**: Built on React 19, TypeScript, and Vite.
- **Client-Side Routing**: Powered by `react-router-dom` (`/`, `/plank/*`, `/strategizer/*`, `/expanding-edge/*`).
- **Seamless Browser History Navigation**: Sub-apps do not require in-app "Back to Navigation" buttons. Clicking the browser's Back button seamlessly returns the user from any sub-app to the Stepping Stones landing page (`/`).
- **Deduplicated Dependencies**: All shared dependencies (`react`, `react-dom`, `@tailwindcss/vite`, `tailwindcss`, `lucide-react`, `motion`, `esbuild`, etc.) are centralized in a single top-level `package.json`, saving disk space and simplifying dependency management.
- **Original Repositories Preserved**: The original projects remain completely unmodified and serve as the upstream sources of truth:
  - `../plank`
  - `../speed-visualizer` (Strategizer)
  - `../the-expanding-edge`

---

## Directory Structure

```
projects/stepping-stones/
├── index.html                   # HTML entry point
├── package.json                 # Unified deduplicated dependencies & scripts
├── tsconfig.json                # Modern TypeScript ES2023 configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS v4 & React plugin
├── plan.md                      # Complete migration and architecture plan
├── README.md                    # Project documentation
├── firebase-applet-config.json  # Firebase configuration for Strategizer
├── firestore.rules              # Firestore security rules
├── firebase-blueprint.json      # Database blueprint / schema reference
├── public/                      # Static assets
│   ├── plank/                   # Plank wildlife SVGs, GIFs, and audio
│   └── expanding-edge/          # Planet SVGs, GIFs, and space audio
├── src/
│   ├── main.tsx                 # Root entry mounting RouterProvider & global CSS
│   ├── index.css                # Global stylesheet (Tailwind v4, fonts, keyframes)
│   ├── router.tsx               # Browser router route definitions
│   ├── landing/
│   │   └── LandingPage.tsx      # Stepping Stones glassmorphism landing page
│   └── apps/
│       ├── plank/               # Plank sub-app components & state
│       ├── strategizer/         # Strategizer sub-app components & Firebase sync
│       └── expanding-edge/      # The Expanding Edge sub-app components & audio
└── test/
    └── confetti.test.ts         # Goal threshold & celebration transition tests
```

---

## Firebase Configuration (Strategizer App)

**Strategizer** is the only sub-app that connects to an external database (Firebase Firestore & Firebase Auth).

### 1. `firebase-applet-config.json`
Firebase credentials are automatically read by `src/apps/strategizer/firebase.ts` from `firebase-applet-config.json` located at the root of the project:
```json
{
  "projectId": "<YOUR_PROJECT_ID>",
  "appId": "<YOUR_APP_ID>",
  "apiKey": "<YOUR_API_KEY>",
  "authDomain": "<YOUR_AUTH_DOMAIN>",
  "firestoreDatabaseId": "<YOUR_DATABASE_ID>",
  "storageBucket": "<YOUR_STORAGE_BUCKET>",
  "messagingSenderId": "<YOUR_MESSAGING_SENDER_ID>",
  "measurementId": ""
}
```

### 2. Firestore Security Rules
Security rules for pacing and strategy card persistence are provided in [`firestore.rules`](./firestore.rules) and [`firebase-blueprint.json`](./firebase-blueprint.json).

### 3. Environment Variables (`.env`)
To configure environment variables for local development or AI Studio integration:
```bash
cp .env.example .env
```
Available environment variables:
- `GEMINI_API_KEY`: API key for Gemini API features (if applicable).
- `APP_URL`: Target deployment URL for OAuth redirects or webhooks.

> *Note: `.env` and `.env.*.local` are excluded from version control in `.gitignore`.*

---

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm or pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open `http://localhost:3000` to view the Stepping Stones landing page.

### 3. Run Unit Tests
Run the automated test suite (goal calculations, celebration threshold logic):
```bash
npm test
```

### 4. Type Checking & Linting
Verify all TypeScript types across the landing page and all three sub-apps:
```bash
npm run lint
```

### 5. Production Build
Generate the production distribution bundle in `dist/`:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```
