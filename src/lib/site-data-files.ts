import { promises as fs } from "fs";
import path from "path";

import {
  aggregateLeagueSeasonData,
  type LeagueSeasonDataset,
  type SeasonSnapshot,
} from "@/lib/season-data";
import type { ExportedLeague, LeagueManifest, LeagueViewData } from "@/lib/types";

const PUBLIC_DATA_DIR = path.join(process.cwd(), "public", "data", "league-data");

async function readJsonFile<T>(relativePath: string): Promise<T> {
  const fullPath = path.join(PUBLIC_DATA_DIR, relativePath);
  const contents = await fs.readFile(fullPath, "utf8");
  return JSON.parse(contents) as T;
}

export async function readManifestFromDisk(): Promise<LeagueManifest> {
  return readJsonFile<LeagueManifest>(path.join("manifests", "league-index.json"));
}

export async function buildLeagueSeasonDatasetFromDisk(
  league: ExportedLeague,
  manifest: LeagueManifest,
): Promise<LeagueSeasonDataset> {
  const raceViews = league.views
    .filter((view) => view.targetRace !== null)
    .sort((left, right) =>
      left.scrapedAt === right.scrapedAt
        ? left.label.localeCompare(right.label)
        : left.scrapedAt.localeCompare(right.scrapedAt),
    );
  const sourceViews = raceViews.length > 0 ? raceViews : league.views;

  const snapshots: SeasonSnapshot[] = await Promise.all(
    sourceViews.map(async (view) => ({
      view,
      data: await readJsonFile<LeagueViewData>(view.file),
    })),
  );

  return aggregateLeagueSeasonData(manifest, league, snapshots);
}
