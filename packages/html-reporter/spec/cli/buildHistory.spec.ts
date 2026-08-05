import { expect, test } from '@playwright/test';
import { ExecutionFailedWithError, ExecutionSuccessful } from '@serenity-js/core/model';

import { computeConsistencyAtRun } from '../../src/cli/history/buildHistory.js';
import type { RunData } from '../../src/cli/model/RunData.js';

function createRun(overrides: Partial<RunData> = {}): RunData {
    return {
        schemaVersion: 1,
        testRunId: 'run-1',
        startedAt: '2024-01-01T00:00:00.000Z',
        finishedAt: '2024-01-01T00:01:00.000Z',
        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
        scenes: [],
        ...overrides,
    } as RunData;
}

function createScene(name: string, outcomeCode: number, tags: Array<{ type: string; name: string }> = []) {
    return {
        name,
        category: 'Suite',
        source: { path: '/specs/Page.spec.ts', line: 42 },
        outcome: { code: outcomeCode },
        duration: 1000,
        retries: 0,
        tags,
    };
}

test.describe('computeConsistencyAtRun', () => {

    test('treats tests from different modules as separate when computing consistency', () => {
        // Run 1: both variants pass
        const run1 = createRun({
            testRunId: '8337',
            scenes: [
                createScene('discards closed Pages', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-devtools' },
                ]),
                createScene('discards closed Pages', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-webdriverio' },
                ]),
            ],
        });

        // Run 2: devtools fails, webdriver still passes
        const run2 = createRun({
            testRunId: '8338',
            scenes: [
                createScene('discards closed Pages', ExecutionFailedWithError.Code, [
                    { type: 'module', name: 'webdriverio-8-web-devtools' },
                ]),
                createScene('discards closed Pages', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-webdriverio' },
                ]),
            ],
        });

        const consistency = computeConsistencyAtRun([run1, run2]);

        // 2 tests tracked, 1 stable (webdriver), 1 unstable (devtools) → 50%
        expect(consistency).toBe(50);
    });

    test('without module discrimination, interleaved outcomes would produce 0% consistency', () => {
        // This test documents that WITHOUT module tags, the same test name+path
        // would produce mixed outcomes and 0% consistency.
        // With module discrimination, each variant is tracked separately.

        const run1 = createRun({
            testRunId: '8337',
            scenes: [
                createScene('discards closed Pages', ExecutionSuccessful.Code, []),
                createScene('discards closed Pages', ExecutionFailedWithError.Code, []),
            ],
        });

        const run2 = createRun({
            testRunId: '8338',
            scenes: [
                createScene('discards closed Pages', ExecutionSuccessful.Code, []),
                createScene('discards closed Pages', ExecutionFailedWithError.Code, []),
            ],
        });

        // Without any tag discrimination, both scenes collapse into one entry
        // with mixed outcomes [SUCCESS, ERROR, SUCCESS, ERROR] → 0% consistency.
        // But since they share the same path:line and have NO discriminator tags,
        // they genuinely ARE the same test — so 0% is correct here.
        const consistency = computeConsistencyAtRun([run1, run2]);
        expect(consistency).toBe(0);
    });
});
