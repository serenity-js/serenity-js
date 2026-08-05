import { expect, test } from '@playwright/test';
import { ExecutionFailedWithError, ExecutionSuccessful } from '@serenity-js/core/model';

import { identifyUnstableTests } from '../../src/cli/identifyUnstableTests.js';
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
        retries: 0,
        tags,
    };
}

test.describe('identifyUnstableTests', () => {

    test('treats tests from different modules as separate entries', () => {
        // Prior run: both variants pass
        const run0 = createRun({
            testRunId: '8337',
            scenes: [
                createScene('correctly discards Pages closed by JS', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-devtools' },
                    { type: 'browser', name: 'chrome 151' },
                ]),
                createScene('correctly discards Pages closed by JS', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-webdriverio' },
                    { type: 'browser', name: 'chrome 151' },
                ]),
            ],
        });

        // Two subsequent runs: devtools fails, webdriver passes
        const run1 = createRun({
            testRunId: '8338',
            scenes: [
                createScene('correctly discards Pages closed by JS', ExecutionFailedWithError.Code, [
                    { type: 'module', name: 'webdriverio-8-web-devtools' },
                    { type: 'browser', name: 'chrome 151' },
                ]),
                createScene('correctly discards Pages closed by JS', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-webdriverio' },
                    { type: 'browser', name: 'chrome 151' },
                ]),
            ],
        });

        const run2 = createRun({
            testRunId: '8339',
            scenes: [
                createScene('correctly discards Pages closed by JS', ExecutionFailedWithError.Code, [
                    { type: 'module', name: 'webdriverio-8-web-devtools' },
                    { type: 'browser', name: 'chrome 151' },
                ]),
                createScene('correctly discards Pages closed by JS', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-webdriverio' },
                    { type: 'browser', name: 'chrome 151' },
                ]),
            ],
        });

        const unstable = identifyUnstableTests([run0, run1, run2], 5);

        // The devtools variant is unstable (SUCCESS → ERROR → ERROR) — degraded
        const devtoolsEntry = unstable.find(t =>
            t.tags.some(tag => tag.type === 'module' && tag.name === 'webdriverio-8-web-devtools'),
        );
        expect(devtoolsEntry).toBeDefined();
        expect(devtoolsEntry!.history).toEqual(['SUCCESS', 'ERROR', 'ERROR']);

        // The webdriver variant is NOT unstable (passes consistently)
        const webdriverEntry = unstable.find(t =>
            t.tags.some(tag => tag.type === 'module' && tag.name === 'webdriverio-8-web-webdriverio'),
        );
        expect(webdriverEntry).toBeUndefined();
    });

    test('does not interleave outcomes from different module variants', () => {
        // Prior run: both variants pass
        const run1 = createRun({
            testRunId: '8337',
            scenes: [
                createScene('correctly discards Pages closed by JS', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-devtools' },
                ]),
                createScene('correctly discards Pages closed by JS', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-webdriverio' },
                ]),
            ],
        });

        // Current run: devtools fails, webdriver passes
        const run2 = createRun({
            testRunId: '8338',
            scenes: [
                createScene('correctly discards Pages closed by JS', ExecutionFailedWithError.Code, [
                    { type: 'module', name: 'webdriverio-8-web-devtools' },
                ]),
                createScene('correctly discards Pages closed by JS', ExecutionSuccessful.Code, [
                    { type: 'module', name: 'webdriverio-8-web-webdriverio' },
                ]),
            ],
        });

        const unstable = identifyUnstableTests([run1, run2], 5);

        // Only the devtools variant should be unstable (SUCCESS → ERROR)
        expect(unstable).toHaveLength(1);
        expect(unstable[0].tags).toContainEqual({ type: 'module', name: 'webdriverio-8-web-devtools' });
        expect(unstable[0].history).toEqual(['SUCCESS', 'ERROR']);
    });
});
