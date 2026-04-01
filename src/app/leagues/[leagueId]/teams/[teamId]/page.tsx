import { TeamSeasonPage } from "@/components/TeamSeasonPage";
import {
  buildLeagueSeasonDatasetFromDisk,
  readManifestFromDisk,
} from "@/lib/site-data-files";

export async function generateStaticParams() {
  const manifest = await readManifestFromDisk();
  const params: Array<{ leagueId: string; teamId: string }> = [];

  for (const league of manifest.leagues) {
    const dataset = await buildLeagueSeasonDatasetFromDisk(league, manifest);

    for (const team of dataset.teams) {
      params.push({
        leagueId: league.leagueId,
        teamId: team.identity.routeId,
      });
    }
  }

  return params;
}

export default async function TeamSeasonRoute({
  params,
}: {
  params: Promise<{ leagueId: string; teamId: string }>;
}) {
  const { leagueId, teamId } = await params;

  return <TeamSeasonPage leagueId={leagueId} teamId={teamId} />;
}
