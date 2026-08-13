/**
 * Tests for mergeAdditively and mergeAsRetry functions.
 *
 * These functions handle the merging of RunData objects during CI aggregation.
 * A critical scenario: when two parallel CI jobs (e.g., devtools and webdriver protocol variants)
 * produce data with the same testRunId but different moduleIds, they should NOT be treated
 * as retries of each other.
 */
import { expect, test } from '@playwright/test';
import { ExecutionFailedWithAssertionError, ExecutionSuccessful } from '@serenity-js/core/model';

import { mergeAdditively } from '../../../src/cli/aggregation/resolveRetries.js';
import type { RunData, SceneRecord } from '../../../src/cli/model/RunData.js';

function createRunData(overrides: Partial<RunData> = {}): RunData {
    return {
        schemaVersion: 1,
        startedAt: '2024-06-15T14:30:00.000Z',
        finishedAt: '2024-06-15T14:31:00.000Z',
        outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
        scenes: [],
        tags: [],
        testRunner: { name: 'Mocha', version: '11.0.0' },
        systemContext: {
            nodeVersion: 'v22.0.0',
            os: { name: 'linux', version: '6.0', arch: 'x64' },
            serenityVersion: { major: 3, minor: 44, patch: 0 },
        },
        ...overrides,
    } as RunData;
}

function createScene(overrides: Partial<SceneRecord> = {}): SceneRecord {
    return {
        name: 'navigates to a page',
        category: 'Navigate',
        source: { path: 'spec/screenplay/models/Navigate.spec.ts', line: 42 },
        outcome: { code: ExecutionSuccessful.Code, description: 'SUCCESS' },
        duration: 1500,
        startedAt: '2024-06-15T14:30:01.000Z',
        tags: [],
        activities: [],
        ...overrides,
    } as SceneRecord;
}

test.describe('mergeAdditively', () => {

    test.describe('when two modules share the same scene identity and the same outcome', () => {

        test('deduplicates without creating retry attempts', () => {
            const scene = createScene({ outcome: { code: ExecutionSuccessful.Code, description: 'SUCCESS' } });

            const devtools = createRunData({
                testRunId: '8320',
                attempt: 1,
                scenes: [scene],
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            });

            const webdriver = createRunData({
                testRunId: '8320',
                attempt: 1,
                scenes: [{ ...scene }],
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            });

            const merged = mergeAdditively(devtools, webdriver);

            expect(merged.scenes).toHaveLength(1);
            expect(merged.scenes[0].outcome.code).toBe(ExecutionSuccessful.Code);
            expect((merged.scenes[0] as any).retries).toBeUndefined();
            expect((merged.scenes[0] as any).attempts).toBeUndefined();
        });
    });

    test.describe('when two modules share the same scene identity but different outcomes', () => {

        test('treats the difference as a retry — masking the failure', () => {
            const failedScene = createScene({
                outcome: { code: ExecutionFailedWithAssertionError.Code, description: 'FAILURE' },
                error: { name: 'AssertionError', message: 'Expected true to be false', stack: '' },
            });

            const passedScene = createScene({
                outcome: { code: ExecutionSuccessful.Code, description: 'SUCCESS' },
            });

            const devtools = createRunData({
                testRunId: '8320',
                attempt: 1,
                scenes: [failedScene],
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
            });

            const webdriver = createRunData({
                testRunId: '8320',
                attempt: 1,
                scenes: [passedScene],
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            });

            const merged = mergeAdditively(devtools, webdriver);

            // Current behaviour: mergeAdditively treats different-outcome overlap as a retry,
            // making the final outcome a pass and hiding the failure.
            // This is the BUG: the devtools failure is incorrectly treated as a retry attempt.
            expect(merged.scenes).toHaveLength(1);
            expect(merged.scenes[0].outcome.code).toBe(ExecutionSuccessful.Code);
            expect((merged.scenes[0] as any).retries).toBe(1);

            // The failure is hidden inside attempts
            expect((merged.scenes[0] as any).attempts).toHaveLength(2);
            expect((merged.scenes[0] as any).attempts[0].outcome.code).toBe(ExecutionFailedWithAssertionError.Code);

            // The merged outcomes reflect the "retried" pass, not the failure
            expect(merged.outcomes.failed).toBe(0);
            expect(merged.outcomes.passed).toBe(1);
        });

        test('would preserve both if the scenes had different identities (e.g., different moduleIds in tags)', () => {
            const failedScene = createScene({
                outcome: { code: ExecutionFailedWithAssertionError.Code, description: 'FAILURE' },
                error: { name: 'AssertionError', message: 'Expected true to be false', stack: '' },
                // Different source line = different identity
                source: { path: 'spec/screenplay/models/Navigate.spec.ts', line: 42 },
            });

            const passedScene = createScene({
                outcome: { code: ExecutionSuccessful.Code, description: 'SUCCESS' },
                // Same source but different line = different identity
                source: { path: 'spec/screenplay/models/Navigate.spec.ts', line: 100 },
            });

            const devtools = createRunData({
                testRunId: '8320',
                attempt: 1,
                scenes: [failedScene],
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
            });

            const webdriver = createRunData({
                testRunId: '8320',
                attempt: 1,
                scenes: [passedScene],
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            });

            const merged = mergeAdditively(devtools, webdriver);

            // With different identities, both scenes are preserved independently
            expect(merged.scenes).toHaveLength(2);
            expect(merged.outcomes.passed).toBe(1);
            expect(merged.outcomes.failed).toBe(1);
        });
    });
});
