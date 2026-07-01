/**
 * Integration test verifying the full html-reporter pipeline:
 *   domain events → SceneDataCollector → db.json → DataSnapshotAggregator → data.js
 *
 * This test exercises the real production code end-to-end with memfs,
 * verifying that:
 * - Multiple runs aggregate correctly
 * - Per-run retry data flows through to execution history
 * - The data.js shape matches what the template expects
 */
import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import { DomainEventQueues, Timestamp } from '@serenity-js/core';
import {
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneStarts,
} from '@serenity-js/core/events';
import { FileSystem, FileSystemLocation, Path } from '@serenity-js/core/io';
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

import { DataSnapshotAggregator } from '../src/DataSnapshotAggregator.js';
import { SceneDataCollector } from '../src/SceneDataCollector.js';

const systemContext = {
    nodeVersion: 'v22.0.0',
    os: { name: 'linux', version: '6.0', arch: 'x64' },
    serenityVersion: '3.44.0',
    testRunner: { name: 'Playwright', version: '1.50.0' },
    browsers: [{ name: 'chromium', version: '126.0.0' }],
    runtime: { provider: 'GitHub Actions', version: '1', buildNumber: '42', branch: 'main', commit: 'abc123' },
};

function collectRunData(options: {
    sceneId: CorrelationId;
    sceneName: string;
    failed: boolean;
    retries?: number;
    timestamp: string;
}) {
    const collector = new SceneDataCollector();
    const queues = new DomainEventQueues();

    const details = new ScenarioDetails(
        new Name(options.sceneName),
        new Category('Retries'),
        new FileSystemLocation(Path.from('spec/retries.spec.ts'), 8, 1),
    );
    const sceneId = options.sceneId;

    const baseTime = new Date(options.timestamp).getTime();

    if (options.retries && options.retries > 0) {
        // Simulate retried scenario: multiple SceneStarts/SceneFinished pairs
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
                : new ExecutionFailedWithAssertionError(new Error(`attempt ${attempt + 1} failed`));

            queues.enqueue(new InteractionFinished(sceneId, actId, actDetails, outcome, attemptEnd));
            queues.enqueue(new SceneFinished(sceneId, details, outcome, attemptEnd));
        }
    } else {
        // Simple scenario: one attempt
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
            ? new ExecutionFailedWithAssertionError(new Error('test failed'))
            : new ExecutionSuccessful();

        queues.enqueue(new InteractionFinished(sceneId, actId, actDetails, outcome, t1));
        queues.enqueue(new SceneFinished(sceneId, details, outcome, t2));
    }

    return collector.collect(
        queues,
        options.timestamp,
        'Playwright',
        '1.50.0',
        new Map(),
        systemContext,
    );
}

test.describe('Full pipeline integration: events → db.json → data.js', () => {

    test('produces correct per-run retry state across multiple runs', () => {
        // Run 1: scenario fails without retries
        const run1 = collectRunData({
            sceneId: CorrelationId.create(),
            sceneName: 'should allow me to retry a test',
            failed: true,
            timestamp: '2024-06-14T10:00:00.000Z',
        });

        // Run 2: scenario is retried twice, passes on 3rd attempt
        const run2 = collectRunData({
            sceneId: CorrelationId.create(),
            sceneName: 'should allow me to retry a test',
            failed: false,
            retries: 2,
            timestamp: '2024-06-15T14:30:00.000Z',
        });

        // Write both runs as db.json into memfs
        const filesystem = createFsFromVolume(Volume.fromNestedJSON({
            '/output': {
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': JSON.stringify(run1),
                    },
                    '2024-06-15T14:30:00.000Z': {
                        'db.json': JSON.stringify(run2),
                    },
                },
            },
        }, '/')) as unknown as typeof fs;

        const outputFs = new FileSystem(Path.from('/output'), filesystem);
        const aggregator = new DataSnapshotAggregator(outputFs, { consistencyWindow: 5 });

        // Run the aggregator (produces data.js)
        aggregator.aggregate();

        // Read and parse the produced data.js
        const dataJsContent = filesystem.readFileSync('/output/data.js', 'utf8') as string;
        const data = JSON.parse(
            dataJsContent.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, ''),
        );

        // === Verify the pipeline produced correct data ===

        // 1. Schema version present
        expect(data.schemaVersion).toBe(1);

        // 2. Single scenario (not duplicated)
        expect(data.scenarios).toHaveLength(1);
        const scenario = data.scenarios[0];
        expect(scenario.name).toBe('should allow me to retry a test');

        // 3. Final outcome is SUCCESS (from the latest run)
        expect(scenario.outcome).toBe('SUCCESS');

        // 4. Scenario-level attempts present (from latest run)
        expect(scenario.retries).toBe(2);
        expect(scenario.attempts).toHaveLength(3);

        // 5. Execution history has 2 entries (one per run)
        expect(scenario.executionHistory).toHaveLength(2);

        // 6. Run 1 (non-retried): FAILURE, no attempts
        const historyRun1 = scenario.executionHistory[0];
        expect(historyRun1.outcome).toBe('FAILURE');
        expect(historyRun1.duration).toBeGreaterThan(0);
        expect(historyRun1.attempts).toBeUndefined();
        expect(historyRun1.retries).toBeUndefined();
        expect(historyRun1.activities).toHaveLength(1);
        expect(historyRun1.activities[0].name).toBe('single attempt step');
        expect(historyRun1.error).toBeDefined();
        expect(historyRun1.error.message).toBe('test failed');

        // 7. Run 2 (retried): SUCCESS, with 3 attempts
        const historyRun2 = scenario.executionHistory[1];
        expect(historyRun2.outcome).toBe('SUCCESS');
        expect(historyRun2.duration).toBeGreaterThan(0);
        expect(historyRun2.retries).toBe(2);
        expect(historyRun2.attempts).toHaveLength(3);
        expect(historyRun2.attempts[0].outcome).toBe('FAILURE');
        expect(historyRun2.attempts[0].activities[0].name).toBe('attempt 1 step');
        expect(historyRun2.attempts[1].outcome).toBe('FAILURE');
        expect(historyRun2.attempts[2].outcome).toBe('SUCCESS');
        expect(historyRun2.attempts[2].activities[0].name).toBe('attempt 3 step');

        // 8. History entries have correct labels and timestamps
        expect(data.history).toHaveLength(2);
        expect(data.history[0].timestamp).toBe('2024-06-14T10:00:00.000Z');
        expect(data.history[1].timestamp).toBe('2024-06-15T14:30:00.000Z');

        // 9. Summary reflects the latest run
        expect(data.summary.totalScenarios).toBe(1);
        expect(data.summary.outcomes.passed).toBe(1);
        expect(data.summary.outcomes.failed).toBe(0);

        // 10. System context flows through
        expect(data.systemContext).toBeDefined();
        expect(data.systemContext.nodeVersion).toBe('v22.0.0');
        expect(data.systemContext.browsers).toHaveLength(0); // No browser tags in scene data
    });

    test('handles a scenario that passes in both runs without retry data', () => {
        const run1 = collectRunData({
            sceneId: CorrelationId.create(),
            sceneName: 'stable test',
            failed: false,
            timestamp: '2024-06-14T10:00:00.000Z',
        });

        const run2 = collectRunData({
            sceneId: CorrelationId.create(),
            sceneName: 'stable test',
            failed: false,
            timestamp: '2024-06-15T14:30:00.000Z',
        });

        const filesystem = createFsFromVolume(Volume.fromNestedJSON({
            '/output': {
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': { 'db.json': JSON.stringify(run1) },
                    '2024-06-15T14:30:00.000Z': { 'db.json': JSON.stringify(run2) },
                },
            },
        }, '/')) as unknown as typeof fs;

        const outputFs = new FileSystem(Path.from('/output'), filesystem);
        const aggregator = new DataSnapshotAggregator(outputFs, { consistencyWindow: 5 });
        aggregator.aggregate();

        const dataJsContent = filesystem.readFileSync('/output/data.js', 'utf8') as string;
        const data = JSON.parse(
            dataJsContent.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, ''),
        );

        const scenario = data.scenarios[0];
        expect(scenario.outcome).toBe('SUCCESS');
        expect(scenario.retries).toBeUndefined();
        expect(scenario.attempts).toBeUndefined();

        // Neither history entry should have attempts
        for (const entry of scenario.executionHistory) {
            expect(entry.attempts).toBeUndefined();
            expect(entry.retries).toBeUndefined();
        }
    });

    test('gracefully handles mixed valid and corrupt runs', () => {
        const validRun = collectRunData({
            sceneId: CorrelationId.create(),
            sceneName: 'good test',
            failed: false,
            timestamp: '2024-06-15T14:30:00.000Z',
        });

        const filesystem = createFsFromVolume(Volume.fromNestedJSON({
            '/output': {
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': { 'db.json': 'not valid JSON' },
                    '2024-06-15T14:30:00.000Z': { 'db.json': JSON.stringify(validRun) },
                },
            },
        }, '/')) as unknown as typeof fs;

        const outputFs = new FileSystem(Path.from('/output'), filesystem);
        const aggregator = new DataSnapshotAggregator(outputFs, { consistencyWindow: 5 });
        aggregator.aggregate();

        const dataJsContent = filesystem.readFileSync('/output/data.js', 'utf8') as string;
        const data = JSON.parse(
            dataJsContent.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, ''),
        );

        // Only the valid run survives
        expect(data.scenarios).toHaveLength(1);
        expect(data.scenarios[0].name).toBe('good test');
        expect(data.history).toHaveLength(1);
    });
});
