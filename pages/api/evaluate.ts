import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";
import { evaluateTeam } from "../../lib/services/evaluateTeam";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const season = new Date().getFullYear();
  const team = await prisma.team.findFirst({ orderBy: { createdAt: "asc" } });
  if (!team) return res.status(400).json({ error: "No team found. Seed/ingest first." });

  const out = await evaluateTeam({ teamId: team.id, season });
  res.status(200).json({ ok: true, ...out });
}
