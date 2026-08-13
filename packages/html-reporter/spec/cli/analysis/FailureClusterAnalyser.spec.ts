import { expect, test } from '@playwright/test';

import { computeFailureClusters, fingerprintError } from '../../../src/cli/analysis/FailureClusterAnalyser.js';
import type { ReportScenario } from '../../../src/cli/reporting/ReportData.js';

test.describe('FailureClusterAnalyser', () => {

    test.describe('fingerprintError', () => {

        test('strips ANSI escape sequences from the message', () => {
            const result = fingerprintError('AssertionError', '\u001b[32mExpected\u001b[39m value to equal \u001b[31mReceived\u001b[39m');
            expect(result).not.toContain('\u001b');
        });

        test('strips absolute file paths', () => {
            const result = fingerprintError('Error', 'Cannot find module /Users/jan/Projects/serenity-js/src/foo.ts');
            expect(result).not.toContain('/Users/jan/Projects/');
        });

        test('strips line:col numbers', () => {
            const result = fingerprintError('Error', 'at foo.spec.ts:42:13');
            expect(result).not.toContain(':42:13');
        });

        test('normalises large numbers (ports, timestamps)', () => {
            const result = fingerprintError('Error', 'connection refused on port 8080 at 1719329400000');
            expect(result).not.toContain('8080');
            expect(result).not.toContain('1719329400000');
            expect(result).toContain('N');
        });

        test('caps the message at 200 characters', () => {
            const longMessage = 'a'.repeat(300);
            const result = fingerprintError('Error', longMessage);
            // The fingerprint is "ErrorType:" + normalised message (with spaces replaced by -)
            expect(result.length).toBeLessThanOrEqual('Error:'.length + 200);
        });

        test('replaces whitespace with dashes in the fingerprint', () => {
            const result = fingerprintError('AssertionError', 'expected true to be false');
            expect(result).not.toMatch(/\s/);
            expect(result).toContain('AssertionError:expected-true-to-be-false');
        });

        test('combines error type and normalised message', () => {
            const result = fingerprintError('TimeoutError', 'waiting for selector');
            expect(result).toBe('TimeoutError:waiting-for-selector');
        });
    });

    test.describe('computeFailureClusters', () => {

        test('returns empty array when all scenarios pass', () => {
            const scenarios: ReportScenario[] = [
                createScenario({ name: 'Test A', outcome: 'SUCCESS' }),
                createScenario({ name: 'Test B', outcome: 'SUCCESS' }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters).toEqual([]);
        });

        test('returns empty array when scenarios have no errors', () => {
            const scenarios: ReportScenario[] = [
                createScenario({ name: 'Test A', outcome: 'SKIPPED' }),
                createScenario({ name: 'Test B', outcome: 'PENDING' }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters).toEqual([]);
        });

        test('groups scenarios sharing the same error fingerprint', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'AssertionError', message: 'expected true to be false' },
                }),
                createScenario({
                    name: 'Test B',
                    outcome: 'FAILURE',
                    error: { name: 'AssertionError', message: 'expected true to be false' },
                    source: { path: 'b.spec.ts', line: 10 },
                }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters).toHaveLength(1);
            expect(clusters[0].scenarios).toHaveLength(2);
            expect(clusters[0].errorType).toBe('AssertionError');
            expect(clusters[0].message).toContain('expected true to be false');
        });

        test('creates separate clusters for different error types', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'AssertionError', message: 'expected true to be false' },
                }),
                createScenario({
                    name: 'Test B',
                    outcome: 'ERROR',
                    error: { name: 'TimeoutError', message: 'waiting for selector' },
                    source: { path: 'b.spec.ts', line: 10 },
                }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters).toHaveLength(2);
            expect(clusters.map(c => c.errorType).sort()).toEqual(['AssertionError', 'TimeoutError']);
        });

        test('includes scenario source location relative to specDirectory', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'Error', message: 'boom' },
                    source: { path: 'tests/e2e/login.spec.ts', line: 42 },
                }),
            ];

            const clusters = computeFailureClusters(scenarios, 'tests/e2e');

            expect(clusters[0].scenarios[0].source).toBe('login.spec.ts:42');
        });

        test('uses full path when specDirectory is not provided', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'Error', message: 'boom' },
                    source: { path: 'tests/e2e/login.spec.ts', line: 42 },
                }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters[0].scenarios[0].source).toBe('tests/e2e/login.spec.ts:42');
        });

        test('handles missing line number in source', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'Error', message: 'boom' },
                    source: { path: 'login.spec.ts' },
                }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters[0].scenarios[0].source).toBe('login.spec.ts');
        });

        test('detects browser from tags', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'Error', message: 'boom' },
                    tags: [{ type: 'browser', name: 'chromium 120.0' }],
                }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters[0].scenarios[0].browser).toBe('chromium 120.0');
        });

        test('finds the deepest failing step in the activity tree', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'Error', message: 'boom' },
                    activities: [
                        {
                            name: 'Navigate to login page',
                            outcome: 'SUCCESS',
                            children: [],
                        },
                        {
                            name: 'Enter credentials',
                            outcome: 'FAILURE',
                            children: [
                                {
                                    name: 'Enter username',
                                    outcome: 'SUCCESS',
                                    children: [],
                                },
                                {
                                    name: 'Enter password',
                                    outcome: 'FAILURE',
                                    children: [
                                        {
                                            name: 'Click on password field',
                                            outcome: 'FAILURE',
                                            children: [],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters[0].scenarios[0].failingStep).toBe('Click on password field');
        });

        test('returns undefined failingStep when no activities fail', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'Error', message: 'boom' },
                    activities: [
                        { name: 'Step 1', outcome: 'SUCCESS', children: [] },
                    ],
                }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters[0].scenarios[0].failingStep).toBeUndefined();
        });

        test('normalises error messages so similar errors cluster together', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'Error', message: 'Failed at /home/user/project/src/foo.ts:10:5' },
                    source: { path: 'a.spec.ts', line: 1 },
                }),
                createScenario({
                    name: 'Test B',
                    outcome: 'FAILURE',
                    error: { name: 'Error', message: 'Failed at /Users/dev/work/src/foo.ts:42:13' },
                    source: { path: 'b.spec.ts', line: 5 },
                }),
            ];

            const clusters = computeFailureClusters(scenarios);

            // Both should cluster together because paths and line numbers are stripped
            expect(clusters).toHaveLength(1);
            expect(clusters[0].scenarios).toHaveLength(2);
        });

        test('orders clusters by scenario count (descending)', () => {
            const scenarios: ReportScenario[] = [
                createScenario({
                    name: 'Test A',
                    outcome: 'FAILURE',
                    error: { name: 'TimeoutError', message: 'timeout' },
                    source: { path: 'a.spec.ts', line: 1 },
                }),
                createScenario({
                    name: 'Test B',
                    outcome: 'FAILURE',
                    error: { name: 'AssertionError', message: 'expected true to be false' },
                    source: { path: 'b.spec.ts', line: 1 },
                }),
                createScenario({
                    name: 'Test C',
                    outcome: 'FAILURE',
                    error: { name: 'AssertionError', message: 'expected true to be false' },
                    source: { path: 'c.spec.ts', line: 1 },
                }),
            ];

            const clusters = computeFailureClusters(scenarios);

            expect(clusters[0].errorType).toBe('AssertionError');
            expect(clusters[0].scenarios).toHaveLength(2);
            expect(clusters[1].errorType).toBe('TimeoutError');
            expect(clusters[1].scenarios).toHaveLength(1);
        });
    });
});

function createScenario(overrides: Partial<ReportScenario> & { error?: { name: string; message: string; stack?: string } }): ReportScenario {
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
