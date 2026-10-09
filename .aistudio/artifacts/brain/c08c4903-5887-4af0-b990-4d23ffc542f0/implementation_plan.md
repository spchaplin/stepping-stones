# Unified Firestore Persistence & Auth Architecture for Stepping Stones

Expand cloud data persistence across all three Stepping Stones instruments (**Strategizer**, **Plank**, and **The Expanding Edge**) using Google Firebase Firestore and Google Authentication, eliminating data loss and enabling seamless cross-device synchronization with zero backend maintenance.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction has been confirmed based on the cost/benefit analysis:

- **Confirmed Decision 1 (Database Strategy)**: Firestore remains the database for the entire suite. We will not migrate to Cloud SQL (PostgreSQL), avoiding ongoing cloud compute charges ($10–$50+/mo), backend server maintenance, and ORM proxy plumbing.
- **Confirmed Decision 2 (Authentication Strategy)**: Unified Google Sign-In (`signInWithPopup`) shared across all three apps and the landing portal, paired with local storage fallback for guest/offline resilience.
- **Confirmed Decision 3 (Data Migration)**: Existing Strategizer pacing cards and strategy collections under `/users/{userId}/cards` and `/users/{userId}/strategyCards` are strictly preserved without disruption.

---

## 1. Overview & Core Concept

- **What It Does**: Provides real-time cloud data persistence for all three personal growth tools. Plank bridges (7 custom steps) and The Expanding Edge solar systems (life core anchor + milestone planets) will automatically sync to Firestore when signed in, while falling back gracefully to local browser storage for guest exploration.
- **Target Audience**: Individuals tracking personal goals, runners managing pacing strategies, and students/professionals planning long-term life milestones across phones, laptops, and tablets.
- **Key Value**: Never lose progress when clearing browser data or changing devices. Users log in once and immediately have their goals, pace strategies, and orbital life journeys live and synchronized everywhere.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Guest Exploration Flow**:
   - A new or signed-out user opens Plank or The Expanding Edge.
   - The app loads their local draft or default presets.
   - A quiet, non-intrusive status pill in the top header indicates: `Guest Mode (Local Only)` alongside a `Sign in with Google` button.
2. **One-Click Cloud Sync Flow**:
   - User clicks `Sign in with Google`.
   - Google popup authenticates the user.
   - If cloud data exists, it seamlessly loads with real-time listeners (`onSnapshot`). If no cloud data exists yet, their current local draft is automatically migrated to Firestore so no work is lost.
   - Status transitions to a subtle indicator: `Synced to Cloud` with user avatar/email and a `Sign Out` action.
3. **Multi-Device Live Update Flow**:
   - Updates made on one device (e.g. adding a new orbital milestone or checking off a plank) instantly reflect across any other open browser tabs or devices via Firestore's real-time document listeners.

### Visual Identity & Theme Integration

- **Design System Alignment**: Follows the established monochromatic obsidian & silver aesthetic (`#09090b` canvas, `#18181b` surface, `#27272a` borders, and `#f4f4f5` silver typography).
- **Header Auth Controls**:
  - Compact single-line user pill: clean 28px circular Google avatar or letter monogram, user email, and a quiet dropdown/button for sign out.
  - Matches the 3-zone Top Bar contract without cluttering the screen or shifting existing toolbars.
- **No Intrusive Modals**: Authentication is completely opt-in and never blocks app functionality.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Shared Core Firebase Service Module
- *Chosen Approach*: Move core Firebase configuration and auth state management from `src/apps/strategizer/firebase.ts` into a centralized `src/firebase/` directory (`src/firebase/firebase.ts` and `src/firebase/AuthContext.tsx`).
- *Why*: Prevents code duplication and avoids initializing duplicate Firebase app instances in the same browser tab.
- *Alternatives Considered*: Importing from `strategizer` into `plank` (rejected: creates brittle circular cross-app dependencies).

### Decision 2: Document Model vs. Subcollection Model for New Apps
- *Chosen Approach*:
  - **Plank**: Store user state as a single consolidated document at `/users/{userId}/plank/current`. Planks are strictly capped at 7 items with lightweight text; a single document ensures atomic saves and zero multiple-read overhead.
  - **The Expanding Edge**: Store user voyage as a single consolidated document at `/users/{userId}/expandingEdge/current`. The core anchor and array of 1–15 orbiting planets save atomically.
  - **Strategizer**: Keep existing subcollections (`/users/{userId}/cards/{cardId}` and `/users/{userId}/strategyCards/{cardId}`) unchanged to guarantee 100% backward compatibility.
- *Why*: Minimizes Firestore read/write operations (1 write per snapshot save), staying well within the free tier.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           STEPPING STONES SUITE                                  │
│                                                                                 │
│   ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────────┐  │
│   │    PLANK APP       │   │  STRATEGIZER APP   │   │  EXPANDING EDGE APP    │  │
│   │ (7-step bridge)    │   │ (Pacing splits)    │   │ (Solar orbit model)    │  │
│   └─────────┬──────────┘   └─────────┬──────────┘   └───────────┬────────────┘  │
│             │                        │                          │               │
│             └────────────────────────┼──────────────────────────┘               │
│                                      ▼                                          │
│                    ┌───────────────────────────────────┐                        │
│                    │     SHARED AUTH CONTEXT & SDK     │                        │
│                    │     (src/firebase/AuthContext)    │                        │
│                    │  • onAuthStateChanged             │                        │
│                    │  • signInWithPopup (Google)       │                        │
│                    │  • handleFirestoreError           │                        │
│                    └─────────────────┬─────────────────┘                        │
│                                      │                                          │
└──────────────────────────────────────┼──────────────────────────────────────────┘
                                       ▼
                   ┌───────────────────────────────────────┐
                   │          FIRESTORE CLOUD DB           │
                   │                                       │
                   │  /users/{userId}                      │
                   │    ├── cards/{cardId}                 │ (Strategizer splits)
                   │    ├── strategyCards/{cardId}         │ (Strategizer notes)
                   │    ├── plank/current                  │ (Plank 7-step state)
                   │    └── expandingEdge/current          │ (Expanding Edge state)
                   └───────────────────────────────────────┘
```

### Data Schema Definitions

#### 1. Plank Document (`/users/{userId}/plank/current`)
```typescript
interface PlankDocument {
  userId: string;
  planks: {
    id: string;
    text: string;
  }[];
  soundEnabled: boolean;
  updatedAt: string; // ISO-8601 string or serverTimestamp
}
```

#### 2. The Expanding Edge Document (`/users/{userId}/expandingEdge/current`)
```typescript
interface ExpandingEdgeDocument {
  userId: string;
  coreLabel: string;
  coreDescription: string;
  steps: {
    id: string;
    index: number;
    label: string;
    description: string;
    risk: string;
    skill: string;
    planetType: string;
    planetName: string;
    color: string;
    orbitSpeed: number;
    orbitRadius: number;
    unlockedAt: string;
    isCustomized: boolean;
  }[];
  isAudioEnabled: boolean;
  updatedAt: string;
}
```

### Security Rules Hardening (`firestore.rules`)
- Add strict validation functions:
  - `isValidPlankDoc(data, userId)`: verifies `planks` array length $\le 7$, each plank has `id` and `text` $\le 300$ chars, `userId` matches `request.auth.uid`.
  - `isValidExpandingEdgeDoc(data, userId)`: verifies `coreLabel` $\le 100$ chars, `coreDescription` $\le 100$ chars, `steps` array $\le 20$ planets, each step adheres to schema, `userId` matches `request.auth.uid`.
- Restrict read/write strictly to `isOwner(userId)`. Default-deny catch-all remains active.

---

## 5. Execution Steps (Post-Approval)

1. **Shared Firebase Core Setup**:
   - Establish `src/firebase/` with `firebase.ts` and `AuthContext.tsx`.
   - Expose `useAuth()` hook providing user state, login/logout functions, and sync status.
2. **Update Blueprint & Security Rules**:
   - Update `firebase-blueprint.json` with `PlankDoc` and `ExpandingEdgeDoc` entities and paths.
   - Update `firestore.rules` with validators for the new document paths.
   - Deploy updated security rules via `DeployRules` RPC.
3. **Plank App Integration**:
   - Wire `src/apps/plank/App.tsx` to `useAuth()`.
   - Add top-bar authentication widget with guest mode / cloud sync indicator.
   - Listen to `/users/{userId}/plank/current` on login; sync changes to Firestore with debounce and local fallback.
4. **Expanding Edge App Integration**:
   - Wire `src/apps/expanding-edge/App.tsx` and `ControlPanel.tsx` to `useAuth()`.
   - Place auth pill in the new top header row next to "Stepping Stones" and "Restart".
   - Listen to `/users/{userId}/expandingEdge/current` on login; sync state changes to Firestore with local fallback.
5. **Strategizer Refactor to Shared Core**:
   - Update Strategizer to consume the shared `src/firebase/` modules without modifying database paths or card schema.
6. **Verification & Quality Checks**:
   - Verify TypeScript compilation and linter.
   - Test sign-in, real-time sync, guest fallback, and multi-tab synchronization across all three instruments.
