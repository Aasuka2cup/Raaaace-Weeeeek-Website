import type {
  ExportedLeague,
  LeagueInsightsData,
  LeagueManifest,
  LeagueViewData,
  LeagueViewReference,
} from "@/lib/types";

const DEFAULT_BASE_PATH = "/data/league-data";

async function loadJson<T>(filePath: string): Promise<T> {
  const response = await fetch(filePath, {
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${filePath}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function loadLeagueManifest(
  basePath = DEFAULT_BASE_PATH,
): Promise<LeagueManifest> {
  return loadJson<LeagueManifest>(`${basePath}/manifests/league-index.json`);
}

export async function loadLeagueView(
  filePath: string,
  basePath = DEFAULT_BASE_PATH,
): Promise<LeagueViewData> {
  return loadJson<LeagueViewData>(`${basePath}/${filePath}`);
}

export async function loadLeagueInsights(
  filePath: string,
  basePath = DEFAULT_BASE_PATH,
): Promise<LeagueInsightsData> {
  return loadJson<LeagueInsightsData>(`${basePath}/${filePath}`);
}

export function resolveLeague(
  manifest: LeagueManifest,
  requestedLeagueId?: string,
): ExportedLeague | null {
  if (manifest.leagues.length === 0) {
    return null;
  }

  return (
    manifest.leagues.find((league) => league.leagueId === requestedLeagueId) ??
    manifest.leagues[0]
  );
}

export function resolveView(
  league: ExportedLeague,
  requestedViewKey?: string,
): LeagueViewReference | null {
  if (league.views.length === 0) {
    return null;
  }

  return (
    league.views.find((view) => view.key === requestedViewKey) ??
    league.views.find((view) => view.key === league.latestViewKey) ??
    league.views[0]
  );
}

export function getUniqueManagers(viewData: LeagueViewData): string[] {
  return Array.from(
    new Set(viewData.teams.map((team) => team.manager).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));
}

export function getTopPredictionHighlight(
  insightsData: LeagueInsightsData | null,
): string {
  const topMomentum = insightsData?.predictions.pickMomentum[0];

  if (!topMomentum) {
    return "No prediction highlights available yet.";
  }

  return `${topMomentum.name} has the strongest momentum among top teams.`;
}

export function formatViewLabel(view: LeagueViewReference): string {
  return view.targetRace ?? view.label;
}
