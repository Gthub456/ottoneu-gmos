import { Position } from "@prisma/client";

/**
 * Replacement baseline definition:
 * For each position, define the "replacement ROS points" level.
 * In MVP we store baselines in DB, but this helper provides safe defaults.
 */
export function defaultReplacementPoints(position: Position): number {
  switch (position) {
    case "C": return 170;
    case "_1B": return 220;
    case "_2B": return 200;
    case "SS": return 205;
    case "_3B": return 210;
    case "OF": return 190;
    case "UTIL": return 200;
    case "SP": return 250;
    case "RP": return 120;
    default: return 200;
  }
}
