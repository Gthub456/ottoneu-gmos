/**
 * LIVE INGEST NOTE
 * Ottoneu/FanGraphs authentication is typically cookie-based and may change.
 * This file provides a minimal adapter scaffold (fetch + parse).
 * You will likely need to tailor selectors/endpoints to your league pages.
 */
import { prisma } from "../db";
import * as cheerio from "cheerio";
import { IngestConfig } from "./types";
import { Position } from "@prisma/client";

type FetchOpts = { cookie: string; userAgent?: string };

async function fetchHtml(url: string, opts: FetchOpts): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "cookie": opts.cookie,
      "user-agent": opts.userAgent ?? "OttoneuGMOS/0.1",
      "accept": "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

// You must map Ottoneu position strings to our enum.
function mapPos(pos: string): Position | null {
  const p = pos.trim().toUpperCase();
  if (p === "C") return "C";
  if (p === "1B") return "_1B";
  if (p === "2B") return "_2B";
  if (p === "SS") return "SS";
  if (p === "3B") return "_3B";
  if (p === "OF") return "OF";
  if (p === "UTIL") return "UTIL";
  if (p === "SP") return "SP";
  if (p === "RP") return "RP";
  return null;
}

export async function ingestLive(config: IngestConfig, season: number) {
  if (!config.ottoneuLeagueId || !config.ottoneuTeamId || !config.ottoneuCookie) {
    throw new Error("Live ingest requires OTTONEU_LEAGUE_ID, OTTONEU_TEAM_ID, OTTONEU_COOKIE");
  }

  // Example URLs (you will likely need to adjust)
  const rosterUrl = `https://ottoneu.fangraphs.com/${config.ottoneuLeagueId}/roster?team=${config.ottoneuTeamId}`;

  const html = await fetchHtml(rosterUrl, { cookie: config.ottoneuCookie, userAgent: config.userAgent });
  const $ = cheerio.load(html);

  // Create/Update team
  const team = await prisma.team.upsert({
    where: { ottoneuTeamId: config.ottoneuTeamId },
    update: { leagueId: config.ottoneuLeagueId },
    create: { name: `Ottoneu Team ${config.ottoneuTeamId}`, leagueId: config.ottoneuLeagueId, ottoneuTeamId: config.ottoneuTeamId, budgetCap: 400 },
  });

  // Parse roster table (placeholder selectors)
  const rows = $("table.roster tbody tr");
  if (!rows.length) {
    throw new Error("Could not find roster rows. Update selectors in lib/ingest/live.ts");
  }

  for (const el of rows.toArray()) {
    const row = $(el);
    const name = row.find("td.player a").text().trim();
    const fgId = row.find("td.player a").attr("data-fg-id")?.trim() || null;
    const salaryText = row.find("td.salary").text().replace(/[^0-9.]/g, "");
    const salary = Number(salaryText || "0");
    const posText = row.find("td.position").text().trim();
    const pos = mapPos(posText) ?? "UTIL";

    if (!name) continue;

    const player = await prisma.player.upsert({
      where: fgId ? { fgId } : { id: `live_${team.id}_${name}` },
      update: { name },
      create: { fgId, name },
    });

    await prisma.playerPosition.upsert({
      where: { playerId_position: { playerId: player.id, position: pos } },
      update: {},
      create: { playerId: player.id, position: pos },
    });

    await prisma.rosterSlot.upsert({
      where: { id: `slot_${team.id}_${player.id}` },
      update: { salary },
      create: { id: `slot_${team.id}_${player.id}`, teamId: team.id, playerId: player.id, salary, isKeeper: true },
    });
  }

  // Projections/market ingestion would be separate (FanGraphs exports, Ottoneu pages, etc.)
  // For now we leave placeholders.

  return { teamId: team.id, season };
}
