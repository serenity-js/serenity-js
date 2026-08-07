/**
 * Integration test verifying the full html-reporter pipeline:
 *   domain events → SceneDataCollector → db.json → DataSnapshotAggregator → data.js
 *
 * Each test verifies a single aspect of the pipeline contract.
 */
import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { AssertionError, DomainEventQueues, Timestamp } from '@serenity-js/core';
import {
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneStarts,
} from '@serenity-js/core/events';
import { FileSystem, FileSystemLocation, Path, RequirementsHierarchy, Version } from '@serenity-js/core/io';
import {
    ActivityDetails,
    Category,
    CorrelationId,
    ExecutionFailedWithAssertionError,
    ExecutionSuccessful,
    Name,
    ScenarioDetails,
} from '@serenity-js/core/model';
import { createFsFromVolume, Volume } from 'memfs';

import { DataSnapshotAggregator } from '../../src/cli/DataSnapshotAggregator.js';
import type { ReportData } from '../../src/cli/ReportData.js';
import { SceneDataCollector } from '../../src/cli/SceneDataCollector.js';
import type { SystemContext } from '../../src/cli/SystemContextDetector.js';

// -- Helpers --
const systemContext: SystemContext = {
    nodeVersion: 'v22.0.0',
    os: { name: 'linux', version: '6.0', arch: 'x64' },
    serenityVersion: new Version('3.44.0'),
    runtime: { provider: 'GitHub Actions', buildNumber: '42', branch: 'main', commit: 'abc123' },
};

function collectRunData(options: {
    sceneName: string;
    failed: boolean;
    retries?: number;
    timestamp: string;
}) {
    const collector = new SceneDataCollector();
    const queues = new DomainEventQueues();
    const sceneId = CorrelationId.create();

    const details = new ScenarioDetails(
        new Name(options.sceneName),
        new Category('Retries'),
        new FileSystemLocation(Path.from('spec/retries.spec.ts'), 8, 1),
    );

    const baseTime = new Date(options.timestamp).getTime();

    if (options.retries && options.retries > 0) {
        for (let attempt = 0; attempt <= options.retries; attempt++) {
            const attemptStart = new Timestamp(new Date(baseTime + attempt * 200));
            const attemptEnd = new Timestamp(new Date(baseTime + attempt * 200 + 150));

            queues.enqueue(new SceneStarts(sceneId, details, attemptStart));

            const actId = CorrelationId.create();
            const actDetails = new ActivityDetails(
                new Name(`attempt ${attempt + 1} step`),
                new FileSystemLocation(Path.from('spec/retries.spec.ts'), 10, 1),
            );
            queues.enqueue(new InteractionStarts(sceneId, actId, actDetails, attemptStart));

            const isLastAttempt = attempt === options.retries;
            const outcome = isLastAttempt && !options.failed
                ? new ExecutionSuccessful()
                : new ExecutionFailedWithAssertionError(new AssertionError(`attempt ${attempt + 1} failed`));

            queues.enqueue(new InteractionFinished(sceneId, actId, actDetails, outcome, attemptEnd));
            queues.enqueue(new SceneFinished(sceneId, details, outcome, attemptEnd));
        }
    } else {
        const t0 = new Timestamp(new Date(baseTime));
        const t1 = new Timestamp(new Date(baseTime + 100));
        const t2 = new Timestamp(new Date(baseTime + 200));

        queues.enqueue(new SceneStarts(sceneId, details, t0));

        const actId = CorrelationId.create();
        const actDetails = new ActivityDetails(
            new Name('single attempt step'),
            new FileSystemLocation(Path.from('spec/retries.spec.ts'), 10, 1),
        );
        queues.enqueue(new InteractionStarts(sceneId, actId, actDetails, t0));

        const outcome = options.failed
            ? new ExecutionFailedWithAssertionError(new AssertionError('test failed'))
            : new ExecutionSuccessful();

        queues.enqueue(new InteractionFinished(sceneId, actId, actDetails, outcome, t1));
        queues.enqueue(new SceneFinished(sceneId, details, outcome, t2));
    }

    return collector.collect({ queues, testRunStartedAt: options.timestamp, testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });
}

function createMemFs(tree: Record<string, unknown>, root = '/'): typeof fs {
     
    return createFsFromVolume(Volume.fromNestedJSON(tree as any, root)) as unknown as typeof fs;
}

function aggregateRuns(runs: Record<string, string>): ReportData {
    const tree: Record<string, Record<string, string>> = {};
    for (const [timestamp, json] of Object.entries(runs)) {
        tree[timestamp] = { 'db.json': json };
    }

    const filesystem = createMemFs({ '/output': { 'test-runs': tree } });

    const outputFs = new FileSystem(Path.from('/output'), filesystem);
    const hierarchy = new RequirementsHierarchy(outputFs);
    const aggregator = new DataSnapshotAggregator(outputFs, { consistencyWindow: 5 }, hierarchy, outputFs, outputFs, () => undefined);
    aggregator.aggregate();

    const content = filesystem.readFileSync('/output/data.js', 'utf8') as string;
    return JSON.parse(content.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, '')) as ReportData;
}

// -- Tests --

test.describe('Full pipeline integration: events → db.json → data.js', () => {

    test.describe('schema versioning', () => {

        test('includes schemaVersion in the aggregated output', () => {
            const run = collectRunData({ sceneName: 'test', failed: false, timestamp: '2024-06-15T14:30:00.000Z' });
            const data = aggregateRuns({ '2024-06-15T14:30:00.000Z': JSON.stringify(run) });

            expect(data.schemaVersion).toBe(1);
        });
    });

    test.describe('scenario deduplication across runs', () => {

        test('produces one scenario entry even when the same test appears in multiple runs', () => {
            const run1 = collectRunData({ sceneName: 'same test', failed: true, timestamp: '2024-06-14T10:00:00.000Z' });
            const run2 = collectRunData({ sceneName: 'same test', failed: false, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({
                '2024-06-14T10:00:00.000Z': JSON.stringify(run1),
                '2024-06-15T14:30:00.000Z': JSON.stringify(run2),
            });

            expect(data.scenarios).toHaveLength(1);
            expect(data.scenarios[0].name).toBe('same test');
        });
    });

    test.describe('per-run execution history', () => {

        test('non-retried run has no attempts in its execution history entry', () => {
            const run1 = collectRunData({ sceneName: 'test', failed: true, timestamp: '2024-06-14T10:00:00.000Z' });
            const run2 = collectRunData({ sceneName: 'test', failed: false, retries: 1, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({
                '2024-06-14T10:00:00.000Z': JSON.stringify(run1),
                '2024-06-15T14:30:00.000Z': JSON.stringify(run2),
            });

            const historyRun1 = data.scenarios[0].executionHistory[0];
            expect(historyRun1.attempts).toBeUndefined();
            expect(historyRun1.retries).toBeUndefined();
        });

        test('retried run includes attempts in its execution history entry', () => {
            const run1 = collectRunData({ sceneName: 'test', failed: true, timestamp: '2024-06-14T10:00:00.000Z' });
            const run2 = collectRunData({ sceneName: 'test', failed: false, retries: 2, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({
                '2024-06-14T10:00:00.000Z': JSON.stringify(run1),
                '2024-06-15T14:30:00.000Z': JSON.stringify(run2),
            });

            const historyRun2 = data.scenarios[0].executionHistory[1];
            expect(historyRun2.retries).toBe(2);
            expect(historyRun2.attempts).toHaveLength(3);
            expect(historyRun2.attempts[0].outcome).toBe('FAILURE');
            expect(historyRun2.attempts[2].outcome).toBe('SUCCESS');
            expect(historyRun2.attempts[2].activities[0].name).toBe('attempt 3 step');
        });

        test('each execution history entry carries per-run duration', () => {
            const run1 = collectRunData({ sceneName: 'test', failed: true, timestamp: '2024-06-14T10:00:00.000Z' });
            const run2 = collectRunData({ sceneName: 'test', failed: false, retries: 1, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({
                '2024-06-14T10:00:00.000Z': JSON.stringify(run1),
                '2024-06-15T14:30:00.000Z': JSON.stringify(run2),
            });

            for (const entry of data.scenarios[0].executionHistory) {
                expect(entry.duration).toBeGreaterThan(0);
            }
        });

        test('execution history entry for a failed run includes error details', () => {
            const run1 = collectRunData({ sceneName: 'test', failed: true, timestamp: '2024-06-14T10:00:00.000Z' });
            const run2 = collectRunData({ sceneName: 'test', failed: false, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({
                '2024-06-14T10:00:00.000Z': JSON.stringify(run1),
                '2024-06-15T14:30:00.000Z': JSON.stringify(run2),
            });

            expect(data.scenarios[0].executionHistory[0].error).toBeDefined();
            expect(data.scenarios[0].executionHistory[0].error.message).toBe('test failed');
        });
    });

    test.describe('scenario-level retry state', () => {

        test('scenario with retries has attempts on the scenario object', () => {
            const run = collectRunData({ sceneName: 'test', failed: false, retries: 2, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({ '2024-06-15T14:30:00.000Z': JSON.stringify(run) });

            expect(data.scenarios[0].outcome).toBe('SUCCESS');
            expect(data.scenarios[0].retries).toBe(2);
            expect(data.scenarios[0].attempts).toHaveLength(3);
        });

        test('scenario without retries has no attempts field', () => {
            const run = collectRunData({ sceneName: 'test', failed: false, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({ '2024-06-15T14:30:00.000Z': JSON.stringify(run) });

            expect(data.scenarios[0].retries).toBeUndefined();
            expect(data.scenarios[0].attempts).toBeUndefined();
        });
    });

    test.describe('summary and history', () => {

        test('summary reflects the latest run', () => {
            const run1 = collectRunData({ sceneName: 'test', failed: true, timestamp: '2024-06-14T10:00:00.000Z' });
            const run2 = collectRunData({ sceneName: 'test', failed: false, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({
                '2024-06-14T10:00:00.000Z': JSON.stringify(run1),
                '2024-06-15T14:30:00.000Z': JSON.stringify(run2),
            });

            expect(data.summary.totalScenarios).toBe(1);
            expect(data.summary.outcomes.passed).toBe(1);
            expect(data.summary.outcomes.failed).toBe(0);
        });

        test('history entries are ordered chronologically with correct timestamps', () => {
            const run1 = collectRunData({ sceneName: 'test', failed: true, timestamp: '2024-06-14T10:00:00.000Z' });
            const run2 = collectRunData({ sceneName: 'test', failed: false, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({
                '2024-06-14T10:00:00.000Z': JSON.stringify(run1),
                '2024-06-15T14:30:00.000Z': JSON.stringify(run2),
            });

            expect(data.history).toHaveLength(2);
            expect(data.history[0].timestamp).toBe('2024-06-14T10:00:00.000Z');
            expect(data.history[1].timestamp).toBe('2024-06-15T14:30:00.000Z');
        });
    });

    test.describe('error resilience', () => {

        test('skips corrupt db.json and aggregates remaining valid runs', () => {
            const validRun = collectRunData({ sceneName: 'good test', failed: false, timestamp: '2024-06-15T14:30:00.000Z' });

            const data = aggregateRuns({
                '2024-06-14T10:00:00.000Z': 'not valid JSON',
                '2024-06-15T14:30:00.000Z': JSON.stringify(validRun),
            });

            expect(data.scenarios).toHaveLength(1);
            expect(data.scenarios[0].name).toBe('good test');
            expect(data.history).toHaveLength(1);
        });

        test('produces no output when all runs are invalid', () => {
            const filesystem = createMemFs({
                '/output': {
                    'test-runs': {
                        '2024-06-14T10:00:00.000Z': { 'db.json': 'broken' },
                        '2024-06-15T10:00:00.000Z': { 'db.json': '{"schemaVersion": 999}' },
                    },
                },
            });

            const outputFs = new FileSystem(Path.from('/output'), filesystem);
            const hierarchy = new RequirementsHierarchy(outputFs);
            const aggregator = new DataSnapshotAggregator(outputFs, { consistencyWindow: 5 }, hierarchy, outputFs, outputFs, () => undefined);
            aggregator.aggregate();

            expect(filesystem.existsSync('/output/data.js')).toBe(false);
        });
    });
});
