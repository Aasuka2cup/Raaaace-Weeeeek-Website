"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "@/components/SeasonPages.module.css";
import type { DashboardMessages, Locale } from "@/lib/messages";
import { findTeamHistory, loadLeagueSeasonDataset } from "@/lib/season-data";
import { useSitePreferences } from "@/lib/site-preferences";

interface TrendPoint {
  index: number;
  label: string;
  raceName: string;
  value: number | null;
}

function formatDateTime(value: string, locale: Locale): string {
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

function getChipLabel(chipsUsed: string[], turboDriver: string | null | undefined): string {
  if (chipsUsed.length > 0) {
    return chipsUsed.join(", ");
  }

  if (turboDriver) {
    return `Turbo: ${turboDriver}`;
  }

  return "--";
}

function getRaceName(raceName: string | null | undefined, fallback: string): string {
  return raceName ?? fallback;
}

function buildTrendPoints(
  entries: NonNullable<ReturnType<typeof findTeamHistory>>["entries"],
  getValue: (value: (typeof entries)[number]) => number | null,
  messages: DashboardMessages,
): TrendPoint[] {
  const total = entries.length;

  return entries.map((entry, index) => ({
    index,
    label: messages.seasonRaceOrder(index + 1, total),
    raceName: getRaceName(entry.targetRace, entry.viewLabel),
    value: getValue(entry),
  }));
}

function TrendChart({
  title,
  description,
  points,
  invertScale = false,
  messages,
}: {
  title: string;
  description: string;
  points: TrendPoint[];
  invertScale?: boolean;
  messages: DashboardMessages;
}) {
  const validPoints = points.filter(
    (point): point is TrendPoint & { value: number } => typeof point.value === "number",
  );

  if (validPoints.length < 2) {
    return (
      <article className={styles.timelineCard}>
        <span>{title}</span>
        <strong>{messages.seasonTrendNoData}</strong>
        <p>{description}</p>
      </article>
    );
  }

  const width = 640;
  const height = 240;
  const paddingTop = 20;
  const paddingRight = 18;
  const paddingBottom = 40;
  const paddingLeft = 42;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;
  const minValue = Math.min(...validPoints.map((point) => point.value));
  const maxValue = Math.max(...validPoints.map((point) => point.value));
  const valueRange = Math.max(maxValue - minValue, 1);
  const pointCount = Math.max(points.length - 1, 1);

  const chartPoints = validPoints.map((point) => {
    const x = paddingLeft + (innerWidth * point.index) / pointCount;
    const y = invertScale
      ? paddingTop + ((point.value - minValue) / valueRange) * innerHeight
      : paddingTop + (1 - (point.value - minValue) / valueRange) * innerHeight;

    return {
      ...point,
      x,
      y,
    };
  });

  const path = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <article className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <span>{title}</span>
          <strong>{validPoints[validPoints.length - 1].value}</strong>
        </div>
        <p>{description}</p>
      </div>

      <div className={styles.chartFrame}>
        <svg
          className={styles.chartSvg}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={title}
        >
          <line
            className={styles.chartAxis}
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
          />
          <line
            className={styles.chartAxis}
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
          />
          <path className={styles.chartPath} d={path} />
          {chartPoints.map((point) => (
            <g key={point.label}>
              <circle className={styles.chartPoint} cx={point.x} cy={point.y} r="5" />
              <text className={styles.chartValue} x={point.x} y={point.y - 10}>
                {point.value}
              </text>
            </g>
          ))}
          {points.map((point) => {
            const x = paddingLeft + (innerWidth * point.index) / pointCount;

            return (
              <text
                key={`${point.label}-${point.raceName}`}
                className={styles.chartTick}
                x={x}
                y={height - 14}
              >
                {point.index + 1}
              </text>
            );
          })}
          <text className={styles.chartScaleLabel} x={paddingLeft - 8} y={paddingTop + 4}>
            {invertScale ? minValue : maxValue}
          </text>
          <text
            className={styles.chartScaleLabel}
            x={paddingLeft - 8}
            y={height - paddingBottom + 4}
          >
            {invertScale ? maxValue : minValue}
          </text>
        </svg>
      </div>

      <div className={styles.chartLegend}>
        {points.map((point) => (
          <span className={styles.changeChip} key={`${title}-${point.label}`}>
            {point.label}: {point.raceName}
          </span>
        ))}
      </div>
    </article>
  );
}

export function TeamSeasonPage({
  leagueId,
  teamId,
}: {
  leagueId: string;
  teamId: string;
}) {
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

  const history = useMemo(
    () => (dataset ? findTeamHistory(dataset, teamId) : null),
    [dataset, teamId],
  );
  const latestEntry = history?.entries[history.entries.length - 1] ?? null;
  const pointsTrend = useMemo(
    () =>
      history
        ? buildTrendPoints(history.entries, (entry) => entry.totalPoints, messages)
        : [],
    [history, messages],
  );
  const rankTrend = useMemo(
    () => (history ? buildTrendPoints(history.entries, (entry) => entry.rank, messages) : []),
    [history, messages],
  );

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.utilityBar}>
          <div className={styles.utilityLinks}>
            <Link className={styles.utilityLink} href="/">
              {messages.backToDashboard}
            </Link>
            <Link className={styles.utilityLink} href={`/leagues/${leagueId}/changes`}>
              {messages.backToChanges}
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

        {!error && dataset && !history ? (
          <section className={styles.emptyState}>
            <h2>{messages.seasonNoTeamFound}</h2>
          </section>
        ) : null}

        {!error && history ? (
          <>
            <section className={styles.hero}>
              <div>
                <span className={styles.eyebrow}>{messages.teamSeasonLink}</span>
                <h1>
                  {history.identity.manager}
                  {history.identity.managerTeamLabel
                    ? ` · ${history.identity.managerTeamLabel}`
                    : ""}
                </h1>
                <p>{messages.seasonTeamDescription}</p>
              </div>

              <div className={styles.heroStats}>
                <span className={styles.pill}>{messages.leagueNumber(leagueId)}</span>
                <span className={styles.pill}>
                  {messages.seasonSnapshotsLabel}: {history.entries.length}
                </span>
                <span className={styles.pill}>
                  {messages.seasonLatestRaceLabel}: {latestEntry?.targetRace ?? "--"}
                </span>
              </div>
            </section>

            <section className={styles.summaryGrid}>
              <article className={styles.summaryCard}>
                <span>{messages.standingsTableRank}</span>
                <strong>#{latestEntry?.rank ?? "--"}</strong>
              </article>
              <article className={styles.summaryCard}>
                <span>{messages.standingsTablePoints}</span>
                <strong>{formatCount(latestEntry?.totalPoints)}</strong>
              </article>
              <article className={styles.summaryCard}>
                <span>{messages.seasonLatestRaceLabel}</span>
                <strong>{latestEntry?.targetRace ?? "--"}</strong>
                {latestEntry ? (
                  <p>{formatDateTime(latestEntry.scrapedAt, locale)}</p>
                ) : null}
              </article>
            </section>

            <section className={styles.chartGrid}>
              <TrendChart
                title={messages.seasonPointsTrendTitle}
                description={messages.seasonPointsTrendDescription}
                points={pointsTrend}
                messages={messages}
              />
              <TrendChart
                title={messages.seasonRankTrendTitle}
                description={messages.seasonRankTrendDescription}
                points={rankTrend}
                invertScale
                messages={messages}
              />
            </section>

            <section>
              <div className={styles.timelineList}>
                {history.entries.map((entry, index) => (
                  <article className={styles.timelineCard} key={entry.viewKey}>
                    <div className={styles.metaRow}>
                      <div className={styles.stateCard}>
                        <span>{messages.seasonRaceOrder(index + 1, history.entries.length)}</span>
                        <strong>{getRaceName(entry.targetRace, entry.viewLabel)}</strong>
                        <p>{formatDateTime(entry.scrapedAt, locale)}</p>
                      </div>
                      <div className={styles.stateCard}>
                        <span>{messages.standingsTableRank}</span>
                        <strong>#{entry.rank}</strong>
                      </div>
                      <div className={styles.stateCard}>
                        <span>{messages.standingsTablePoints}</span>
                        <strong>{formatCount(entry.totalPoints)}</strong>
                      </div>
                      <div className={styles.stateCard}>
                        <span>{messages.chipUsageLabel}</span>
                        <strong>
                          {getChipLabel(entry.team.chips.used, entry.team.turboDriver)}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.lineupGrid}>
                      <div className={styles.stateCard}>
                        <span>{messages.driversLabel}</span>
                        <ul className={styles.list}>
                          {entry.team.lineup.drivers.map((driver) => (
                            <li key={driver}>{driver}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.stateCard}>
                        <span>{messages.constructorsLabel}</span>
                        <ul className={styles.list}>
                          {entry.team.lineup.constructors.map((constructorName) => (
                            <li key={constructorName}>{constructorName}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.stateCard}>
                        <span>{messages.transferStateLabel}</span>
                        <strong>
                          {formatCount(entry.team.transfer.made)} {messages.madeLabel} /{" "}
                          {formatCount(entry.team.transfer.allowed)}{" "}
                          {messages.allowedLabel}
                        </strong>
                        <p>
                          {messages.penaltyPointsLabel}:{" "}
                          {formatCount(entry.team.transfer.penaltyPoints)}
                        </p>
                      </div>
                    </div>

                    <div className={styles.stateCard}>
                      <span>{messages.seasonViewTimeline}</span>
                      {entry.delta ? (
                        <div className={styles.changeList}>
                          {entry.delta.addedDrivers.length > 0 ? (
                            <span className={styles.changeChip}>
                              {messages.seasonDriversIn}:{" "}
                              {entry.delta.addedDrivers.join(", ")}
                            </span>
                          ) : null}
                          {entry.delta.removedDrivers.length > 0 ? (
                            <span className={styles.changeChip}>
                              {messages.seasonDriversOut}:{" "}
                              {entry.delta.removedDrivers.join(", ")}
                            </span>
                          ) : null}
                          {entry.delta.addedConstructors.length > 0 ? (
                            <span className={styles.changeChip}>
                              {messages.seasonConstructorsIn}:{" "}
                              {entry.delta.addedConstructors.join(", ")}
                            </span>
                          ) : null}
                          {entry.delta.removedConstructors.length > 0 ? (
                            <span className={styles.changeChip}>
                              {messages.seasonConstructorsOut}:{" "}
                              {entry.delta.removedConstructors.join(", ")}
                            </span>
                          ) : null}
                          {entry.delta.rankDelta !== null ? (
                            <span className={styles.changeChip}>
                              {messages.standingsTableRank}:{" "}
                              {entry.delta.rankDelta > 0 ? "+" : ""}
                              {entry.delta.rankDelta}
                            </span>
                          ) : null}
                          {entry.delta.pointsDelta !== null ? (
                            <span className={styles.changeChip}>
                              {messages.standingsTablePoints}:{" "}
                              {entry.delta.pointsDelta > 0 ? "+" : ""}
                              {entry.delta.pointsDelta}
                            </span>
                          ) : null}
                          {entry.delta.addedDrivers.length === 0 &&
                          entry.delta.removedDrivers.length === 0 &&
                          entry.delta.addedConstructors.length === 0 &&
                          entry.delta.removedConstructors.length === 0 ? (
                            <span className={styles.changeChip}>
                              {messages.seasonNoChanges}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className={styles.changeChip}>
                          {messages.seasonNoChanges}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
