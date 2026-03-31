"use client";

import { useEffect, useMemo, useState } from "react";

import {
  formatViewLabel,
  getTopPredictionHighlight,
  getUniqueManagers,
  loadLeagueInsights,
  loadLeagueManifest,
  loadLeagueView,
  resolveLeague,
  resolveView,
} from "@/lib/league-data";
import type {
  ExportedLeague,
  LeagueInsightsData,
  LeagueManifest,
  LeagueViewData,
  OwnershipEntry,
  PairEntry,
  PredictionEntry,
  TeamEntry,
  TeamInsightEntry,
} from "@/lib/types";

import styles from "./F1FantasyDashboard.module.css";

type SortKey = "rank" | "points" | "manager";

function formatPercent(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${value.toFixed(1)}%`;
}

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "--";
  }

  return value.toLocaleString();
}

function getChipLabel(team: TeamEntry): string {
  if (team.chips.used.length > 0) {
    return team.chips.used.join(", ");
  }

  if (team.turboDriver) {
    return `Turbo: ${team.turboDriver}`;
  }

  return "No chip used";
}

function getTeamDetailName(team: TeamEntry): string {
  return team.detailTeamName ?? team.teamName;
}

function getTopOwned(entries: OwnershipEntry[]): OwnershipEntry | null {
  return entries[0] ?? null;
}

function sortTeams(teams: TeamEntry[], sortKey: SortKey): TeamEntry[] {
  const copy = [...teams];

  copy.sort((left, right) => {
    if (sortKey === "manager") {
      return left.manager.localeCompare(right.manager);
    }

    if (sortKey === "points") {
      return (right.totalPoints ?? -Infinity) - (left.totalPoints ?? -Infinity);
    }

    return left.rank - right.rank;
  });

  return copy;
}

function getPredictionTone(momentumScore: number | undefined): "good" | "bad" | "neutral" {
  if (momentumScore === undefined) {
    return "neutral";
  }

  if (momentumScore > 0) {
    return "good";
  }

  if (momentumScore < 0) {
    return "bad";
  }

  return "neutral";
}

function getInitialTeam(viewData: LeagueViewData | null): TeamEntry | null {
  return viewData?.teams[0] ?? null;
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className={styles.summaryCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function StatBarList({
  title,
  items,
  valueLabel,
}: {
  title: string;
  items: OwnershipEntry[];
  valueLabel: (entry: OwnershipEntry) => string;
}) {
  const max = items[0]?.percentage ?? 1;

  return (
    <article className={styles.chartCard}>
      <h3>{title}</h3>
      <div className={styles.barList}>
        {items.map((entry) => (
          <div key={entry.name} className={styles.barRow}>
            <div className={styles.barMeta}>
              <span>{entry.name}</span>
              <span>{valueLabel(entry)}</span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${(entry.percentage / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function PairList({ title, items }: { title: string; items: PairEntry[] }) {
  return (
    <article className={styles.subSectionCard}>
      <h3>{title}</h3>
      <ul className={styles.simpleList}>
        {items.map((item) => (
          <li key={item.names.join("-")}>
            <div>
              <strong>{item.names.join(" + ")}</strong>
              <span>{formatPercent(item.percentage)}</span>
            </div>
            <p>{item.count} teams share this combination.</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function InsightTeamList({
  title,
  items,
  emphasis,
}: {
  title: string;
  items: TeamInsightEntry[];
  emphasis: "unique" | "template";
}) {
  return (
    <article className={styles.subSectionCard}>
      <h3>{title}</h3>
      <ul className={styles.simpleList}>
        {items.map((team) => (
          <li key={`${team.rank}-${team.teamName}`}>
            <div>
              <strong>
                #{team.rank} {team.teamName}
              </strong>
              <span>{team.manager}</span>
            </div>
            <p>
              {emphasis === "unique"
                ? `${team.uniquePickCount ?? 0} unique picks, average ownership ${formatPercent(team.averagePickOwnership)}.`
                : `${formatPercent(team.averagePickOwnership)} average ownership with ${team.totalPoints} points.`}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PredictionList({
  title,
  items,
}: {
  title: string;
  items: PredictionEntry[];
}) {
  return (
    <article className={styles.subSectionCard}>
      <h3>{title}</h3>
      <ul className={styles.simpleList}>
        {items.map((item) => (
          <li key={`${title}-${item.type}-${item.name}`}>
            <div>
              <strong>{item.name}</strong>
              <span className={styles.badge}>{item.type}</span>
            </div>
            <p>
              League ownership {formatPercent(item.overallPercentage)}
              {item.topTeamPercentage !== undefined
                ? `, top-team ownership ${formatPercent(item.topTeamPercentage)}`
                : ""}
              {item.momentumScore !== undefined
                ? `, momentum ${item.momentumScore.toFixed(1)}`
                : ""}
              .
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function TeamDetailPanel({ team }: { team: TeamEntry | null }) {
  if (!team) {
    return (
      <aside className={styles.detailPanel}>
        <h3>Team details</h3>
        <p>Select a team to inspect its lineup, chip usage, and transfer state.</p>
      </aside>
    );
  }

  return (
    <aside className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <div>
          <span className={styles.badge}>Selected team</span>
          <h3>{getTeamDetailName(team)}</h3>
          <p>{team.manager}</p>
        </div>
        <div className={styles.detailRank}>
          <strong>#{team.rank}</strong>
          <span>{formatCount(team.totalPoints)} pts</span>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div>
          <h4>Drivers</h4>
          <ul className={styles.detailList}>
            {team.drivers.map((driver) => (
              <li key={driver.name}>
                <span>{driver.name}</span>
                <span>{driver.turbo ? "Turbo" : "--"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Constructors</h4>
          <ul className={styles.detailList}>
            {team.constructors.map((constructorEntry) => (
              <li key={constructorEntry.name}>
                <span>{constructorEntry.name}</span>
                <span>{formatCount(constructorEntry.points)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.detailStats}>
        <div>
          <span>Chip usage</span>
          <strong>{getChipLabel(team)}</strong>
        </div>
        <div>
          <span>Transfer state</span>
          <strong>
            {formatCount(team.transfer.made)} made / {formatCount(team.transfer.allowed)} allowed
          </strong>
        </div>
        <div>
          <span>Penalty points</span>
          <strong>{formatCount(team.transfer.penaltyPoints)}</strong>
        </div>
        <div>
          <span>Cost cap</span>
          <strong>{team.costCap ?? "--"}</strong>
        </div>
      </div>
    </aside>
  );
}

export function F1FantasyDashboard() {
  const [manifest, setManifest] = useState<LeagueManifest | null>(null);
  const [viewData, setViewData] = useState<LeagueViewData | null>(null);
  const [insightsData, setInsightsData] = useState<LeagueInsightsData | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [selectedViewKey, setSelectedViewKey] = useState<string>("");
  const [selectedTeamName, setSelectedTeamName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      setStatus("loading");

      try {
        const nextManifest = await loadLeagueManifest();

        if (isCancelled) {
          return;
        }

        const defaultLeague = resolveLeague(nextManifest);
        const defaultView = defaultLeague ? resolveView(defaultLeague) : null;

        setManifest(nextManifest);
        setSelectedLeagueId(defaultLeague?.leagueId ?? "");
        setSelectedViewKey(defaultView?.key ?? "");
        setError("");
      } catch (caughtError) {
        if (isCancelled) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load the league manifest.",
        );
        setStatus("error");
      }
    }

    void bootstrap();

    return () => {
      isCancelled = true;
    };
  }, []);

  const selectedLeague: ExportedLeague | null = useMemo(() => {
    if (!manifest) {
      return null;
    }

    return resolveLeague(manifest, selectedLeagueId);
  }, [manifest, selectedLeagueId]);

  const selectedView = useMemo(() => {
    if (!selectedLeague) {
      return null;
    }

    return resolveView(selectedLeague, selectedViewKey);
  }, [selectedLeague, selectedViewKey]);

  useEffect(() => {
    if (!selectedView) {
      return;
    }

    const activeView = selectedView;
    let isCancelled = false;

    async function loadSelectedView() {
      setStatus("loading");

      try {
        const [nextViewData, nextInsightsData] = await Promise.all([
          loadLeagueView(activeView.file),
          activeView.insightFile
            ? loadLeagueInsights(activeView.insightFile)
            : Promise.resolve(null),
        ]);

        if (isCancelled) {
          return;
        }

        setViewData(nextViewData);
        setInsightsData(nextInsightsData);
        setSelectedTeamName(getInitialTeam(nextViewData)?.teamName ?? "");
        setSelectedManager("all");
        setSearchTerm("");
        setError("");
        setStatus("ready");
      } catch (caughtError) {
        if (isCancelled) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load the selected league view.",
        );
        setStatus("error");
      }
    }

    void loadSelectedView();

    return () => {
      isCancelled = true;
    };
  }, [selectedView]);

  const managers = useMemo(() => {
    if (!viewData) {
      return [];
    }

    return getUniqueManagers(viewData);
  }, [viewData]);

  const filteredTeams = useMemo(() => {
    if (!viewData) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const teams = viewData.teams.filter((team) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        team.teamName.toLowerCase().includes(normalizedSearch) ||
        team.manager.toLowerCase().includes(normalizedSearch);
      const matchesManager =
        selectedManager === "all" || team.manager === selectedManager;

      return matchesSearch && matchesManager;
    });

    return sortTeams(teams, sortKey);
  }, [searchTerm, selectedManager, sortKey, viewData]);

  const selectedTeam = useMemo(() => {
    return (
      filteredTeams.find((team) => team.teamName === selectedTeamName) ??
      viewData?.teams.find((team) => team.teamName === selectedTeamName) ??
      getInitialTeam(viewData)
    );
  }, [filteredTeams, selectedTeamName, viewData]);

  const topOwnedDriver = getTopOwned(insightsData?.ownership.drivers ?? []);
  const topOwnedConstructor = getTopOwned(insightsData?.ownership.constructors ?? []);
  const topMomentum = insightsData?.predictions.pickMomentum[0];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>F1 Fantasy League Analysis</span>
          <h1>League picks, ownership trends, and prediction signals in one dashboard.</h1>
          <p>
            This site turns exported strategist snapshots into a presentation layer for
            league standings, lineup behavior, and the prediction patterns that matter
            before the next race.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.domainPill}>Planned home: f1fantasy.aasuka.com</span>
          <p>
            Data is served from the static package under <code>/data/league-data</code>,
            so the site stays lightweight and deployment-friendly.
          </p>
        </div>
      </section>

      <section className={styles.controlsCard}>
        <div className={styles.controlsHeader}>
          <SectionHeader
            eyebrow="Navigation"
            title="League and snapshot selection"
            description="The dashboard is driven by the exported manifest, so each view reflects a real strategist snapshot."
          />
        </div>

        <div className={styles.controlsGrid}>
          <label className={styles.field}>
            <span>League</span>
            <select
              value={selectedLeagueId}
              onChange={(event) => {
                const nextLeagueId = event.target.value;
                const nextLeague = manifest?.leagues.find(
                  (league) => league.leagueId === nextLeagueId,
                );

                setSelectedLeagueId(nextLeagueId);
                setSelectedViewKey(nextLeague?.latestViewKey ?? "");
              }}
              disabled={!manifest || manifest.leagues.length === 0}
            >
              {manifest?.leagues.map((league) => (
                <option key={league.leagueId} value={league.leagueId}>
                  League {league.leagueId}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Snapshot</span>
            <select
              value={selectedView?.key ?? ""}
              onChange={(event) => setSelectedViewKey(event.target.value)}
              disabled={!selectedLeague}
            >
              {selectedLeague?.views.map((view) => (
                <option key={view.key} value={view.key}>
                  {formatViewLabel(view)}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Search teams</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Team name or manager"
            />
          </label>

          <label className={styles.field}>
            <span>Manager</span>
            <select
              value={selectedManager}
              onChange={(event) => setSelectedManager(event.target.value)}
              disabled={!viewData}
            >
              <option value="all">All managers</option>
              {managers.map((manager) => (
                <option key={manager} value={manager}>
                  {manager}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Sort standings</span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
            >
              <option value="rank">By rank</option>
              <option value="points">By points</option>
              <option value="manager">By manager</option>
            </select>
          </label>
        </div>
      </section>

      {status === "loading" && (
        <section className={styles.stateCard}>
          <p>Loading the latest league package...</p>
        </section>
      )}

      {status === "error" && (
        <section className={styles.stateCard}>
          <h2>Data load issue</h2>
          <p>{error}</p>
        </section>
      )}

      {status === "ready" && viewData && selectedLeague && selectedView && (
        <>
          <section className={styles.summaryGrid}>
            <SummaryCard
              label="League"
              value={`#${selectedLeague.leagueId}`}
              detail={selectedLeague.latestViewLabel}
            />
            <SummaryCard
              label="Snapshot"
              value={selectedView.label}
              detail={`Updated ${formatDateTime(selectedView.scrapedAt)}`}
            />
            <SummaryCard
              label="Teams tracked"
              value={String(viewData.teams.length)}
              detail={`${filteredTeams.length} shown after filters`}
            />
            <SummaryCard
              label="Prediction signal"
              value={topMomentum?.name ?? "Waiting"}
              detail={getTopPredictionHighlight(insightsData)}
            />
          </section>

          <section className={styles.section}>
            <SectionHeader
              eyebrow="All Team Picks"
              title="Standings and roster view"
              description="Use the filters to compare managers, inspect lineups, and see how chip usage and transfers map to league rank."
            />

            <div className={styles.standingsLayout}>
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team</th>
                      <th>Manager</th>
                      <th>Points</th>
                      <th>Constructors</th>
                      <th>Chip / strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team) => (
                      <tr
                        key={`${team.rank}-${team.teamName}`}
                        className={
                          selectedTeam?.teamName === team.teamName ? styles.activeRow : ""
                        }
                        onClick={() => setSelectedTeamName(team.teamName)}
                      >
                        <td>#{team.rank}</td>
                        <td>
                          <strong>{team.teamName}</strong>
                          <span>{team.lineup.drivers.slice(0, 2).join(", ")}</span>
                        </td>
                        <td>{team.manager}</td>
                        <td>{formatCount(team.totalPoints)}</td>
                        <td>{team.lineup.constructors.join(" / ")}</td>
                        <td>{getChipLabel(team)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <TeamDetailPanel team={selectedTeam ?? null} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionHeader
              eyebrow="Pick Distribution"
              title="Ownership, template patterns, and recurring combinations"
              description="These sections use the exported insights file to surface the most common choices, pairings, and template structure."
            />

            <div className={styles.summaryGrid}>
              <SummaryCard
                label="Most owned driver"
                value={topOwnedDriver?.name ?? "--"}
                detail={
                  topOwnedDriver
                    ? `${formatPercent(topOwnedDriver.percentage)} ownership`
                    : "No ownership data"
                }
              />
              <SummaryCard
                label="Most owned constructor"
                value={topOwnedConstructor?.name ?? "--"}
                detail={
                  topOwnedConstructor
                    ? `${formatPercent(topOwnedConstructor.percentage)} ownership`
                    : "No ownership data"
                }
              />
              <SummaryCard
                label="Template drivers"
                value={insightsData?.groups.template.drivers.length.toString() ?? "0"}
                detail={insightsData?.groups.template.drivers.join(", ") ?? "No template data"}
              />
              <SummaryCard
                label="Duplicate lineups"
                value={String(insightsData?.groups.duplicateLineups.length ?? 0)}
                detail="Useful for spotting how concentrated the field really is."
              />
            </div>

            <div className={styles.chartsGrid}>
              <StatBarList
                title="Top driver ownership"
                items={insightsData?.ownership.drivers.slice(0, 8) ?? []}
                valueLabel={(entry) => `${formatPercent(entry.percentage)} · ${entry.count} teams`}
              />
              <StatBarList
                title="Top constructor ownership"
                items={insightsData?.ownership.constructors.slice(0, 8) ?? []}
                valueLabel={(entry) => `${formatPercent(entry.percentage)} · ${entry.count} teams`}
              />
              <StatBarList
                title="Chip usage"
                items={insightsData?.ownership.chips ?? []}
                valueLabel={(entry) => `${formatPercent(entry.percentage)} · ${entry.count} uses`}
              />
            </div>

            <div className={styles.twoColumnGrid}>
              <PairList
                title="Most common driver pairs"
                items={insightsData?.groups.mostCommonDriverPairs.slice(0, 5) ?? []}
              />
              <PairList
                title="Most common constructor pairs"
                items={insightsData?.groups.mostCommonConstructorPairs.slice(0, 5) ?? []}
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionHeader
              eyebrow="Predictions & Insights"
              title="Momentum signals and team-level interpretation"
              description="The prediction layer stays heuristic by design, giving you a league-relative read on underowned plays, overexposed picks, and leader overlap."
            />

            <div className={styles.predictionHero}>
              <div>
                <span className={styles.eyebrow}>Current highlight</span>
                <h3>{getTopPredictionHighlight(insightsData)}</h3>
                <p>
                  Based on a top-team sample of {insightsData?.predictions.topTeamSampleSize ?? 0},
                  this highlights which picks are over-performing relative to overall league ownership.
                </p>
              </div>
              <div
                className={`${styles.toneBadge} ${
                  styles[getPredictionTone(topMomentum?.momentumScore)]
                }`}
              >
                {topMomentum?.momentumScore?.toFixed(1) ?? "--"} momentum
              </div>
            </div>

            <div className={styles.twoColumnGrid}>
              <InsightTeamList
                title="Most unique teams"
                items={insightsData?.teamInsights.mostUniqueTeams.slice(0, 5) ?? []}
                emphasis="unique"
              />
              <InsightTeamList
                title="Most template teams"
                items={insightsData?.teamInsights.mostTemplateTeams.slice(0, 5) ?? []}
                emphasis="template"
              />
            </div>

            <div className={styles.threeColumnGrid}>
              <PredictionList
                title="Momentum picks"
                items={insightsData?.predictions.pickMomentum.slice(0, 6) ?? []}
              />
              <PredictionList
                title="Underowned top-team picks"
                items={insightsData?.predictions.underownedTopPicks.slice(0, 6) ?? []}
              />
              <PredictionList
                title="Overexposed picks"
                items={insightsData?.predictions.overexposedPicks.slice(0, 6) ?? []}
              />
            </div>

            <div className={styles.twoColumnGrid}>
              <PredictionList
                title="Leader differentials"
                items={insightsData?.predictions.leaderDifferentials.slice(0, 6) ?? []}
              />
              <article className={styles.subSectionCard}>
                <h3>Leader overlap</h3>
                <ul className={styles.simpleList}>
                  {insightsData?.teamInsights.leaderOverlap.slice(0, 6).map((team) => (
                    <li key={`${team.rank}-${team.teamName}`}>
                      <div>
                        <strong>
                          #{team.rank} {team.teamName}
                        </strong>
                        <span>{formatPercent(team.overlapPercentage)}</span>
                      </div>
                      <p>
                        {team.overlapCount} shared picks with the leader across{" "}
                        {team.matchingDrivers.length} drivers and{" "}
                        {team.matchingConstructors.length} constructors.
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
