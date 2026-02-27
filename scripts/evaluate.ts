import { prisma } from "../lib/db";
import { evaluateTeam } from "../lib/services/evaluateTeam";

async function main() {
  const season = new Date().getFullYear();
  const team = await prisma.team.findFirst({ orderBy: { createdAt: "asc" } });
  if (!team) throw new Error("No team found. Run seed or ingest first.");
  const evalRun = await evaluateTeam({ teamId: team.id, season });
  console.log("Evaluation run complete", { evaluationId: evalRun.evaluationId });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
