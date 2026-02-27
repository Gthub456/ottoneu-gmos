import { IngestConfig } from "./types";
import { ingestMock } from "./mock";
import { ingestLive } from "./live";

export async function ingest(config: IngestConfig, season: number) {
  if (config.mode === "mock") return ingestMock(season);
  return ingestLive(config, season);
}
