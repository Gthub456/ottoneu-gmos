import { prisma } from "../lib/db";
import { ingest } from "../lib/ingest";
import { IngestConfig } from "../lib/ingest/types";

async function main() {
  const season = new Date().getFullYear();
  const config: IngestConfig = {
    mode: (process.env.INGEST_MODE as any) ?? "mock",
    ottoneuLeagueId: process.env.OTTONEU_LEAGUE_ID || undefined,
    ottoneuTeamId: process.env.OTTONEU_TEAM_ID || undefined,
    ottoneuCookie: process.env.OTTONEU_COOKIE || undefined,
    userAgent: process.env.USER_AGENT || undefined,
  };

  const result = await ingest(config, season);
  console.log("Ingest complete", result);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
