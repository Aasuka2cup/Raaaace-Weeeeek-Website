export type Locale = "en" | "zh";
export type Theme = "dark" | "light";

export const STORAGE_KEYS = {
  locale: "f1fantasy-locale",
  theme: "f1fantasy-theme",
} as const;

export const SECTION_IDS = {
  intro: "intro",
  controls: "controls",
  summary: "summary",
  standings: "standings",
  distribution: "distribution",
  predictions: "predictions",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

type DynamicString = (value?: string | number) => string;

export interface DashboardMessages {
  localeLabel: string;
  themeLabel: string;
  githubLabel: string;
  navLabel: string;
  mobileNavOpen: string;
  mobileNavClose: string;
  themeDark: string;
  themeLight: string;
  langEnglish: string;
  langChinese: string;
  siteTitleEyebrow: string;
  siteTitle: string;
  siteDescription: string;
  domainPill: string;
  heroMeta: string;
  navIntro: string;
  navControls: string;
  navSummary: string;
  navStandings: string;
  navDistribution: string;
  navPredictions: string;
  controlsEyebrow: string;
  controlsTitle: string;
  controlsDescription: string;
  leagueLabel: string;
  snapshotLabel: string;
  searchLabel: string;
  managerLabel: string;
  sortLabel: string;
  searchPlaceholder: string;
  allManagers: string;
  sortRank: string;
  sortPoints: string;
  sortManager: string;
  loadingMessage: string;
  errorTitle: string;
  summaryLeague: string;
  summarySnapshot: string;
  summaryTeams: string;
  summaryPrediction: string;
  teamsShown: DynamicString;
  updatedAt: DynamicString;
  waiting: string;
  standingsEyebrow: string;
  standingsTitle: string;
  standingsDescription: string;
  standingsTableRank: string;
  standingsTableTeam: string;
  standingsTableManager: string;
  standingsTablePoints: string;
  standingsTableTeamNo: string;
  standingsTableConstructors: string;
  standingsTableStrategy: string;
  teamDetailsTitle: string;
  teamDetailsDescription: string;
  selectedTeamBadge: string;
  teamChangesLink: string;
  teamSeasonLink: string;
  backToDashboard: string;
  backToChanges: string;
  seasonChangesTitle: string;
  seasonChangesDescription: string;
  seasonTeamTitle: string;
  seasonTeamDescription: string;
  seasonSnapshotsLabel: string;
  seasonLatestDeltaLabel: string;
  seasonLatestRaceLabel: string;
  seasonViewTimeline: string;
  seasonNoData: string;
  seasonNoTeamFound: string;
  seasonDriversIn: string;
  seasonDriversOut: string;
  seasonConstructorsIn: string;
  seasonConstructorsOut: string;
  seasonNoChanges: string;
  driversLabel: string;
  constructorsLabel: string;
  chipUsageLabel: string;
  transferStateLabel: string;
  penaltyPointsLabel: string;
  costCapLabel: string;
  turboShort: string;
  noChipUsed: string;
  turboPrefix: string;
  pointsShort: string;
  madeLabel: string;
  allowedLabel: string;
  distributionEyebrow: string;
  distributionTitle: string;
  distributionDescription: string;
  mostOwnedDriver: string;
  mostOwnedConstructor: string;
  templateDrivers: string;
  duplicateLineups: string;
  noOwnershipData: string;
  noTemplateData: string;
  duplicateLineupsDetail: string;
  topDriverOwnership: string;
  topConstructorOwnership: string;
  chipUsageChart: string;
  mostCommonDriverPairs: string;
  mostCommonConstructorPairs: string;
  teamsShareCombination: DynamicString;
  ownershipSuffix: string;
  teamsSuffix: string;
  usesSuffix: string;
  predictionsEyebrow: string;
  predictionsTitle: string;
  predictionsDescription: string;
  currentHighlight: string;
  predictionsHero: DynamicString;
  momentumSuffix: string;
  mostUniqueTeams: string;
  mostTemplateTeams: string;
  momentumPicks: string;
  underownedTopPicks: string;
  overexposedPicks: string;
  leaderDifferentials: string;
  leaderOverlap: string;
  uniqueTeamDetail: (count: number, ownership: string) => string;
  templateTeamDetail: (ownership: string, points: number) => string;
  predictionItemDetail: (
    overall: string,
    topTeam: string | null,
    momentum: string | null,
  ) => string;
  leaderOverlapDetail: (overlapCount: number, drivers: number, constructors: number) => string;
  predictionSignal: DynamicString;
  predictionHighlightFallback: string;
  leagueNumber: DynamicString;
}

export const DASHBOARD_MESSAGES: Record<Locale, DashboardMessages> = {
  en: {
    localeLabel: "Language",
    themeLabel: "Theme",
    githubLabel: "GitHub",
    navLabel: "Section navigation",
    mobileNavOpen: "Open navigation",
    mobileNavClose: "Close navigation",
    themeDark: "Dark",
    themeLight: "Light",
    langEnglish: "EN",
    langChinese: "中文",
    siteTitleEyebrow: "F1 Fantasy League Analysis",
    siteTitle: "F1 Fantasy League Raaaace Weeeeek Dashboard",
    siteDescription: "Picks, Trends, & Prediction",
    domainPill: "Live on f1fantasy.aasuka.com",
    heroMeta:
      "Data is served from the static package under /data/league-data, so the site stays lightweight and deployment-friendly.",
    navIntro: "Intro",
    navControls: "Filters",
    navSummary: "Summary",
    navStandings: "Standings",
    navDistribution: "Distribution",
    navPredictions: "Predictions",
    controlsEyebrow: "Navigation",
    controlsTitle: "League and snapshot selection",
    controlsDescription:
      "The dashboard is driven by the exported manifest, so each view reflects a real strategist snapshot.",
    leagueLabel: "League",
    snapshotLabel: "Snapshot",
    searchLabel: "Search teams",
    managerLabel: "Manager",
    sortLabel: "Sort standings",
    searchPlaceholder: "Team name or manager",
    allManagers: "All managers",
    sortRank: "By rank",
    sortPoints: "By points",
    sortManager: "By manager",
    loadingMessage: "Loading the latest league package...",
    errorTitle: "Data load issue",
    summaryLeague: "League",
    summarySnapshot: "Snapshot",
    summaryTeams: "Teams tracked",
    summaryPrediction: "Prediction signal",
    teamsShown: (value) => `${value} shown after filters`,
    updatedAt: (value) => `Updated ${value}`,
    waiting: "Waiting",
    standingsEyebrow: "All Team Picks",
    standingsTitle: "Standings and roster view",
    standingsDescription:
      "Use the filters to compare managers, inspect lineups, and see how chip usage and transfers map to league rank.",
    standingsTableRank: "Rank",
    standingsTableTeam: "Team",
    standingsTableManager: "Manager",
    standingsTablePoints: "Points",
    standingsTableTeamNo: "TeamNo",
    standingsTableConstructors: "Constructors",
    standingsTableStrategy: "Chip / strategy",
    teamDetailsTitle: "Team details",
    teamDetailsDescription:
      "Select a team to inspect its lineup, chip usage, and transfer state.",
    selectedTeamBadge: "Selected team",
    teamChangesLink: "Team changes",
    teamSeasonLink: "Open season page",
    backToDashboard: "Back to dashboard",
    backToChanges: "Back to team changes",
    seasonChangesTitle: "Season team changes",
    seasonChangesDescription:
      "Track every fantasy team across the exported race snapshots and jump into a dedicated season history page.",
    seasonTeamTitle: "Season team history",
    seasonTeamDescription:
      "Review lineup, rank, points, chip usage, and transfer changes for this team across the full season timeline.",
    seasonSnapshotsLabel: "Race snapshots",
    seasonLatestDeltaLabel: "Latest delta",
    seasonLatestRaceLabel: "Latest race",
    seasonViewTimeline: "Race timeline",
    seasonNoData: "No season snapshots are available for this league yet.",
    seasonNoTeamFound: "This team could not be matched to a season history page.",
    seasonDriversIn: "Drivers in",
    seasonDriversOut: "Drivers out",
    seasonConstructorsIn: "Constructors in",
    seasonConstructorsOut: "Constructors out",
    seasonNoChanges: "No roster changes for this race.",
    driversLabel: "Drivers",
    constructorsLabel: "Constructors",
    chipUsageLabel: "Chip usage",
    transferStateLabel: "Transfer state",
    penaltyPointsLabel: "Penalty points",
    costCapLabel: "Cost cap",
    turboShort: "Turbo",
    noChipUsed: "No chip used",
    turboPrefix: "Turbo",
    pointsShort: "pts",
    madeLabel: "made",
    allowedLabel: "allowed",
    distributionEyebrow: "Pick Distribution",
    distributionTitle: "Ownership, template patterns, and recurring combinations",
    distributionDescription:
      "These sections use the exported insights file to surface the most common choices, pairings, and template structure.",
    mostOwnedDriver: "Most owned driver",
    mostOwnedConstructor: "Most owned constructor",
    templateDrivers: "Template drivers",
    duplicateLineups: "Duplicate lineups",
    noOwnershipData: "No ownership data",
    noTemplateData: "No template data",
    duplicateLineupsDetail:
      "Useful for spotting how concentrated the field really is.",
    topDriverOwnership: "Top driver ownership",
    topConstructorOwnership: "Top constructor ownership",
    chipUsageChart: "Chip usage",
    mostCommonDriverPairs: "Most common driver pairs",
    mostCommonConstructorPairs: "Most common constructor pairs",
    teamsShareCombination: (value) => `${value} teams share this combination.`,
    ownershipSuffix: "ownership",
    teamsSuffix: "teams",
    usesSuffix: "uses",
    predictionsEyebrow: "Predictions & Insights",
    predictionsTitle: "Momentum signals and team-level interpretation",
    predictionsDescription:
      "The prediction layer stays heuristic by design, giving you a league-relative read on underowned plays, overexposed picks, and leader overlap.",
    currentHighlight: "Current highlight",
    predictionsHero: (value) =>
      `Based on a top-team sample of ${value}, this highlights which picks are over-performing relative to overall league ownership.`,
    momentumSuffix: "momentum",
    mostUniqueTeams: "Most unique teams",
    mostTemplateTeams: "Most template teams",
    momentumPicks: "Momentum picks",
    underownedTopPicks: "Underowned top-team picks",
    overexposedPicks: "Overexposed picks",
    leaderDifferentials: "Leader differentials",
    leaderOverlap: "Leader overlap",
    uniqueTeamDetail: (count, ownership) =>
      `${count} unique picks, average ownership ${ownership}.`,
    templateTeamDetail: (ownership, points) =>
      `${ownership} average ownership with ${points} points.`,
    predictionItemDetail: (overall, topTeam, momentum) =>
      `League ownership ${overall}${topTeam ? `, top-team ownership ${topTeam}` : ""}${momentum ? `, momentum ${momentum}` : ""}.`,
    leaderOverlapDetail: (overlapCount, drivers, constructors) =>
      `${overlapCount} shared picks with the leader across ${drivers} drivers and ${constructors} constructors.`,
    predictionSignal: (value) => `${value} has the strongest momentum among top teams.`,
    predictionHighlightFallback: "No prediction highlights available yet.",
    leagueNumber: (value) => `League ${value}`,
  },
  zh: {
    localeLabel: "语言",
    themeLabel: "主题",
    githubLabel: "GitHub",
    navLabel: "页面导航",
    mobileNavOpen: "打开导航",
    mobileNavClose: "关闭导航",
    themeDark: "深色",
    themeLight: "浅色",
    langEnglish: "EN",
    langChinese: "中文",
    siteTitleEyebrow: "F1 Fantasy 联盟分析",
    siteTitle: "F1 Fantasy League Raaaace Weeeeek Dashboard",
    siteDescription: "Picks, Trends, & Prediction",
    domainPill: "部署地址 f1fantasy.aasuka.com",
    heroMeta:
      "数据通过 /data/league-data 下的静态包提供，因此网站保持轻量，也方便持续部署。",
    navIntro: "介绍",
    navControls: "筛选",
    navSummary: "摘要",
    navStandings: "排名",
    navDistribution: "分布",
    navPredictions: "预测",
    controlsEyebrow: "导航",
    controlsTitle: "联盟与快照选择",
    controlsDescription:
      "仪表盘由导出的 manifest 驱动，因此每个视图都对应真实的 strategist 快照。",
    leagueLabel: "联盟",
    snapshotLabel: "快照",
    searchLabel: "搜索队伍",
    managerLabel: "经理",
    sortLabel: "排名排序",
    searchPlaceholder: "队伍名或经理名",
    allManagers: "全部经理",
    sortRank: "按排名",
    sortPoints: "按积分",
    sortManager: "按经理",
    loadingMessage: "正在加载最新联盟数据包...",
    errorTitle: "数据加载问题",
    summaryLeague: "联盟",
    summarySnapshot: "快照",
    summaryTeams: "队伍数量",
    summaryPrediction: "预测信号",
    teamsShown: (value) => `筛选后显示 ${value} 支队伍`,
    updatedAt: (value) => `更新于 ${value}`,
    waiting: "等待中",
    standingsEyebrow: "全部阵容",
    standingsTitle: "排名与阵容视图",
    standingsDescription:
      "使用筛选器比较经理、查看阵容，并观察 chip 使用和换人与联盟排名之间的关系。",
    standingsTableRank: "排名",
    standingsTableTeam: "队伍",
    standingsTableManager: "经理",
    standingsTablePoints: "积分",
    standingsTableTeamNo: "队号",
    standingsTableConstructors: "车队",
    standingsTableStrategy: "Chip / 策略",
    teamDetailsTitle: "队伍详情",
    teamDetailsDescription: "选择一支队伍以查看其阵容、chip 使用情况和换人状态。",
    selectedTeamBadge: "当前选中队伍",
    teamChangesLink: "队伍变化",
    teamSeasonLink: "打开赛季页面",
    backToDashboard: "返回仪表盘",
    backToChanges: "返回队伍变化页",
    seasonChangesTitle: "赛季队伍变化",
    seasonChangesDescription:
      "追踪每支 fantasy 队伍在各个导出比赛快照中的变化，并跳转到专属的赛季历史页面。",
    seasonTeamTitle: "赛季队伍历史",
    seasonTeamDescription:
      "查看这支队伍在整个赛季时间线中的阵容、排名、积分、chip 使用和换人变化。",
    seasonSnapshotsLabel: "比赛快照",
    seasonLatestDeltaLabel: "最近变化",
    seasonLatestRaceLabel: "最近比赛",
    seasonViewTimeline: "比赛时间线",
    seasonNoData: "这个联盟目前还没有可用的赛季快照。",
    seasonNoTeamFound: "无法为这支队伍匹配到赛季历史页面。",
    seasonDriversIn: "新增车手",
    seasonDriversOut: "移出车手",
    seasonConstructorsIn: "新增车队",
    seasonConstructorsOut: "移出车队",
    seasonNoChanges: "这一站没有阵容变化。",
    driversLabel: "车手",
    constructorsLabel: "车队",
    chipUsageLabel: "Chip 使用",
    transferStateLabel: "换人状态",
    penaltyPointsLabel: "罚分",
    costCapLabel: "预算空间",
    turboShort: "Turbo",
    noChipUsed: "未使用 chip",
    turboPrefix: "Turbo",
    pointsShort: "分",
    madeLabel: "已换",
    allowedLabel: "可换",
    distributionEyebrow: "持有率分布",
    distributionTitle: "持有率、模板阵容与常见组合",
    distributionDescription:
      "这些模块使用导出的 insights 文件，帮助你快速识别最常见的选择、配对以及模板结构。",
    mostOwnedDriver: "持有率最高车手",
    mostOwnedConstructor: "持有率最高车队",
    templateDrivers: "模板车手",
    duplicateLineups: "重复阵容",
    noOwnershipData: "暂无持有率数据",
    noTemplateData: "暂无模板数据",
    duplicateLineupsDetail: "适合用来判断联盟的选择是否过于集中。",
    topDriverOwnership: "车手持有率排行",
    topConstructorOwnership: "车队持有率排行",
    chipUsageChart: "Chip 使用情况",
    mostCommonDriverPairs: "最常见车手组合",
    mostCommonConstructorPairs: "最常见车队组合",
    teamsShareCombination: (value) => `${value} 支队伍拥有这个组合。`,
    ownershipSuffix: "持有率",
    teamsSuffix: "支队伍",
    usesSuffix: "次使用",
    predictionsEyebrow: "预测与洞察",
    predictionsTitle: "趋势信号与队伍层面的解读",
    predictionsDescription:
      "预测层保持启发式分析，帮助你从联盟相对视角理解低持有率强势选择、过度暴露选择以及与榜首阵容的重合度。",
    currentHighlight: "当前重点",
    predictionsHero: (value) =>
      `基于前列队伍样本数 ${value}，这里突出显示哪些选择相对整体联盟持有率更强势。`,
    momentumSuffix: "动量",
    mostUniqueTeams: "最独特队伍",
    mostTemplateTeams: "最模板化队伍",
    momentumPicks: "动量选择",
    underownedTopPicks: "低持有率高表现选择",
    overexposedPicks: "过度暴露选择",
    leaderDifferentials: "榜首差异选择",
    leaderOverlap: "与榜首重合度",
    uniqueTeamDetail: (count, ownership) =>
      `${count} 个独特选择，平均持有率 ${ownership}。`,
    templateTeamDetail: (ownership, points) =>
      `平均持有率 ${ownership}，当前积分 ${points}。`,
    predictionItemDetail: (overall, topTeam, momentum) =>
      `联盟持有率 ${overall}${topTeam ? `，前列队伍持有率 ${topTeam}` : ""}${momentum ? `，动量 ${momentum}` : ""}。`,
    leaderOverlapDetail: (overlapCount, drivers, constructors) =>
      `与榜首共有 ${overlapCount} 个相同选择，其中包括 ${drivers} 位车手和 ${constructors} 支车队。`,
    predictionSignal: (value) => `${value} 是当前前列队伍中最强的动量信号。`,
    predictionHighlightFallback: "暂无可显示的预测亮点。",
    leagueNumber: (value) => `联盟 ${value}`,
  },
};
