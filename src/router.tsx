import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import StrategizerApp from './apps/strategizer/App';
import PlankApp from './apps/plank/App';
import ExpandingEdgeApp from './apps/expanding-edge/App';
import LifeVisionApp from './apps/life-vision/App';
import { isSubAppActive, SUB_APPS, type SubAppId } from './apps/config';

/**
 * Application router.
 *
 * Route map:
 *   /                  → Stepping Stones landing page
 *   /strategizer       → Strategizer (speed-visualizer) sub-app
 *   /plank             → Plank sub-app
 *   /expanding-edge    → The Expanding Edge sub-app
 *   /life-vision       → Life Vision sub-app
 *
 * Unknown paths and inactive apps redirect to the landing page.
 */
const appRoutes: { id: SubAppId; Component: () => React.JSX.Element }[] = [
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
    element: isSubAppActive(id) ? <Component /> : <Navigate to="/" replace />,
  })),
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
