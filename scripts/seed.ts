import { prisma } from "../lib/db";
import { ingestMock } from "../lib/ingest/mock";

async function main() {
  const season = new Date().getFullYear();
  await ingestMock(season);
  console.log("Seed complete", { season });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
