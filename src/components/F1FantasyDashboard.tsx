"use client";

import { useEffect, useMemo, useState } from "react";

import {
  formatViewLabel,
  getUniqueManagers,
  loadLeagueInsights,
  loadLeagueManifest,
  loadLeagueView,
  resolveLeague,
  resolveView,
} from "@/lib/league-data";
import {
  DASHBOARD_MESSAGES,
  SECTION_IDS,
  STORAGE_KEYS,
  type Locale,
  type SectionId,
  type Theme,
} from "@/lib/messages";
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
type Messages = (typeof DASHBOARD_MESSAGES)["en"];

function formatPercent(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${value.toFixed(1)}%`;
}

function formatDateTime(value: string | undefined, locale: Locale): string {
  if (!value) {
    return locale === "zh" ? "未知" : "Unknown";
  }

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

function getChipLabel(team: TeamEntry, messages: Messages): string {
  if (team.chips.used.length > 0) {
    return team.chips.used.join(", ");
  }

  if (team.turboDriver) {
    return `${messages.turboPrefix}: ${team.turboDriver}`;
  }

  return messages.noChipUsed;
}

function getTeamDetailName(team: TeamEntry): string {
  return team.detailTeamName ?? team.teamName;
}

function getTeamNumber(team: TeamEntry): string {
  const candidates = [team.detailTeamName, team.teamName];

  for (const candidate of candidates) {
    if (candidate && /^T\d+$/i.test(candidate.trim())) {
      return candidate.trim().toUpperCase();
    }
  }

  return "";
}

function getTopOwned(entries: OwnershipEntry[]): OwnershipEntry | null {
  return entries[0] ?? null;
}

function getLocalizedViewLabel(viewKey: string, viewLabel: string, locale: Locale): string {
  if (viewKey === "overall") {
    return locale === "zh" ? "总榜" : "Overall";
  }

  return viewLabel;
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

function getStoredPreference<T extends string>(
  key: string,
  allowedValues: readonly T[],
  fallback: T,
): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);
  return stored && allowedValues.includes(stored as T) ? (stored as T) : fallback;
}

function getPredictionHighlight(
  insightsData: LeagueInsightsData | null,
  messages: Messages,
): string {
  const topMomentum = insightsData?.predictions.pickMomentum[0];

  if (!topMomentum) {
    return messages.predictionHighlightFallback;
  }

  return messages.predictionSignal(topMomentum.name);
}

function localizePredictionType(locale: Locale, type: PredictionEntry["type"]): string {
  if (locale === "zh") {
    return type === "driver" ? "车手" : "车队";
  }

  return type;
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

function PairList({
  title,
  items,
  messages,
}: {
  title: string;
  items: PairEntry[];
  messages: Messages;
}) {
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
            <p>{messages.teamsShareCombination(item.count)}</p>
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
  messages,
}: {
  title: string;
  items: TeamInsightEntry[];
  emphasis: "unique" | "template";
  messages: Messages;
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
                ? messages.uniqueTeamDetail(
                    team.uniquePickCount ?? 0,
                    formatPercent(team.averagePickOwnership),
                  )
                : messages.templateTeamDetail(
                    formatPercent(team.averagePickOwnership),
                    team.totalPoints,
                  )}
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
  locale,
  messages,
}: {
  title: string;
  items: PredictionEntry[];
  locale: Locale;
  messages: Messages;
}) {
  return (
    <article className={styles.subSectionCard}>
      <h3>{title}</h3>
      <ul className={styles.simpleList}>
        {items.map((item) => (
          <li key={`${title}-${item.type}-${item.name}`}>
            <div>
              <strong>{item.name}</strong>
              <span className={styles.badge}>{localizePredictionType(locale, item.type)}</span>
            </div>
            <p>
              {messages.predictionItemDetail(
                formatPercent(item.overallPercentage),
                item.topTeamPercentage !== undefined
                  ? formatPercent(item.topTeamPercentage)
                  : null,
                item.momentumScore !== undefined ? item.momentumScore.toFixed(1) : null,
              )}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function F1FantasyDashboard() {
  const [theme, setTheme] = useState<Theme>(() =>
    getStoredPreference(STORAGE_KEYS.theme, ["dark", "light"] as const, "dark"),
  );
  const [locale, setLocale] = useState<Locale>(() =>
    getStoredPreference(STORAGE_KEYS.locale, ["en", "zh"] as const, "en"),
  );
  const [activeSection, setActiveSection] = useState<SectionId>(SECTION_IDS.intro);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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

  const messages = DASHBOARD_MESSAGES[locale];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem(STORAGE_KEYS.locale, locale);
  }, [locale]);

  useEffect(() => {
    const sectionIds = Object.values(SECTION_IDS);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const nextActive = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (nextActive?.target.id) {
          setActiveSection(nextActive.target.id as SectionId);
        }
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0.2, 0.4, 0.7],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

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
  const predictionHighlight = getPredictionHighlight(insightsData, messages);

  const navItems = [
    { id: SECTION_IDS.intro, label: messages.navIntro },
    { id: SECTION_IDS.controls, label: messages.navControls },
    { id: SECTION_IDS.summary, label: messages.navSummary },
    { id: SECTION_IDS.standings, label: messages.navStandings },
    { id: SECTION_IDS.distribution, label: messages.navDistribution },
    { id: SECTION_IDS.predictions, label: messages.navPredictions },
  ];

  const renderSidebar = (isMobile = false) => (
    <nav
      className={isMobile ? styles.mobileSidebar : styles.sidebar}
      aria-label={messages.navLabel}
    >
      <div className={styles.sidebarTop}>
        <span className={styles.sidebarEyebrow}>{messages.navLabel}</span>
        <strong>F1 Fantasy</strong>
      </div>
      <div className={styles.navList}>
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`${styles.navLink} ${
              activeSection === item.id ? styles.navLinkActive : ""
            }`}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <span className={styles.navDot} />
            {item.label}
          </a>
        ))}
      </div>
      <div className={styles.sidebarFooter}>
        <span>{messages.domainPill}</span>
      </div>
    </nav>
  );

  return (
    <div className={styles.shell}>
      {renderSidebar()}

      <div className={styles.mobileToolbar}>
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileNavOpen(true)}
          aria-label={messages.mobileNavOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={styles.mobileUtilityPills}>
          <a
            className={styles.utilityLink}
            href="https://github.com/Aasuka2cup/Raaaace-Weeeeek"
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.githubLabel}
          </a>
          <button
            type="button"
            className={styles.utilityButton}
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? messages.themeLight : messages.themeDark}
          </button>
          <button
            type="button"
            className={styles.utilityButton}
            onClick={() => setLocale((current) => (current === "en" ? "zh" : "en"))}
          >
            {locale === "en" ? messages.langChinese : messages.langEnglish}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className={styles.mobileDrawerOverlay} onClick={() => setIsMobileNavOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.mobileDrawerHeader}>
              <strong>{messages.navLabel}</strong>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsMobileNavOpen(false)}
                aria-label={messages.mobileNavClose}
              >
                ×
              </button>
            </div>
            {renderSidebar(true)}
          </div>
        </div>
      )}

      <main className={styles.page}>
        <div className={styles.utilityBar}>
          <a
            className={styles.utilityLink}
            href="https://github.com/Aasuka2cup/Raaaace-Weeeeek"
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.githubLabel}
          </a>

          <div className={styles.utilityGroup}>
            <span className={styles.utilityLabel}>{messages.themeLabel}</span>
            <div className={styles.segmentedControl}>
              <button
                type="button"
                className={`${styles.segmentButton} ${
                  theme === "dark" ? styles.segmentButtonActive : ""
                }`}
                onClick={() => setTheme("dark")}
              >
                {messages.themeDark}
              </button>
              <button
                type="button"
                className={`${styles.segmentButton} ${
                  theme === "light" ? styles.segmentButtonActive : ""
                }`}
                onClick={() => setTheme("light")}
              >
                {messages.themeLight}
              </button>
            </div>
          </div>

          <div className={styles.utilityGroup}>
            <span className={styles.utilityLabel}>{messages.localeLabel}</span>
            <div className={styles.segmentedControl}>
              <button
                type="button"
                className={`${styles.segmentButton} ${
                  locale === "en" ? styles.segmentButtonActive : ""
                }`}
                onClick={() => setLocale("en")}
              >
                {messages.langEnglish}
              </button>
              <button
                type="button"
                className={`${styles.segmentButton} ${
                  locale === "zh" ? styles.segmentButtonActive : ""
                }`}
                onClick={() => setLocale("zh")}
              >
                {messages.langChinese}
              </button>
            </div>
          </div>
        </div>

        <section id={SECTION_IDS.intro} className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>{messages.siteTitle}</h1>
            <p>{messages.siteDescription}</p>
          </div>
        </section>

        <section id={SECTION_IDS.controls} className={styles.controlsCard}>
          <div className={styles.controlsHeader}>
            <SectionHeader
              eyebrow={messages.controlsEyebrow}
              title={messages.controlsTitle}
              description={messages.controlsDescription}
            />
          </div>

          <div className={styles.controlsGrid}>
            <label className={styles.field}>
              <span>{messages.leagueLabel}</span>
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
                    {messages.leagueNumber(league.leagueId)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>{messages.snapshotLabel}</span>
              <select
                value={selectedView?.key ?? ""}
                onChange={(event) => setSelectedViewKey(event.target.value)}
                disabled={!selectedLeague}
              >
                {selectedLeague?.views.map((view) => (
                  <option key={view.key} value={view.key}>
                    {getLocalizedViewLabel(view.key, formatViewLabel(view), locale)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>{messages.searchLabel}</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={messages.searchPlaceholder}
              />
            </label>

            <label className={styles.field}>
              <span>{messages.managerLabel}</span>
              <select
                value={selectedManager}
                onChange={(event) => setSelectedManager(event.target.value)}
                disabled={!viewData}
              >
                <option value="all">{messages.allManagers}</option>
                {managers.map((manager) => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>{messages.sortLabel}</span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
              >
                <option value="rank">{messages.sortRank}</option>
                <option value="points">{messages.sortPoints}</option>
                <option value="manager">{messages.sortManager}</option>
              </select>
            </label>
          </div>
        </section>

        {status === "loading" && (
          <section className={styles.stateCard}>
            <p>{messages.loadingMessage}</p>
          </section>
        )}

        {status === "error" && (
          <section className={styles.stateCard}>
            <h2>{messages.errorTitle}</h2>
            <p>{error}</p>
          </section>
        )}

        {status === "ready" && viewData && selectedLeague && selectedView && (
          <>
            <section id={SECTION_IDS.summary} className={styles.summaryGrid}>
              <SummaryCard
                label={messages.summaryLeague}
                value={`#${selectedLeague.leagueId}`}
                detail={getLocalizedViewLabel(
                  selectedLeague.latestViewKey,
                  selectedLeague.latestViewLabel,
                  locale,
                )}
              />
              <SummaryCard
                label={messages.summarySnapshot}
                value={getLocalizedViewLabel(selectedView.key, selectedView.label, locale)}
                detail={messages.updatedAt(formatDateTime(selectedView.scrapedAt, locale))}
              />
              <SummaryCard
                label={messages.summaryTeams}
                value={String(viewData.teams.length)}
                detail={messages.teamsShown(String(filteredTeams.length))}
              />
              <SummaryCard
                label={messages.summaryPrediction}
                value={topMomentum?.name ?? messages.waiting}
                detail={predictionHighlight}
              />
            </section>

            <section id={SECTION_IDS.standings} className={styles.section}>
              <SectionHeader
                eyebrow={messages.standingsEyebrow}
                title={messages.standingsTitle}
                description={messages.standingsDescription}
              />

              <div className={styles.standingsLayout}>
                <div className={styles.tableCard}>
                  <div className={styles.tableScroll}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>{messages.standingsTableRank}</th>
                          <th>{messages.standingsTableTeam}</th>
                          <th>{messages.standingsTableManager}</th>
                          <th>{messages.standingsTablePoints}</th>
                          <th>{messages.standingsTableTeamNo}</th>
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
                            <td>{team.teamName}</td>
                            <td>{team.manager}</td>
                            <td>{formatCount(team.totalPoints)}</td>
                            <td>{getTeamNumber(team)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <aside className={styles.detailPanel}>
                  {!selectedTeam ? (
                    <>
                      <h3>{messages.teamDetailsTitle}</h3>
                      <p>{messages.teamDetailsDescription}</p>
                    </>
                  ) : (
                    <>
                      <div className={styles.detailHeader}>
                        <div>
                          <span className={styles.badge}>{messages.selectedTeamBadge}</span>
                          <h3>{getTeamDetailName(selectedTeam)}</h3>
                          <p>{selectedTeam.manager}</p>
                        </div>
                        <div className={styles.detailRank}>
                          <strong>#{selectedTeam.rank}</strong>
                          <span>
                            {formatCount(selectedTeam.totalPoints)} {messages.pointsShort}
                          </span>
                        </div>
                      </div>

                      <div className={styles.detailPanelScroll}>
                        <div className={styles.detailGrid}>
                          <div>
                            <h4>{messages.driversLabel}</h4>
                            <ul className={styles.detailList}>
                              {selectedTeam.drivers.map((driver) => (
                                <li key={driver.name}>
                                  <span>{driver.name}</span>
                                  {driver.turbo ? (
                                    <span>{messages.turboShort}</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4>{messages.constructorsLabel}</h4>
                            <ul className={styles.detailList}>
                              {selectedTeam.constructors.map((constructorEntry) => (
                                <li key={constructorEntry.name}>
                                  <span>{constructorEntry.name}</span>
                                  {constructorEntry.points !== null &&
                                  constructorEntry.points !== undefined ? (
                                    <span>{formatCount(constructorEntry.points)}</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className={styles.detailStats}>
                          <div>
                            <span>{messages.chipUsageLabel}</span>
                            <strong>{getChipLabel(selectedTeam, messages)}</strong>
                          </div>
                          <div>
                            <span>{messages.transferStateLabel}</span>
                            <strong>
                              {formatCount(selectedTeam.transfer.made)} {messages.madeLabel} /{" "}
                              {formatCount(selectedTeam.transfer.allowed)} {messages.allowedLabel}
                            </strong>
                          </div>
                          <div>
                            <span>{messages.penaltyPointsLabel}</span>
                            <strong>{formatCount(selectedTeam.transfer.penaltyPoints)}</strong>
                          </div>
                          <div>
                            <span>{messages.costCapLabel}</span>
                            <strong>{selectedTeam.costCap ?? "--"}</strong>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </aside>
              </div>
            </section>

            <section id={SECTION_IDS.distribution} className={styles.section}>
              <SectionHeader
                eyebrow={messages.distributionEyebrow}
                title={messages.distributionTitle}
                description={messages.distributionDescription}
              />

              <div className={styles.summaryGrid}>
                <SummaryCard
                  label={messages.mostOwnedDriver}
                  value={topOwnedDriver?.name ?? "--"}
                  detail={
                    topOwnedDriver
                      ? `${formatPercent(topOwnedDriver.percentage)} ${messages.ownershipSuffix}`
                      : messages.noOwnershipData
                  }
                />
                <SummaryCard
                  label={messages.mostOwnedConstructor}
                  value={topOwnedConstructor?.name ?? "--"}
                  detail={
                    topOwnedConstructor
                      ? `${formatPercent(topOwnedConstructor.percentage)} ${messages.ownershipSuffix}`
                      : messages.noOwnershipData
                  }
                />
                <SummaryCard
                  label={messages.templateDrivers}
                  value={insightsData?.groups.template.drivers.length.toString() ?? "0"}
                  detail={insightsData?.groups.template.drivers.join(", ") ?? messages.noTemplateData}
                />
                <SummaryCard
                  label={messages.duplicateLineups}
                  value={String(insightsData?.groups.duplicateLineups.length ?? 0)}
                  detail={messages.duplicateLineupsDetail}
                />
              </div>

              <div className={styles.chartsGrid}>
                <StatBarList
                  title={messages.topDriverOwnership}
                  items={insightsData?.ownership.drivers.slice(0, 8) ?? []}
                  valueLabel={(entry) =>
                    `${formatPercent(entry.percentage)} · ${entry.count} ${messages.teamsSuffix}`
                  }
                />
                <StatBarList
                  title={messages.topConstructorOwnership}
                  items={insightsData?.ownership.constructors.slice(0, 8) ?? []}
                  valueLabel={(entry) =>
                    `${formatPercent(entry.percentage)} · ${entry.count} ${messages.teamsSuffix}`
                  }
                />
                <StatBarList
                  title={messages.chipUsageChart}
                  items={insightsData?.ownership.chips ?? []}
                  valueLabel={(entry) =>
                    `${formatPercent(entry.percentage)} · ${entry.count} ${messages.usesSuffix}`
                  }
                />
              </div>

              <div className={styles.twoColumnGrid}>
                <PairList
                  title={messages.mostCommonDriverPairs}
                  items={insightsData?.groups.mostCommonDriverPairs.slice(0, 5) ?? []}
                  messages={messages}
                />
                <PairList
                  title={messages.mostCommonConstructorPairs}
                  items={insightsData?.groups.mostCommonConstructorPairs.slice(0, 5) ?? []}
                  messages={messages}
                />
              </div>
            </section>

            <section id={SECTION_IDS.predictions} className={styles.section}>
              <SectionHeader
                eyebrow={messages.predictionsEyebrow}
                title={messages.predictionsTitle}
                description={messages.predictionsDescription}
              />

              <div className={styles.predictionHero}>
                <div>
                  <span className={styles.eyebrow}>{messages.currentHighlight}</span>
                  <h3>{predictionHighlight}</h3>
                  <p>
                    {messages.predictionsHero(
                      String(insightsData?.predictions.topTeamSampleSize ?? 0),
                    )}
                  </p>
                </div>
                <div
                  className={`${styles.toneBadge} ${
                    styles[getPredictionTone(topMomentum?.momentumScore)]
                  }`}
                >
                  {topMomentum?.momentumScore?.toFixed(1) ?? "--"} {messages.momentumSuffix}
                </div>
              </div>

              <div className={styles.twoColumnGrid}>
                <InsightTeamList
                  title={messages.mostUniqueTeams}
                  items={insightsData?.teamInsights.mostUniqueTeams.slice(0, 5) ?? []}
                  emphasis="unique"
                  messages={messages}
                />
                <InsightTeamList
                  title={messages.mostTemplateTeams}
                  items={insightsData?.teamInsights.mostTemplateTeams.slice(0, 5) ?? []}
                  emphasis="template"
                  messages={messages}
                />
              </div>

              <div className={styles.threeColumnGrid}>
                <PredictionList
                  title={messages.momentumPicks}
                  items={insightsData?.predictions.pickMomentum.slice(0, 6) ?? []}
                  locale={locale}
                  messages={messages}
                />
                <PredictionList
                  title={messages.underownedTopPicks}
                  items={insightsData?.predictions.underownedTopPicks.slice(0, 6) ?? []}
                  locale={locale}
                  messages={messages}
                />
                <PredictionList
                  title={messages.overexposedPicks}
                  items={insightsData?.predictions.overexposedPicks.slice(0, 6) ?? []}
                  locale={locale}
                  messages={messages}
                />
              </div>

              <div className={styles.twoColumnGrid}>
                <PredictionList
                  title={messages.leaderDifferentials}
                  items={insightsData?.predictions.leaderDifferentials.slice(0, 6) ?? []}
                  locale={locale}
                  messages={messages}
                />
                <article className={styles.subSectionCard}>
                  <h3>{messages.leaderOverlap}</h3>
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
                          {messages.leaderOverlapDetail(
                            team.overlapCount,
                            team.matchingDrivers.length,
                            team.matchingConstructors.length,
                          )}
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
    </div>
  );
}
