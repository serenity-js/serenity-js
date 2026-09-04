import { expect, test } from '@playwright/test';
import { ExecutionFailedWithAssertionError, ExecutionFailedWithError, ExecutionSuccessful } from '@serenity-js/core/model';

import { buildExecutionHistory } from '../../../src/cli/aggregation/mapScenarioToReport.js';
import type { RunData, SceneRecord } from '../../../src/cli/model/RunData.js';

function createScene(overrides: Partial<SceneRecord> & { name: string; source: { path: string; line: number } }): SceneRecord {
    return {
        category: 'Suite',
        outcome: { code: ExecutionSuccessful.Code },
        duration: 1000,
        startedAt: '2024-06-15T10:00:00.000Z',
        tags: [],
        activities: [],
        ...overrides,
    } as SceneRecord;
}

function createRun(overrides: Partial<RunData> & { scenes: SceneRecord[] }): RunData {
    return {
        schemaVersion: 1,
        testRunId: 'run-1',
        startedAt: '2024-01-01T00:00:00.000Z',
        finishedAt: '2024-01-01T00:01:00.000Z',
        outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
        tags: [],
        ...overrides,
    } as RunData;
}

test.describe('buildExecutionHistory', () => {

    test('matches a scene across runs by source identity', () => {
        const scene = createScene({ name: 'test A', source: { path: 'spec/a.spec.ts', line: 10 } });
        const run1 = createRun({
            testRunId: 'run-1',
            scenes: [createScene({ name: 'test A', source: { path: 'spec/a.spec.ts', line: 10 } })],
        });
        const run2 = createRun({
            testRunId: 'run-2',
            scenes: [createScene({ name: 'test A', source: { path: 'spec/a.spec.ts', line: 10 } })],
        });

        const history = buildExecutionHistory(scene, [run1, run2]);

        expect(history).toHaveLength(2);
        expect(history[0].outcome).toBe('SUCCESS');
        expect(history[1].outcome).toBe('SUCCESS');
    });

    test('returns empty history when scene is not found in any run', () => {
        const scene = createScene({ name: 'test missing', source: { path: 'spec/b.spec.ts', line: 99 } });
        const run1 = createRun({
            testRunId: 'run-1',
            scenes: [createScene({ name: 'test A', source: { path: 'spec/a.spec.ts', line: 10 } })],
        });

        const history = buildExecutionHistory(scene, [run1]);

        expect(history).toHaveLength(0);
    });

    test('disambiguates dynamically-generated tests sharing the same source line', () => {
        const sceneA = createScene({ name: 'should pass for url A', source: { path: 'spec/a.spec.ts', line: 35 } });
        const sceneB = createScene({ name: 'should pass for url B', source: { path: 'spec/a.spec.ts', line: 35 } });

        const historicalRun = createRun({
            testRunId: 'run-1',
            scenes: [
                createScene({ name: 'should pass for url A', source: { path: 'spec/a.spec.ts', line: 35 }, outcome: { code: ExecutionSuccessful.Code } }),
                createScene({ name: 'should pass for url B', source: { path: 'spec/a.spec.ts', line: 35 }, outcome: { code: ExecutionFailedWithAssertionError.Code } }),
            ],
        });

        const historyA = buildExecutionHistory(sceneA, [historicalRun]);
        const historyB = buildExecutionHistory(sceneB, [historicalRun]);

        // Each scene should match its own counterpart, not both match the same one
        expect(historyA).toHaveLength(1);
        expect(historyB).toHaveLength(1);
        expect(historyA[0].outcome).toBe('SUCCESS');
        expect(historyB[0].outcome).toBe('FAILURE');
    });

    test('matches the single candidate when historical run has only one test at the colliding line', () => {
        // Latest run has 2 dynamic tests at line 35, but historical run had only 1.
        // Both current scenes match the one historical scene — no ambiguity to resolve.
        const sceneA = createScene({ name: 'should pass for url A', source: { path: 'spec/a.spec.ts', line: 35 } });
        const sceneB = createScene({ name: 'should pass for url B', source: { path: 'spec/a.spec.ts', line: 35 } });

        const historicalRun = createRun({
            testRunId: 'run-1',
            scenes: [
                createScene({ name: 'should pass for url A', source: { path: 'spec/a.spec.ts', line: 35 }, outcome: { code: ExecutionSuccessful.Code } }),
            ],
        });

        const historyA = buildExecutionHistory(sceneA, [historicalRun]);
        const historyB = buildExecutionHistory(sceneB, [historicalRun]);

        expect(historyA).toHaveLength(1);
        expect(historyA[0].outcome).toBe('SUCCESS');
        // sceneB also matches the single historical scene (no collision, backward-compatible)
        expect(historyB).toHaveLength(1);
        expect(historyB[0].outcome).toBe('SUCCESS');
    });

    test('still matches unique scenes at the same line when only one exists per run', () => {
        const scene = createScene({ name: 'unique test', source: { path: 'spec/a.spec.ts', line: 10 } });

        const run = createRun({
            testRunId: 'run-1',
            scenes: [
                createScene({ name: 'unique test', source: { path: 'spec/a.spec.ts', line: 10 } }),
            ],
        });

        const history = buildExecutionHistory(scene, [run]);

        expect(history).toHaveLength(1);
        expect(history[0].outcome).toBe('SUCCESS');
    });

    test('includes error info for failed matches', () => {
        const scene = createScene({ name: 'test A', source: { path: 'spec/a.spec.ts', line: 10 } });

        const run = createRun({
            testRunId: 'run-1',
            scenes: [
                createScene({
                    name: 'test A',
                    source: { path: 'spec/a.spec.ts', line: 10 },
                    outcome: { code: ExecutionFailedWithError.Code },
                    error: { name: 'Error', message: 'something broke', stack: 'stack trace' },
                }),
            ],
        });

        const history = buildExecutionHistory(scene, [run]);

        expect(history).toHaveLength(1);
        expect(history[0].outcome).toBe('ERROR');
        expect(history[0].error).toEqual({ name: 'Error', message: 'something broke', stack: 'stack trace' });
    });
});
