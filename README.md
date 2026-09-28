# Stepping Stones

Stepping Stones is a unified web application that brings together three individual React + TypeScript applications into one cohesive dashboard:

1. **Plank** (`/plank`) — Visual goal planning and stepping stone milestone builder.
2. **Strategizer** (`/strategizer`) — Pacing dashboard with real-time Firestore persistence and Google sign-in.
3. **The Expanding Edge** (`/expanding-edge`) — Cosmic life-journey roadmap and milestone visualization.

---

## Architecture & Design

- **Single Application**: Built with React 19, TypeScript, and Vite.
- **Client-Side Routing**: Powered by `react-router-dom` with deep routing support (`/`, `/plank/*`, `/strategizer/*`, `/expanding-edge/*`).
- **Browser Back Button Navigation**: Sub-apps do not need explicit "Back to Main Navigation" buttons. Clicking the browser's back button naturally pops history and returns to the Stepping Stones landing page (`/`).
- **Deduplicated Dependencies**: Shared dependencies (Tailwind CSS v4, Lucide icons, Motion, React, etc.) are installed once at the root level, avoiding duplicate `node_modules` across apps.
- **Independent Repositories Preserved**: The original three project folders (`/projects/speed-visualizer`, `/projects/plank`, and `/projects/the-expanding-edge`) remain untouched.

---

## Firebase Configuration (Strategizer App)

Among the three apps, only **Strategizer** connects to an external database (Firebase Firestore & Firebase Auth).

### 1. `firebase-applet-config.json`
Strategizer uses `firebase-applet-config.json` located at the repository root to initialize Firebase:
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
If you wish to point Strategizer to your own Firebase project, update `firebase-applet-config.json` with your credentials.

### 2. Firestore Security Rules
The required Firestore security rules are preserved in [`firestore.rules`](./firestore.rules) and [`firebase-blueprint.json`](./firebase-blueprint.json). Deploy these to your Firebase console or emulator to ensure secure access to pacing cards and strategy collections.

### 3. Environment Variables (`.env`)
Copy `.env.example` to `.env` if you want to configure additional environment variables:
```bash
cp .env.example .env
```
- `GEMINI_API_KEY`: API key for Google Gemini AI features (if enabled).
- `APP_URL`: The hosted URL for self-referential links or OAuth redirects.

> **Note**: `.env` and `.env.local` files are ignored by git in `.gitignore` to prevent credential leakage.

---

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm or pnpm

### Installation
```bash
npm install
```

### Development Server
Run the local Vite development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Type Checking & Linting
Run the TypeScript compiler to verify all types:
```bash
npm run lint
```

### Production Build
Build the optimized bundle for production:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```
