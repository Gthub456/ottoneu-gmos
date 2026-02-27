import { prisma } from "../db";
import { Position } from "@prisma/client";

export async function ingestMock(season: number) {
  // Ensure a default team exists
  const team = await prisma.team.upsert({
    where: { id: "team_mock_main" },
    update: {},
    create: {
      id: "team_mock_main",
      name: "Say It Ain’t So, Sho(hei)!",
      budgetCap: 400,
      leagueId: "mock",
      ottoneuTeamId: "mock",
    },
  });

  // Minimal seed of players
  const players = [
    { fgId: "20100", name: "Mookie Betts", positions: ["OF","_2B"] as Position[], salary: 52, points: 420, var: 2600, ptRisk: 0.08 },
    { fgId: "11579", name: "Shohei Ohtani", positions: ["UTIL"] as Position[], salary: 61, points: 460, var: 3600, ptRisk: 0.12 },
    { fgId: "15474", name: "Ronald Acuña Jr.", positions: ["OF"] as Position[], salary: 58, points: 440, var: 4000, ptRisk: 0.18 },
    { fgId: "13611", name: "Gerrit Cole", positions: ["SP"] as Position[], salary: 38, points: 320, var: 5200, ptRisk: 0.22 },
    { fgId: "15676", name: "Adley Rutschman", positions: ["C"] as Position[], salary: 24, points: 260, var: 1800, ptRisk: 0.10 },
    { fgId: "17085", name: "Jordan Walker", positions: ["OF","_3B"] as Position[], salary: 8, points: 190, var: 4200, ptRisk: 0.35 },
  ];

  for (const p of players) {
    const player = await prisma.player.upsert({
      where: { fgId: p.fgId },
      update: { name: p.name },
      create: { fgId: p.fgId, name: p.name },
    });

    // Positions
    for (const pos of p.positions) {
      await prisma.playerPosition.upsert({
        where: { playerId_position: { playerId: player.id, position: pos } },
        update: {},
        create: { playerId: player.id, position: pos },
      });
    }

    // Projection
    await prisma.projection.upsert({
      where: { playerId_season: { playerId: player.id, season } },
      update: { pointsROS: p.points, pointsVar: p.var, playingTimeRisk: p.ptRisk, source: "mock" },
      create: { playerId: player.id, season, pointsROS: p.points, pointsVar: p.var, playingTimeRisk: p.ptRisk, source: "mock" },
    });

    // Market (simple)
    await prisma.market.upsert({
      where: { season_playerId: { season, playerId: player.id } },
      update: { avgSalary: p.salary },
      create: { season, playerId: player.id, avgSalary: p.salary, lastSalary: p.salary, source: "mock" },
    });

    // Roster
    await prisma.rosterSlot.upsert({
      where: { id: `slot_${team.id}_${player.id}` },
      update: { salary: p.salary },
      create: { id: `slot_${team.id}_${player.id}`, teamId: team.id, playerId: player.id, salary: p.salary, isKeeper: true },
    });
  }

  // Replacement baselines (can be improved later)
  const baselines: Array<[Position, number]> = [
    ["C", 170], ["_1B", 220], ["_2B", 200], ["SS", 205], ["_3B", 210], ["OF", 190], ["UTIL", 200],
    ["SP", 250], ["RP", 120],
  ];
  for (const [position, pointsROS] of baselines) {
    await prisma.replacementBaseline.upsert({
      where: { season_position: { season, position } },
      update: { pointsROS },
      create: { season, position, pointsROS },
    });
  }

  return { teamId: team.id, season };
}
