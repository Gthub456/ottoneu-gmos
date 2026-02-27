export type IngestMode = "mock" | "live";

export type IngestConfig = {
  mode: IngestMode;
  ottoneuLeagueId?: string;
  ottoneuTeamId?: string;
  ottoneuCookie?: string;
  userAgent?: string;
};
