import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import StrategizerApp from './apps/strategizer/App';
import PlankApp from './apps/plank/App';
import ExpandingEdgeApp from './apps/expanding-edge/App';
import LifeVisionApp from './apps/life-vision/App';

/**
 * Application router.
 *
 * Route map:
 *   /                  → Stepping Stones landing page
 *   /strategizer/*     → Strategizer (speed-visualizer) sub-app
 *   /plank/*           → Plank sub-app
 *   /expanding-edge/*  → The Expanding Edge sub-app
 *   /life-vision/*     → Life Vision sub-app
 *
 * The /* wildcard on sub-app routes lets each app handle its own
 * internal navigation (if any) without a 404. The browser Back
 * button returns users to "/" from any sub-app route because
 * <Link> in LandingPage uses history.pushState.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/strategizer/*',
    element: <StrategizerApp />,
  },
  {
    path: '/plank/*',
    element: <PlankApp />,
  },
  {
    path: '/expanding-edge/*',
    element: <ExpandingEdgeApp />,
  },
  {
    path: '/life-vision/*',
    element: <LifeVisionApp />,
  },
]);

