"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "@/components/SeasonPages.module.css";
import { summarizeLatestDelta, loadLeagueSeasonDataset } from "@/lib/season-data";
import { useSitePreferences } from "@/lib/site-preferences";

function formatDateTime(value: string, locale: "en" | "zh"): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
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

export function LeagueChangesPage({ leagueId }: { leagueId: string }) {
  const { locale, setLocale, theme, setTheme, messages } = useSitePreferences();
  const [dataset, setDataset] = useState<Awaited<
    ReturnType<typeof loadLeagueSeasonDataset>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadLeagueSeasonDataset(leagueId)
      .then((value) => {
        if (!cancelled) {
          setDataset(value);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [leagueId]);

  const latestSnapshot = useMemo(
    () => dataset?.snapshots[dataset.snapshots.length - 1] ?? null,
    [dataset],
  );

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.utilityBar}>
          <div className={styles.utilityLinks}>
            <Link className={styles.utilityLink} href="/">
              {messages.backToDashboard}
            </Link>
            <a
              className={styles.utilityLink}
              href="https://github.com/Aasuka2cup/Raaaace-Weeeeek"
              target="_blank"
              rel="noopener noreferrer"
            >
              {messages.githubLabel}
            </a>
          </div>

          <div className={styles.utilityGroup}>
            <span className={styles.utilityLabel}>{messages.themeLabel}</span>
            <div className={styles.segmentedControl}>
              <button
                className={`${styles.segmentButton} ${
                  theme === "dark" ? styles.segmentButtonActive : ""
                }`}
                onClick={() => setTheme("dark")}
                type="button"
              >
                {messages.themeDark}
              </button>
              <button
                className={`${styles.segmentButton} ${
                  theme === "light" ? styles.segmentButtonActive : ""
                }`}
                onClick={() => setTheme("light")}
                type="button"
              >
                {messages.themeLight}
              </button>
            </div>
            <span className={styles.utilityLabel}>{messages.localeLabel}</span>
            <div className={styles.segmentedControl}>
              <button
                className={`${styles.segmentButton} ${
                  locale === "en" ? styles.segmentButtonActive : ""
                }`}
                onClick={() => setLocale("en")}
                type="button"
              >
                {messages.langEnglish}
              </button>
              <button
                className={`${styles.segmentButton} ${
                  locale === "zh" ? styles.segmentButtonActive : ""
                }`}
                onClick={() => setLocale("zh")}
                type="button"
              >
                {messages.langChinese}
              </button>
            </div>
          </div>
        </div>

        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>{messages.teamChangesLink}</span>
            <h1>{messages.seasonChangesTitle}</h1>
            <p>{messages.seasonChangesDescription}</p>
          </div>

          <div className={styles.heroStats}>
            <span className={styles.pill}>{messages.leagueNumber(leagueId)}</span>
            {latestSnapshot ? (
              <span className={styles.pill}>
                {messages.seasonLatestRaceLabel}:{" "}
                {latestSnapshot.view.targetRace ?? latestSnapshot.view.label}
              </span>
            ) : null}
          </div>
        </section>

        {error ? (
          <section className={styles.emptyState}>
            <h2>{messages.errorTitle}</h2>
            <p>{error}</p>
          </section>
        ) : null}

        {!error && !dataset ? (
          <section className={styles.emptyState}>
            <h2>{messages.loadingMessage}</h2>
          </section>
        ) : null}

        {!error && dataset && dataset.teams.length === 0 ? (
          <section className={styles.emptyState}>
            <h2>{messages.seasonNoData}</h2>
          </section>
        ) : null}

        {!error && dataset && dataset.teams.length > 0 ? (
          <>
            <section className={styles.summaryGrid}>
              <article className={styles.summaryCard}>
                <span>{messages.summaryTeams}</span>
                <strong>{dataset.teams.length}</strong>
              </article>
              <article className={styles.summaryCard}>
                <span>{messages.seasonSnapshotsLabel}</span>
                <strong>{dataset.snapshots.length}</strong>
              </article>
              <article className={styles.summaryCard}>
                <span>{messages.seasonLatestRaceLabel}</span>
                <strong>{latestSnapshot?.view.targetRace ?? "--"}</strong>
                {latestSnapshot ? (
                  <p>{formatDateTime(latestSnapshot.view.scrapedAt, locale)}</p>
                ) : null}
              </article>
            </section>

            <section className={styles.tableCard}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{messages.standingsTableManager}</th>
                      <th>{messages.standingsTableTeam}</th>
                      <th>{messages.standingsTableTeamNo}</th>
                      <th>{messages.seasonSnapshotsLabel}</th>
                      <th>{messages.standingsTableRank}</th>
                      <th>{messages.standingsTablePoints}</th>
                      <th>{messages.seasonLatestDeltaLabel}</th>
                      <th>{messages.teamSeasonLink}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.teams.map((history) => {
                      const latestEntry = history.entries[history.entries.length - 1];

                      return (
                        <tr key={history.identity.key}>
                          <td>{history.identity.manager}</td>
                          <td>{latestEntry?.team.teamName ?? history.identity.teamName}</td>
                          <td>{history.identity.managerTeamLabel ?? "--"}</td>
                          <td>{history.entries.length}</td>
                          <td>#{latestEntry?.rank ?? "--"}</td>
                          <td>{formatCount(latestEntry?.totalPoints)}</td>
                          <td>
                            <p>{summarizeLatestDelta(history)}</p>
                          </td>
                          <td>
                            <Link
                              className={styles.actionLink}
                              href={`/leagues/${leagueId}/teams/${history.identity.routeId}`}
                            >
                              {messages.teamSeasonLink}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
