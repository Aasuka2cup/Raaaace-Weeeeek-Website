export interface LeagueManifest {
  schemaVersion: number;
  generatedAt: string;
  sourceRepo?: string;
  sourceCommit?: string;
  leagues: ExportedLeague[];
}

export interface ExportedLeague {
  leagueId: string;
  leagueUrl: string;
  latestViewKey: string;
  latestViewLabel: string;
  views: LeagueViewReference[];
}

export interface LeagueViewReference {
  key: string;
  label: string;
  targetRace: string | null;
  teamCount: number;
  scrapedAt: string;
  file: string;
  insightFile?: string | null;
  sourceFile: string;
}

export interface DriverPick {
  name: string;
  points: number | null;
  turbo?: boolean;
}

export interface ConstructorPick {
  name: string;
  points: number | null;
}

export interface TeamLineup {
  drivers: string[];
  constructors: string[];
}

export interface TeamChips {
  x3Boost: boolean;
  x3BoostDriver: string | null;
  noNegative: boolean;
  wildcard: boolean;
  limitless: boolean;
  finalFix: boolean;
  autopilot: boolean;
  used: string[];
}

export interface TeamTransfer {
  made: number | null;
  allowed: number | null;
  remaining: number | null;
  excess: number | null;
  overLimit: boolean;
  penaltyPerTransfer: number | null;
  penaltyPoints: number | null;
}

export interface TeamEntry {
  rank: number;
  teamName: string;
  manager: string;
  detailTeamName?: string;
  lineup: TeamLineup;
  totalPoints?: number | null;
  costCap?: string | null;
  limitless?: boolean;
  chip?: string | null;
  chips: TeamChips;
  turboDriver?: string | null;
  x3BoostDriver?: string | null;
  excessTransfers?: number | null;
  transfer: TeamTransfer;
  drivers: DriverPick[];
  constructors: ConstructorPick[];
}

export interface LeagueViewData {
  schemaVersion?: number;
  exportedAt?: string;
  leagueId?: string;
  leagueUrl: string;
  scrapedAt: string;
  targetRace: string | null;
  viewKey?: string;
  viewLabel?: string;
  teamCount?: number;
  sourceFile?: string;
  teams: TeamEntry[];
}

export interface OwnershipEntry {
  name: string;
  count: number;
  percentage: number;
  topTeamCount?: number;
  topTeamPercentage?: number;
  turboCount?: number;
  x3BoostCount?: number;
}

export interface PairEntry {
  names: string[];
  count: number;
  percentage: number;
}

export interface TeamInsightEntry {
  rank: number;
  teamName: string;
  manager: string;
  totalPoints: number;
  uniqueDriverCount?: number;
  uniqueConstructorCount?: number;
  uniquePickCount?: number;
  lowOwnedDrivers?: string[];
  lowOwnedConstructors?: string[];
  averagePickOwnership?: number;
}

export interface LeaderOverlapEntry {
  rank: number;
  teamName: string;
  manager: string;
  totalPoints: number;
  matchingDrivers: string[];
  matchingConstructors: string[];
  overlapCount: number;
  overlapPercentage: number;
}

export interface PredictionEntry {
  name: string;
  type: "driver" | "constructor";
  overallCount: number;
  overallPercentage: number;
  topTeamCount?: number;
  topTeamPercentage?: number;
  momentumScore?: number;
}

export interface InsightsFeatureInput {
  source: string;
  viewFile?: string;
  insightFile?: string;
}

export interface LeagueInsightsData {
  schemaVersion: number;
  exportedAt: string;
  leagueId: string;
  leagueUrl: string;
  scrapedAt: string;
  targetRace: string | null;
  viewKey: string;
  viewLabel: string;
  teamCount: number;
  sourceFile: string;
  generatedFrom: {
    viewFile: string;
    insightFile: string;
  };
  featureInputs: {
    allTeamPicks: InsightsFeatureInput;
    pickDistribution: InsightsFeatureInput;
    predictions: InsightsFeatureInput;
  };
  ownership: {
    drivers: OwnershipEntry[];
    constructors: OwnershipEntry[];
    chips: OwnershipEntry[];
  };
  groups: {
    template: TeamLineup;
    mostCommonDriverPairs: PairEntry[];
    mostCommonConstructorPairs: PairEntry[];
    duplicateLineups: Array<Record<string, unknown>>;
  };
  teamInsights: {
    mostUniqueTeams: TeamInsightEntry[];
    mostTemplateTeams: TeamInsightEntry[];
    leaderOverlap: LeaderOverlapEntry[];
  };
  predictions: {
    method: string;
    topTeamSampleSize: number;
    pickMomentum: PredictionEntry[];
    underownedTopPicks: PredictionEntry[];
    overexposedPicks: PredictionEntry[];
    leaderDifferentials: PredictionEntry[];
  };
}
