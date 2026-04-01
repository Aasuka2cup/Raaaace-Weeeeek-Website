import { LeagueChangesPage } from "@/components/LeagueChangesPage";
import { readManifestFromDisk } from "@/lib/site-data-files";

export async function generateStaticParams() {
  const manifest = await readManifestFromDisk();

  return manifest.leagues.map((league) => ({
    leagueId: league.leagueId,
  }));
}

export default async function LeagueChangesRoute({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;

  return <LeagueChangesPage leagueId={leagueId} />;
}
