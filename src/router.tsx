import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import { isSubAppActive, SUB_APPS, type SubAppId } from './apps/config';

// Lazy-loaded sub-app route modules
const StrategizerApp = lazy(() => import('./apps/strategizer/App'));
const PlankApp = lazy(() => import('./apps/plank/App'));
const ExpandingEdgeApp = lazy(() => import('./apps/expanding-edge/App'));
const LifeVisionApp = lazy(() => import('./apps/life-vision/App'));

/**
 * Obsidian-themed suspense fallback displayed during route transitions.
 */
function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center text-zinc-400 select-none">
      <div className="w-9 h-9 rounded-full border-2 border-zinc-800 border-t-zinc-200 animate-spin mb-4" />
      <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Loading Experience</span>
    </div>
  );
}

/**
 * Application router.
 *
 * Route map:
 *   /                  → Stepping Stones landing page
 *   /strategizer       → Strategizer sub-app
 *   /plank             → Plank sub-app
 *   /expanding-edge    → The Expanding Edge sub-app
 *   /life-vision       → Life Vision sub-app
 *
 * Unknown paths and inactive apps redirect to the landing page.
 */
const appRoutes: { id: SubAppId; Component: React.LazyExoticComponent<React.ComponentType> }[] = [
  { id: 'strategizer', Component: StrategizerApp },
  { id: 'plank', Component: PlankApp },
  { id: 'expanding-edge', Component: ExpandingEdgeApp },
  { id: 'life-vision', Component: LifeVisionApp },
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  ...appRoutes.map(({ id, Component }) => ({
    path: SUB_APPS[id].path,
    element: isSubAppActive(id) ? (
      <Suspense fallback={<RouteLoadingFallback />}>
        <Component />
      </Suspense>
    ) : (
      <Navigate to="/" replace />
    ),
  })),
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

