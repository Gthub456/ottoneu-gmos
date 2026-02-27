import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";
import { ingest } from "../../lib/ingest";
import { IngestConfig } from "../../lib/ingest/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const season = new Date().getFullYear();
  const config: IngestConfig = {
    mode: (process.env.INGEST_MODE as any) ?? "mock",
    ottoneuLeagueId: process.env.OTTONEU_LEAGUE_ID || undefined,
    ottoneuTeamId: process.env.OTTONEU_TEAM_ID || undefined,
    ottoneuCookie: process.env.OTTONEU_COOKIE || undefined,
    userAgent: process.env.USER_AGENT || undefined,
  };

  const result = await ingest(config, season);
  res.status(200).json({ ok: true, ...result });
}
