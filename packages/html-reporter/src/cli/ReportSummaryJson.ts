/**
 * Machine-readable summary of the aggregated test report.
 *
 * Written as `summary.json` alongside `index.html` during report aggregation.
 * Designed for consumption by AI agents, CI bots, and custom tooling without
 * requiring JavaScript execution or HTML parsing.
 *
 * Discoverable via `<link rel="alternate" type="application/json" href="summary.json">`
 * in the generated `index.html`.
 */
export interface ReportSummaryJson {
    /** ISO 8601 timestamp when this summary was generated */
    generated: string;

    /** Report title (from config or auto-detected) */
    title: string;

    /** Schema version for forward compatibility */
    schemaVersion: number;

    /** Summary of the latest (or selected) test run */
    latestRun: SummaryRunInfo;

    /** Total number of historical test runs in the report */
    runs: number;

    /** Failures grouped by error fingerprint (only present when failures > 0) */
    failureClusters: FailureCluster[];

    /** Cross-run consistency classification counts */
    consistency: SummaryConsistency;

    /** Composite quality scores (0–100) */
    scores: SummaryScores;
}

export interface SummaryRunInfo {
    /** ISO 8601 timestamp when the run started */
    timestamp: string;

    /** Human-readable run label (e.g. "#8300" or "17 Jul 2026 14:50") */
    label: string;

    /** Outcome totals */
    totals: SummaryTotals;

    /** Total execution duration in milliseconds */
    duration: number;
}

export interface SummaryTotals {
    passed: number;
    failed: number;
    pending: number;
    skipped: number;
    compromised: number;
    error: number;
}

export interface FailureCluster {
    /** Stable identifier for this error group (normalised from error type + message) */
    fingerprint: string;

    /** Error class/type name (e.g. "AssertionError", "TimeoutError") */
    errorType: string;

    /** Normalised error message (ANSI stripped, paths stripped, truncated) */
    message: string;

    /** Scenarios that share this error fingerprint */
    scenarios: FailureClusterScenario[];
}

export interface FailureClusterScenario {
    /** Scenario name */
    name: string;

    /** Source location (relative path:line) */
    source: string;

    /** Browser/project identifier if available */
    browser?: string;

    /** Name of the deepest failing activity in the scenario's activity tree */
    failingStep?: string;
}

export interface SummaryConsistency {
    /** Tests that pass only via retry (build green, test unreliable) */
    flaky: number;

    /** Tests whose final outcome differs across runs */
    inconsistent: number;

    /** Tests that were passing, now failing */
    degraded: number;

    /** Tests that were failing, now pass cleanly */
    recovered: number;
}

export interface SummaryScores {
    /** Composite confidence score (0–100) */
    confidence: number;

    /** Percentage of executed scenarios passing (0–100) */
    passRate: number;

    /** Percentage of scenarios implemented (0–100) */
    completeness: number;

    /** Outcome repeatability across runs (0–100) */
    consistency: number;
}
