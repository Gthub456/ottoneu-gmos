import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const teams = await prisma.team.count();
  const players = await prisma.player.count();
  const rosterSlots = await prisma.rosterSlot.count();
  res.status(200).json({
    ok: true,
    app: process.env.NEXT_PUBLIC_APP_NAME ?? "Ottoneu GMOS",
    mode: process.env.INGEST_MODE ?? "mock",
    counts: { teams, players, rosterSlots },
    time: new Date().toISOString(),
  });
}
