import { prisma } from "../db";
import { Position } from "@prisma/client";
import { evaluatePlayer } from "../engines/decisionEngines";
import { defaultReplacementPoints } from "../engines/replacement";

export async function evaluateTeam(opts: { teamId: string; season: number }) {
  const runId = `run_${Date.now()}`;

  const roster = await prisma.rosterSlot.findMany({
    where: { teamId: opts.teamId },
    include: {
      player: {
        include: {
          positions: true,
          projections: { where: { season: opts.season }, take: 1 },
        },
      },
    },
  });

  const baselines = await prisma.replacementBaseline.findMany({ where: { season: opts.season } });
  const baselineMap = new Map<string, number>();
  for (const b of baselines) baselineMap.set(b.position, b.pointsROS);

  const items = [];
  let totalSalary = 0;
  let totalPoints = 0;
  let totalSurplus = 0;
  let riskAdjSurplus = 0;

  for (const slot of roster) {
    const proj = slot.player.projections[0];
    const pos = pickPrimaryPosition(slot.player.positions.map(p => p.position));
    const projPointsROS = proj?.pointsROS ?? 0;
    const pointsVar = proj?.pointsVar ?? 2500;
    const playingTimeRisk = proj?.playingTimeRisk ?? 0.25;

    const replPointsROS = baselineMap.get(pos) ?? defaultReplacementPoints(pos);

    const evald = evaluatePlayer({
      projPointsROS,
      replPointsROS,
      salary: slot.salary,
      pointsVar,
      playingTimeRisk,
    });

    totalSalary += slot.salary;
    totalPoints += projPointsROS;
    totalSurplus += evald.rawSurplus;
    riskAdjSurplus += evald.riskAdjSurplus;

    items.push({
      playerId: slot.playerId,
      salary: slot.salary,
      position: pos,
      projPointsROS,
      replPointsROS,
      rawSurplus: evald.rawSurplus,
      riskPenalty: evald.riskPenalty,
      riskAdjSurplus: evald.riskAdjSurplus,
      keepCut: evald.keepCut,
    });
  }

  const evaluation = await prisma.evaluation.create({
    data: {
      teamId: opts.teamId,
      season: opts.season,
      runId,
      totalSalary: round2(totalSalary),
      totalPoints: round2(totalPoints),
      totalSurplus: round2(totalSurplus),
      riskAdjSurplus: round2(riskAdjSurplus),
      items: { create: items },
    },
  });

  return { evaluationId: evaluation.id, runId };
}

function pickPrimaryPosition(positions: Position[]): Position {
  const priority: Position[] = ["C","SS","_2B","_3B","_1B","OF","UTIL","SP","RP"];
  for (const p of priority) if (positions.includes(p)) return p;
  return "UTIL";
}
function round2(n: number) { return Math.round(n * 100) / 100; }
