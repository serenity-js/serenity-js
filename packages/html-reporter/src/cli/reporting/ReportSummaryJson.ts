import { z } from 'zod';

// ===== Zod Schemas =====

export const SummaryTotalsSchema = z.object({
    passed: z.number().int().min(0),
    failed: z.number().int().min(0),
    pending: z.number().int().min(0),
    skipped: z.number().int().min(0),
    compromised: z.number().int().min(0),
    error: z.number().int().min(0),
}).describe('Outcome counts for the test run');

export const SummaryRunInfoSchema = z.object({
    timestamp: z.string().datetime().describe('ISO 8601 timestamp when the run started'),
    label: z.string().describe('Human-readable run label (e.g. "#8300", "17 Jul 2026 14:50")'),
    totals: SummaryTotalsSchema,
    duration: z.number().int().min(0).describe('Total execution duration in milliseconds'),
}).describe('Summary of a single test run');

export const FailureClusterScenarioSchema = z.object({
    name: z.string().describe('Scenario name'),
    source: z.string().describe('Source location as relative path:line (e.g. "spec/login.spec.ts:42")'),
    browser: z.string().optional().describe('Browser/project identifier (e.g. "chromium 149.0.7827.55")'),
    failingStep: z.string().optional().describe('Name of the deepest failing activity in the activity tree'),
}).describe('A scenario within a failure cluster');

export const FailureClusterSchema = z.object({
    fingerprint: z.string().describe('Stable identifier for this error group (normalised from error type + message)'),
    errorType: z.string().describe('Error class/type name (e.g. "AssertionError", "TimeoutError")'),
    message: z.string().describe('Normalised error message (ANSI stripped, absolute paths stripped, truncated to 200 chars)'),
    scenarios: z.array(FailureClusterScenarioSchema).min(1),
}).describe('A group of scenarios sharing the same error fingerprint');

export const ConsistencyScenarioRefSchema = z.object({
    name: z.string().describe('Scenario name'),
    source: z.string().describe('Source location as relative path:line'),
    browser: z.string().optional().describe('Browser/project identifier'),
}).describe('A scenario with a consistency classification');

export const SummaryConsistencySchema = z.object({
    flaky: z.array(ConsistencyScenarioRefSchema).describe('Tests that pass only via retry (build green, test unreliable)'),
    inconsistent: z.array(ConsistencyScenarioRefSchema).describe('Tests whose final outcome differs across runs'),
    degraded: z.array(ConsistencyScenarioRefSchema).describe('Tests that were passing, now failing'),
    recovered: z.array(ConsistencyScenarioRefSchema).describe('Tests that were failing, now pass cleanly'),
}).describe('Cross-run consistency classifications with affected test references');

export const SummaryScoresSchema = z.object({
    confidence: z.number().min(0).max(100).describe('Composite confidence score: passRate × 0.40 + completeness × 0.25 + consistency × 0.35'),
    passRate: z.number().min(0).max(100).describe('Percentage of executed scenarios passing'),
    completeness: z.number().min(0).max(100).describe('Percentage of scenarios that are implemented (not pending/skipped)'),
    consistency: z.number().min(0).max(100).describe('Outcome repeatability across runs'),
}).describe('Composite quality scores (0–100)');

export const SummaryModuleSchema = z.object({
    id: z.string().describe('Module identifier (e.g. "@integration/playwright-web")'),
    outcome: z.enum(['passed', 'failed', 'incomplete']).describe('Overall module outcome'),
    tests: z.number().int().min(0).describe('Number of test scenarios in this module'),
    passed: z.number().int().min(0).describe('Number of passing scenarios'),
    failed: z.number().int().min(0).describe('Number of failing scenarios (failed + error + compromised)'),
    duration: z.number().int().min(0).optional().describe('Module execution duration in milliseconds'),
    startedAt: z.string().describe('ISO 8601 timestamp when the module started'),
    finishedAt: z.string().optional().describe('ISO 8601 timestamp when the module finished (absent for incomplete modules)'),
}).describe('Per-module outcome summary');

export const ReportSummaryJsonSchema = z.object({
    generated: z.string().datetime().describe('ISO 8601 timestamp when this summary was generated'),
    title: z.string().describe('Report title (from config or auto-detected)'),
    schemaVersion: z.number().int().min(1).describe('Schema version for forward compatibility'),
    latestRun: SummaryRunInfoSchema,
    runs: z.number().int().min(1).describe('Total number of historical test runs in the report'),
    failureClusters: z.array(FailureClusterSchema).describe('Failures grouped by error fingerprint. Empty array when all tests pass.'),
    consistency: SummaryConsistencySchema,
    scores: SummaryScoresSchema,
    modules: z.array(SummaryModuleSchema).optional().describe('Per-module breakdown of the latest run. Present when the run was aggregated from multiple modules.'),
}).describe('Machine-readable summary of an aggregated Serenity/JS HTML test report');

// ===== TypeScript types (inferred from Zod) =====

export type ReportSummaryJson = z.infer<typeof ReportSummaryJsonSchema>;
export type SummaryRunInfo = z.infer<typeof SummaryRunInfoSchema>;
export type SummaryTotals = z.infer<typeof SummaryTotalsSchema>;
export type FailureCluster = z.infer<typeof FailureClusterSchema>;
export type FailureClusterScenario = z.infer<typeof FailureClusterScenarioSchema>;
export type ConsistencyScenarioRef = z.infer<typeof ConsistencyScenarioRefSchema>;
export type SummaryConsistency = z.infer<typeof SummaryConsistencySchema>;
export type SummaryScores = z.infer<typeof SummaryScoresSchema>;
export type SummaryModule = z.infer<typeof SummaryModuleSchema>;
