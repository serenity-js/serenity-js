/**
 * Shape of the aggregated report data embedded in data.js as
 * `window.__SERENITY_REPORT_DATA__`.
 *
 * Used by both the report template at runtime and by test factories
 * to keep mocks in sync with the real data structure.
 */
export interface ReportData {
    summary: ReportSummary;
    scenarios: ReportScenario[];
    history: ReportHistoryEntry[];
    tags: ReportTag[];
    unstableTests: ReportUnstableTest[];
    newFailures: ReportScenarioRef[];
    newPasses: ReportScenarioRef[];
    systemContext?: ReportSystemContext;
    requirements?: ReportRequirementNode;
}

export interface ReportSummary {
    title: string;
    totalScenarios: number;
    outcomes: ReportOutcomes;
    duration: number;
    startedAt: string;
    finishedAt: string;
    testRunner: string;
}

export interface ReportOutcomes {
    passed: number;
    failed: number;
    pending: number;
    skipped: number;
    compromised: number;
    error: number;
}

export interface ReportScenario {
    name: string;
    category: string;
    outcome: string;
    duration: number;
    startedAt: string;
    source: ReportSource;
    tags: ReportScenarioTag[];
    activities: ReportActivity[];
    executionHistory: ReportExecutionHistoryEntry[];
    error?: ReportError;
    narrative?: string;
    description?: string;
    scenarioOutline?: ReportScenarioOutline;
}

export interface ReportSource {
    path: string;
    line?: number;
}

export interface ReportScenarioTag {
    type: string;
    name: string;
}

export interface ReportActivity {
    name: string;
    outcome: string;
    duration?: number;
    children: ReportActivity[];
    artifact?: string;
}

export interface ReportExecutionHistoryEntry {
    outcome: string;
    run: string;
}

export interface ReportError {
    name: string;
    message: string;
    stack?: string;
}

export interface ReportScenarioOutline {
    template: string;
    parameters: ReportParameterSet[];
}

export interface ReportParameterSet {
    name?: string;
    description?: string;
    outcome: string;
    activities: ReportActivity[];
    values: Record<string, string>;
}

export interface ReportHistoryEntry {
    timestamp: string;
    duration: number;
    outcomes: ReportOutcomes;
    label: string;
    slowest: number;
    fastest: number;
    average: number;
    commit?: string;
    branch?: string;
    ciJobUrl?: string;
    repositoryUrl?: string;
}

export interface ReportTag {
    type: string;
    name: string;
    scenarioCount: number;
    passed: number;
}

export interface ReportUnstableTest {
    name: string;
    category: string;
    source: ReportSource;
    flakinessRate: number;
}

export interface ReportScenarioRef {
    name: string;
    category: string;
    source: ReportSource;
}

export interface ReportSystemContext {
    nodeVersion: string;
    os: { name: string; version: string; arch: string };
    serenityVersion: string;
    testRunner: { name: string; version: string };
    browsers: Array<{ name: string; version: string }>;
    ci?: ReportCIContext;
    projectName?: string;
    packageManager?: string;
    environmentUnderTest?: string;
}

export interface ReportCIContext {
    provider: string;
    buildNumber: string;
    branch: string;
    commit: string;
    commitMessage?: string;
    commitAuthor?: string;
    jobUrl?: string;
    workflow?: string;
    repositoryUrl?: string;
    baseBranch?: string;
    pullRequestNumber?: string;
    pullRequestUrl?: string;
    triggeredBy?: string;
}

export interface ReportRequirementNode {
    type: 'directory' | 'file';
    name: string;
    displayName?: string;
    outcomes: ReportOutcomes;
    scenarioCount?: number;
    children?: ReportRequirementNode[];
    readme?: string;
    narrative?: string;
    scenarios?: Array<{ name: string; outcome: string }>;
}
