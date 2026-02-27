/**
 * Convert projected points above replacement into $ value.
 * This is intentionally simple + tunable:
 *  - positive convexity for top-end scarcity
 *  - floors at 0 for negative PAR
 */
export function dollarsFromPAR(parPoints: number, opts?: {
  dollarsPerPoint?: number; // baseline slope
  alpha?: number; // convexity
}): number {
  const dollarsPerPoint = opts?.dollarsPerPoint ?? 0.25; // tune per league
  const alpha = opts?.alpha ?? 1.12;

  if (parPoints <= 0) return 0;
  // convex transform: (par^alpha) scaled
  const v = Math.pow(parPoints, alpha) * dollarsPerPoint;
  return Math.round(v * 100) / 100;
}
