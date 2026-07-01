/**
 * Current schema version of the ReportData model.
 * Increment when making structural changes to the data.js format.
 */
export const CURRENT_REPORT_DATA_SCHEMA_VERSION = 1;

/**
 * Shape of the aggregated report data embedded in data.js as
 * `window.__SERENITY_REPORT_DATA__`.
 *
 * Used by both the report template at runtime and by test factories
 * to keep mocks in sync with the real data structure.
 */
export interface ReportData {
    schemaVersion: number;
    summary: ReportSummary;
    scenarios: ReportScenario[];
    history: ReportHistoryEntry[];
    tags: ReportTag[];
    inconsistentTests: ReportInconsistentTest[];
    newFailures: ReportScenarioRef[];
    newPasses: ReportScenarioRef[];
    systemContext?: ReportSystemContext;
    capabilities?: ReportCapabilityNode;
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
    retries?: number;
    attempts?: ReportAttempt[];
    cast?: Array<{ name: string; abilities: Array<{ name: string; details?: string }> }>;
    video?: string;
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
    type?: string;
    name: string;
    outcome: string;
    duration?: number;
    startedAt?: string;
    children: ReportActivity[];
    location?: { path: string; line: number; column: number };
    error?: ReportError;
    artifacts?: Array<{ path: string; type: string; activityId?: string }>;
    restQuery?: ReportRestQuery;
    reportData?: ReportDataEntry[];
    dataTable?: string[][];
    docString?: string;
}

export interface ReportRestQuery {
    method: string;
    url: string;
    requestHeaders: string;
    requestBody?: string;
    statusCode: number;
    responseHeaders: string;
    responseBody?: string;
}

export interface ReportDataEntry {
    title: string;
    contents: string;
    contentType?: string;
}

export interface ReportExecutionHistoryEntry {
    outcome: string;
    run: string;
    timestamp?: string;
    duration?: number;
    activities?: ReportActivity[];
    error?: ReportError;
    retries?: number;
    attempts?: ReportAttempt[];
}

export interface ReportError {
    name: string;
    message: string;
    stack?: string;
}

export interface ReportAttempt {
    attemptNumber: number;
    outcome: string;
    duration: number;
    activities: ReportActivity[];
    error?: ReportError;
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
    score?: ReportHistoryScore;
}

export interface ReportHistoryScore {
    confidence: number;   // 0–100
    passRate: number;     // 0–100
    consistency: number;    // 0–100
    completeness: number; // 0–100
}

export interface ReportTag {
    type: string;
    name: string;
    scenarioCount: number;
    passed: number;
}

export interface ReportInconsistentTest {
    name: string;
    category: string;
    source: ReportSource;
    inconsistencyRate: number;
    history: string[];
    labels: string[];
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

export interface ReportCapabilityNode {
    type: 'directory' | 'file';
    name: string;
    displayName?: string;
    outcomes: ReportOutcomes;
    scenarioCount?: number;
    children?: ReportCapabilityNode[];
    readme?: string;
    narrative?: string;
    scenarios?: Array<{ name: string; outcome: string; executionHistory?: string[] }>;
    score?: CapabilityScore;
    delta?: number;
}

export interface CapabilityScore {
    confidence: number;   // 0–100 composite
    passRate: number;     // 0–100
    completeness: number; // 0–100
    consistency: number;    // 0–100
}
