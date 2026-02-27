import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const season = new Date().getFullYear();
  const players = await prisma.player.findMany({
    include: {
      positions: true,
      projections: { where: { season }, take: 1 },
      rosters: { take: 1 },
    },
    orderBy: { name: "asc" },
  });
  res.status(200).json({ season, players });
}
