import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const team = await prisma.team.findFirst({ orderBy: { createdAt: "asc" } });
  if (!team) return res.status(200).json({ team: null, evaluation: null, items: [] });

  const evaluation = await prisma.evaluation.findFirst({
    where: { teamId: team.id },
    orderBy: { createdAt: "desc" },
  });
  if (!evaluation) return res.status(200).json({ team, evaluation: null, items: [] });

  const items = await prisma.evaluationItem.findMany({
    where: { evaluationId: evaluation.id },
    include: { player: true },
    orderBy: { riskAdjSurplus: "desc" },
  });

  res.status(200).json({ team, evaluation, items });
}
