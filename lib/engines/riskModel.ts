/**
 * Risk penalty: combine variance proxy + playing time risk.
 * - pointsVar is a variance-like measure (higher = more volatile)
 * - playingTimeRisk is 0..1 (higher = more risk)
 */
export function riskPenalty(opts: {
  pointsVar: number;
  playingTimeRisk: number;
  riskAversion?: number; // 0.0..1.0+
}): number {
  const ra = opts.riskAversion ?? 0.55;
  const vol = Math.sqrt(Math.max(opts.pointsVar, 0));
  const pt = Math.min(Math.max(opts.playingTimeRisk, 0), 1);
  // Penalty in "surplus dollars" units; tune constants
  const penalty = ra * (0.12 * vol + 3.5 * pt);
  return Math.round(penalty * 100) / 100;
}
