/**
 * Quadratic Bézier utility points computation for the Plank bridge hanging ropes.
 * The curve utilizes a linear horizontal sweep paired up with a smooth vertical parabolic dip.
 */

export function getBackRopePoint(t: number) {
  // Starts at (180, 390), ends at (1020, 390). Midpoint sag is (600, 480).
  const x0 = 180, y0 = 390;
  const x1 = 600, y1 = 480;
  const x2 = 1020, y2 = 390;

  const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
  const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
  return { x, y };
}

export function getFrontRopePoint(t: number) {
  // Starts at (180, 420), ends at (1020, 420). Midpoint sag is (600, 510).
  const x0 = 180, y0 = 420;
  const x1 = 600, y1 = 510;
  const x2 = 1020, y2 = 420;

  const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
  const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
  return { x, y };
}
