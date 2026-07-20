import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { FileSystem, Path } from '@serenity-js/core/io';
import { createFsFromVolume, Volume } from 'memfs';

import type { ReportData } from '../../src/cli/ReportData.js';
import type { ReportSummaryJson } from '../../src/cli/ReportSummaryJson.js';
import { ReportSummaryJsonSchema } from '../../src/cli/ReportSummaryJson.js';
import { SummaryJsonWriter } from '../../src/cli/SummaryJsonWriter.js';

test.describe('SummaryJsonWriter', () => {

    const outputDirectory = Path.from('/reports/serenity-js');

    function createMemFs(tree: Record<string, unknown> = {}): typeof fs {
        return createFsFromVolume(Volume.fromNestedJSON(tree as any, outputDirectory.value)) as unknown as typeof fs;
    }

    function writeSummary(data: Partial<ReportData>, specDirectory?: string): { summary: ReportSummaryJson; filesystem: typeof fs } {
        const filesystem = createMemFs();
        const fileSystem = new FileSystem(outputDirectory, filesystem);
        const writer = new SummaryJsonWriter(fileSystem);

        writer.write(createReportData(data), specDirectory);

        const content = filesystem.readFileSync('/reports/serenity-js/summary.json', 'utf8') as string;
        const summary = JSON.parse(content) as ReportSummaryJson;
        return { summary, filesystem };
    }

    test('writes summary.json to the output directory', () => {
        const filesystem = createMemFs();
        const fileSystem = new FileSystem(outputDirectory, filesystem);
        const writer = new SummaryJsonWriter(fileSystem);

        writer.write(createReportData({}));

        expect(filesystem.existsSync('/reports/serenity-js/summary.json')).toBe(true);
    });

    test('produces valid JSON matching the schema', () => {
        const { summary } = writeSummary({});

        const result = ReportSummaryJsonSchema.safeParse(summary);
        expect(result.success).toBe(true);
    });

    test('includes the report title', () => {
        const { summary } = writeSummary({
            summary: createSummary({ title: 'My Project Tests' }),
        });

        expect(summary.title).toBe('My Project Tests');
    });

    test('sets schemaVersion to 1', () => {
        const { summary } = writeSummary({});

        expect(summary.schemaVersion).toBe(1);
    });

    test('includes a generated ISO timestamp', () => {
        const { summary } = writeSummary({});

        expect(summary.generated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test.describe('latestRun', () => {

        test('includes timestamp from summary.startedAt', () => {
            const { summary } = writeSummary({
                summary: createSummary({ startedAt: '2024-06-15T14:30:00.000Z' }),
            });

            expect(summary.latestRun.timestamp).toBe('2024-06-15T14:30:00.000Z');
        });

        test('uses the label from the latest history entry', () => {
            const { summary } = writeSummary({
                history: [
                    createHistoryEntry({ label: '#100' }),
                    createHistoryEntry({ label: '#101' }),
                ],
            });

            expect(summary.latestRun.label).toBe('#101');
        });

        test('falls back to startedAt when no history is available', () => {
            const { summary } = writeSummary({
                summary: createSummary({ startedAt: '2024-06-15T14:30:00.000Z' }),
                history: [],
            });

            expect(summary.latestRun.label).toBe('2024-06-15T14:30:00.000Z');
        });

        test('includes outcome totals', () => {
            const { summary } = writeSummary({
                summary: createSummary({
                    outcomes: { passed: 5, failed: 2, pending: 1, skipped: 0, compromised: 0, error: 1 },
                }),
            });

            expect(summary.latestRun.totals).toEqual({
                passed: 5,
                failed: 2,
                pending: 1,
                skipped: 0,
                compromised: 0,
                error: 1,
            });
        });

        test('includes duration', () => {
            const { summary } = writeSummary({
                summary: createSummary({ duration: 12345 }),
            });

            expect(summary.latestRun.duration).toBe(12345);
        });
    });

    test.describe('runs', () => {

        test('counts the number of history entries', () => {
            const { summary } = writeSummary({
                history: [
                    createHistoryEntry({}),
                    createHistoryEntry({}),
                    createHistoryEntry({}),
                ],
            });

            expect(summary.runs).toBe(3);
        });

        test('defaults to 1 when no history is available', () => {
            const { summary } = writeSummary({
                history: [],
            });

            expect(summary.runs).toBe(1);
        });
    });

    test.describe('failureClusters', () => {

        test('includes failure clusters from scenarios', () => {
            const { summary } = writeSummary({
                scenarios: [
                    createScenario({
                        name: 'Login fails',
                        outcome: 'FAILURE',
                        error: { name: 'AssertionError', message: 'expected 200 to equal 401' },
                    }),
                ],
            });

            expect(summary.failureClusters).toHaveLength(1);
            expect(summary.failureClusters[0].errorType).toBe('AssertionError');
        });

        test('returns empty array when all tests pass', () => {
            const { summary } = writeSummary({
                scenarios: [
                    createScenario({ name: 'Test A', outcome: 'SUCCESS' }),
                ],
            });

            expect(summary.failureClusters).toEqual([]);
        });
    });

    test.describe('consistency', () => {

        test('counts flaky tests', () => {
            const { summary } = writeSummary({
                inconsistentTests: [
                    createInconsistentTest({ history: ['SUCCESS', 'RETRIED_SUCCESS', 'SUCCESS'] }),
                    createInconsistentTest({ history: ['RETRIED_SUCCESS', 'RETRIED_SUCCESS'] }),
                ],
            });

            expect(summary.consistency.flaky).toBe(2);
        });

        test('counts degraded tests from newFailures', () => {
            const { summary } = writeSummary({
                newFailures: [
                    { name: 'Test A', category: 'Suite', source: { path: 'a.spec.ts', line: 1 } },
                ],
            });

            expect(summary.consistency.degraded).toBe(1);
        });

        test('counts recovered tests from newPasses', () => {
            const { summary } = writeSummary({
                newPasses: [
                    { name: 'Test B', category: 'Suite', source: { path: 'b.spec.ts', line: 1 } },
                ],
            });

            expect(summary.consistency.recovered).toBe(1);
        });

        test('counts inconsistent tests (retried success as last outcome)', () => {
            const { summary } = writeSummary({
                inconsistentTests: [
                    createInconsistentTest({ history: ['FAILURE', 'RETRIED_SUCCESS'] }),
                ],
            });

            expect(summary.consistency.inconsistent).toBe(1);
        });

        test('counts degraded from inconsistentTests when last outcome is a failure', () => {
            const { summary } = writeSummary({
                inconsistentTests: [
                    createInconsistentTest({ history: ['SUCCESS', 'FAILURE'] }),
                ],
                newFailures: [],
            });

            // This is classified as 'degraded' from consistency classification
            expect(summary.consistency.degraded).toBe(1);
        });
    });

    test.describe('scores', () => {

        test('computes passRate as percentage of executed scenarios passing', () => {
            const { summary } = writeSummary({
                summary: createSummary({
                    totalScenarios: 10,
                    outcomes: { passed: 7, failed: 1, pending: 1, skipped: 1, compromised: 0, error: 0 },
                }),
            });

            // executed = 10 - 1 (pending) - 1 (skipped) = 8
            // passRate = 7 / 8 * 100 = 87.5
            expect(summary.scores.passRate).toBe(87.5);
        });

        test('computes completeness as percentage of implemented scenarios', () => {
            const { summary } = writeSummary({
                summary: createSummary({
                    totalScenarios: 10,
                    outcomes: { passed: 6, failed: 2, pending: 1, skipped: 1, compromised: 0, error: 0 },
                }),
            });

            // completeness = (10 - 1 - 1) / 10 * 100 = 80
            expect(summary.scores.completeness).toBe(80);
        });

        test('computes consistency from inconsistentTests count vs total', () => {
            const { summary } = writeSummary({
                summary: createSummary({ totalScenarios: 10 }),
                inconsistentTests: [
                    createInconsistentTest({}),
                    createInconsistentTest({}),
                ],
            });

            // consistency = (10 - 2) / 10 * 100 = 80
            expect(summary.scores.consistency).toBe(80);
        });

        test('computes confidence as weighted composite', () => {
            const { summary } = writeSummary({
                summary: createSummary({
                    totalScenarios: 10,
                    outcomes: { passed: 10, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                }),
                inconsistentTests: [],
            });

            // passRate = 100, completeness = 100, consistency = 100
            // confidence = 100 * 0.40 + 100 * 0.25 + 100 * 0.35 = 100
            expect(summary.scores.confidence).toBe(100);
        });

        test('handles zero total scenarios gracefully', () => {
            const { summary } = writeSummary({
                summary: createSummary({
                    totalScenarios: 0,
                    outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                }),
            });

            expect(summary.scores.passRate).toBe(0);
            expect(summary.scores.completeness).toBe(0);
            expect(summary.scores.consistency).toBe(100);
            expect(summary.scores.confidence).toBeGreaterThanOrEqual(0);
        });

        test('handles all scenarios being pending/skipped', () => {
            const { summary } = writeSummary({
                summary: createSummary({
                    totalScenarios: 5,
                    outcomes: { passed: 0, failed: 0, pending: 3, skipped: 2, compromised: 0, error: 0 },
                }),
            });

            // executed = 0, so passRate = 0
            // completeness = 0 / 5 * 100 = 0
            expect(summary.scores.passRate).toBe(0);
            expect(summary.scores.completeness).toBe(0);
        });

        test('rounds scores to one decimal place', () => {
            const { summary } = writeSummary({
                summary: createSummary({
                    totalScenarios: 3,
                    outcomes: { passed: 2, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                }),
                inconsistentTests: [],
            });

            // passRate = 2/3*100 = 66.666... → 66.7
            expect(summary.scores.passRate).toBe(66.7);
        });
    });
});

// ===== Test Helpers =====

function createReportData(overrides: Partial<ReportData>): ReportData {
    return {
        schemaVersion: 1,
        summary: overrides.summary || createSummary({}),
        scenarios: overrides.scenarios || [],
        history: overrides.history || [createHistoryEntry({})],
        tags: overrides.tags || [],
        inconsistentTests: overrides.inconsistentTests || [],
        newFailures: overrides.newFailures || [],
        newPasses: overrides.newPasses || [],
    };
}

function createSummary(overrides: Partial<ReportData['summary']>): ReportData['summary'] {
    return {
        title: overrides.title || 'Test Report',
        totalScenarios: overrides.totalScenarios ?? 10,
        outcomes: overrides.outcomes || { passed: 8, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 },
        duration: overrides.duration ?? 5000,
        startedAt: overrides.startedAt || '2024-06-15T14:30:00.000Z',
        finishedAt: overrides.finishedAt || '2024-06-15T14:30:05.000Z',
        testRunner: overrides.testRunner || 'Playwright Test',
    };
}

function createHistoryEntry(overrides: Partial<ReportData['history'][0]>): ReportData['history'][0] {
    return {
        timestamp: overrides.timestamp || '2024-06-15T14:30:00.000Z',
        duration: overrides.duration ?? 5000,
        outcomes: overrides.outcomes || { passed: 8, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 },
        label: overrides.label || '#100',
        slowest: overrides.slowest ?? 1000,
        fastest: overrides.fastest ?? 50,
        average: overrides.average ?? 500,
    };
}

function createScenario(overrides: Partial<ReportData['scenarios'][0]>): ReportData['scenarios'][0] {
    return {
        name: overrides.name || 'Test',
        category: overrides.category || 'Suite',
        outcome: overrides.outcome || 'SUCCESS',
        duration: overrides.duration || 100,
        startedAt: overrides.startedAt || '2024-06-15T14:30:00.000Z',
        source: overrides.source || { path: 'a.spec.ts', line: 1 },
        tags: overrides.tags || [],
        activities: overrides.activities || [],
        executionHistory: overrides.executionHistory || [],
        error: overrides.error,
    };
}

function createInconsistentTest(overrides: Partial<ReportData['inconsistentTests'][0]>): ReportData['inconsistentTests'][0] {
    return {
        name: overrides.name || 'Flaky Test',
        category: overrides.category || 'Suite',
        source: overrides.source || { path: 'a.spec.ts', line: 1 },
        tags: overrides.tags || [],
        inconsistencyRate: overrides.inconsistencyRate ?? 0.5,
        history: overrides.history || ['SUCCESS', 'RETRIED_SUCCESS'],
        labels: overrides.labels || ['#100', '#101'],
    };
}
