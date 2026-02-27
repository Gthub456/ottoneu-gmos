import { dollarsFromPAR } from "./valueModel";
import { riskPenalty } from "./riskModel";

export type KeepCut = "KEEP" | "CUT" | "HOLD";

export function evaluatePlayer(opts: {
  projPointsROS: number;
  replPointsROS: number;
  salary: number;
  pointsVar: number;
  playingTimeRisk: number;
}): {
  parPoints: number;
  valueDollars: number;
  rawSurplus: number;
  riskPenalty: number;
  riskAdjSurplus: number;
  keepCut: KeepCut;
} {
  const parPoints = opts.projPointsROS - opts.replPointsROS;
  const valueDollars = dollarsFromPAR(parPoints);
  const rawSurplus = round2(valueDollars - opts.salary);

  const rp = riskPenalty({
    pointsVar: opts.pointsVar,
    playingTimeRisk: opts.playingTimeRisk,
  });

  const riskAdjSurplus = round2(rawSurplus - rp);

  const keepCut: KeepCut =
    riskAdjSurplus >= 2 ? "KEEP" :
    riskAdjSurplus <= -2 ? "CUT" :
    "HOLD";

  return {
    parPoints: round2(parPoints),
    valueDollars,
    rawSurplus,
    riskPenalty: rp,
    riskAdjSurplus,
    keepCut,
  };
}

export function evaluateTrade(opts: {
  give: { riskAdjSurplus: number }[];
  get: { riskAdjSurplus: number }[];
  friction?: number; // trade tax
}): { delta: number; verdict: "ACCEPT" | "PASS" | "NEED SWEETENER" } {
  const friction = opts.friction ?? 1.0;
  const giveSum = sum(opts.give.map(x => x.riskAdjSurplus));
  const getSum = sum(opts.get.map(x => x.riskAdjSurplus));
  const delta = round2(getSum - giveSum - friction);

  const verdict =
    delta >= 2 ? "ACCEPT" :
    delta <= -1 ? "PASS" :
    "NEED SWEETENER";

  return { delta, verdict };
}

function sum(xs: number[]) { return xs.reduce((a,b)=>a+b,0); }
function round2(n: number) { return Math.round(n * 100) / 100; }
