import {
  loadLeagueManifest,
  loadLeagueView,
  resolveLeague,
} from "@/lib/league-data";
import type {
  ExportedLeague,
  LeagueManifest,
  LeagueViewData,
  LeagueViewReference,
  TeamEntry,
} from "@/lib/types";

export interface SeasonSnapshot {
  view: LeagueViewReference;
  data: LeagueViewData;
}

export interface TeamDelta {
  addedDrivers: string[];
  removedDrivers: string[];
  addedConstructors: string[];
  removedConstructors: string[];
  rankDelta: number | null;
  pointsDelta: number | null;
}

export interface TeamHistoryEntry {
  viewKey: string;
  viewLabel: string;
  targetRace: string | null;
  scrapedAt: string;
  rank: number;
  totalPoints: number | null;
  team: TeamEntry;
  delta: TeamDelta | null;
}

export interface TeamSeasonIdentity {
  key: string;
  routeId: string;
  manager: string;
  teamName: string;
  socialId: number | null;
  managerTeamNumber: number | null;
  managerTeamCount: number | null;
  managerTeamLabel: string | null;
}

export interface TeamSeasonHistory {
  identity: TeamSeasonIdentity;
  entries: TeamHistoryEntry[];
}

export interface LeagueSeasonDataset {
  manifest: LeagueManifest;
  league: ExportedLeague;
  snapshots: SeasonSnapshot[];
  teams: TeamSeasonHistory[];
}

function normalizeName(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getTeamSlotLabel(team: TeamEntry): string | null {
  if (team.managerTeamLabel && /^T\d+$/i.test(team.managerTeamLabel)) {
    return team.managerTeamLabel.toUpperCase();
  }

  if (
    typeof team.managerTeamNumber === "number" &&
    Number.isFinite(team.managerTeamNumber) &&
    team.managerTeamNumber > 0
  ) {
    return `T${team.managerTeamNumber}`;
  }

  if (team.detailTeamName && /^T\d+$/i.test(team.detailTeamName.trim())) {
    return team.detailTeamName.trim().toUpperCase();
  }

  if (team.teamName && /^T\d+$/i.test(team.teamName.trim())) {
    return team.teamName.trim().toUpperCase();
  }

  return null;
}

export function buildTeamIdentityKey(team: TeamEntry): string {
  const slotLabel = getTeamSlotLabel(team);

  if (typeof team.socialId === "number" && team.socialId > 0 && slotLabel) {
    return `social-${team.socialId}-${slotLabel.toLowerCase()}`;
  }

  if (
    typeof team.socialId === "number" &&
    team.socialId > 0 &&
    typeof team.managerTeamNumber === "number" &&
    team.managerTeamNumber > 0
  ) {
    return `social-${team.socialId}-t${team.managerTeamNumber}`;
  }

  if (typeof team.socialId === "number" && team.socialId > 0) {
    return `social-${team.socialId}-${slugify(team.teamName)}`;
  }

  return `fallback-${slugify(team.manager)}-${slugify(team.teamName)}`;
}

export function buildTeamRouteId(team: TeamEntry): string {
  return buildTeamIdentityKey(team);
}

function buildTeamIdentity(team: TeamEntry): TeamSeasonIdentity {
  return {
    key: buildTeamIdentityKey(team),
    routeId: buildTeamRouteId(team),
    manager: team.manager,
    teamName: team.teamName,
    socialId: typeof team.socialId === "number" ? team.socialId : null,
    managerTeamNumber:
      typeof team.managerTeamNumber === "number" ? team.managerTeamNumber : null,
    managerTeamCount:
      typeof team.managerTeamCount === "number" ? team.managerTeamCount : null,
    managerTeamLabel: getTeamSlotLabel(team),
  };
}

function getSortedRaces(views: LeagueViewReference[]): LeagueViewReference[] {
  const raceViews = views.filter((view) => view.targetRace !== null);
  const source = raceViews.length > 0 ? raceViews : views;

  return [...source].sort((left, right) =>
    left.scrapedAt === right.scrapedAt
      ? left.label.localeCompare(right.label)
      : left.scrapedAt.localeCompare(right.scrapedAt),
  );
}

function diffNames(current: string[], previous: string[]): { added: string[]; removed: string[] } {
  const previousSet = new Set(previous);
  const currentSet = new Set(current);

  return {
    added: current.filter((name) => !previousSet.has(name)),
    removed: previous.filter((name) => !currentSet.has(name)),
  };
}

function buildDelta(current: TeamEntry, previous: TeamEntry | null): TeamDelta | null {
  if (!previous) {
    return null;
  }

  const currentDrivers = current.lineup.drivers ?? [];
  const previousDrivers = previous.lineup.drivers ?? [];
  const currentConstructors = current.lineup.constructors ?? [];
  const previousConstructors = previous.lineup.constructors ?? [];

  const driverDelta = diffNames(currentDrivers, previousDrivers);
  const constructorDelta = diffNames(currentConstructors, previousConstructors);

  return {
    addedDrivers: driverDelta.added,
    removedDrivers: driverDelta.removed,
    addedConstructors: constructorDelta.added,
    removedConstructors: constructorDelta.removed,
    rankDelta:
      typeof current.rank === "number" && typeof previous.rank === "number"
        ? previous.rank - current.rank
        : null,
    pointsDelta:
      typeof current.totalPoints === "number" && typeof previous.totalPoints === "number"
        ? current.totalPoints - previous.totalPoints
        : null,
  };
}

export function aggregateLeagueSeasonData(
  manifest: LeagueManifest,
  league: ExportedLeague,
  snapshots: SeasonSnapshot[],
): LeagueSeasonDataset {
  const teamMap = new Map<string, TeamSeasonHistory>();

  for (const snapshot of snapshots) {
    for (const team of snapshot.data.teams) {
      const identity = buildTeamIdentity(team);
      const existing = teamMap.get(identity.key);
      const previousEntry = existing?.entries[existing.entries.length - 1] ?? null;

      const entry: TeamHistoryEntry = {
        viewKey: snapshot.view.key,
        viewLabel: snapshot.view.label,
        targetRace: snapshot.view.targetRace,
        scrapedAt: snapshot.view.scrapedAt,
        rank: team.rank,
        totalPoints:
          typeof team.totalPoints === "number"
            ? team.totalPoints
            : typeof team.selectedRace?.totalPoints === "number"
              ? team.selectedRace.totalPoints
              : null,
        team,
        delta: buildDelta(team, previousEntry?.team ?? null),
      };

      if (!existing) {
        teamMap.set(identity.key, {
          identity,
          entries: [entry],
        });
      } else {
        existing.entries.push(entry);
      }
    }
  }

  const teams = Array.from(teamMap.values()).sort((left, right) => {
    const leftLatest = left.entries[left.entries.length - 1];
    const rightLatest = right.entries[right.entries.length - 1];
    const leftRank = leftLatest?.rank ?? Number.POSITIVE_INFINITY;
    const rightRank = rightLatest?.rank ?? Number.POSITIVE_INFINITY;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    const managerCompare = normalizeName(left.identity.manager).localeCompare(
      normalizeName(right.identity.manager),
    );

    if (managerCompare !== 0) {
      return managerCompare;
    }

    return normalizeName(left.identity.teamName).localeCompare(
      normalizeName(right.identity.teamName),
    );
  });

  return {
    manifest,
    league,
    snapshots,
    teams,
  };
}

export async function loadLeagueSeasonDataset(
  leagueId: string,
): Promise<LeagueSeasonDataset> {
  const manifest = await loadLeagueManifest();
  const league = resolveLeague(manifest, leagueId);

  if (!league) {
    throw new Error(`League ${leagueId} was not found in the manifest.`);
  }

  const raceViews = getSortedRaces(league.views);
  const snapshots = await Promise.all(
    raceViews.map(async (view) => ({
      view,
      data: await loadLeagueView(view.file),
    })),
  );

  return aggregateLeagueSeasonData(manifest, league, snapshots);
}

export function summarizeLatestDelta(history: TeamSeasonHistory): string {
  const latestEntry = history.entries[history.entries.length - 1];
  const delta = latestEntry?.delta;

  if (!delta) {
    return "No prior race snapshot available.";
  }

  const parts: string[] = [];

  if (delta.rankDelta && delta.rankDelta !== 0) {
    parts.push(`${delta.rankDelta > 0 ? "+" : ""}${delta.rankDelta} rank`);
  }

  if (delta.pointsDelta && delta.pointsDelta !== 0) {
    parts.push(`${delta.pointsDelta > 0 ? "+" : ""}${delta.pointsDelta} pts`);
  }

  if (delta.addedDrivers.length > 0 || delta.removedDrivers.length > 0) {
    parts.push(
      `Drivers ${delta.addedDrivers.length > 0 ? `in ${delta.addedDrivers.join(", ")}` : ""}${
        delta.addedDrivers.length > 0 && delta.removedDrivers.length > 0 ? " / " : ""
      }${delta.removedDrivers.length > 0 ? `out ${delta.removedDrivers.join(", ")}` : ""}`,
    );
  }

  if (delta.addedConstructors.length > 0 || delta.removedConstructors.length > 0) {
    parts.push(
      `Constructors ${
        delta.addedConstructors.length > 0 ? `in ${delta.addedConstructors.join(", ")}` : ""
      }${
        delta.addedConstructors.length > 0 && delta.removedConstructors.length > 0 ? " / " : ""
      }${
        delta.removedConstructors.length > 0
          ? `out ${delta.removedConstructors.join(", ")}`
          : ""
      }`,
    );
  }

  return parts.length > 0 ? parts.join(" · ") : "No lineup changes detected.";
}

export function findTeamHistory(
  dataset: LeagueSeasonDataset,
  routeId: string,
): TeamSeasonHistory | null {
  return dataset.teams.find((team) => team.identity.routeId === routeId) ?? null;
}
