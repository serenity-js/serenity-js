import { expect, test } from '@playwright/test';
import { AssertionError, DomainEventQueues, Timestamp } from '@serenity-js/core';
import {
    ActivityRelatedArtifactGenerated,
    ActorEntersStage,
    InteractionFinished,
    InteractionStarts,
    RetryableSceneDetected,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
} from '@serenity-js/core/events';
import { FileSystemLocation, Path, Version } from '@serenity-js/core/io';
import {
    ActivityDetails,
    ArbitraryTag,
    Category,
    CorrelationId,
    Description,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSuccessful,
    HTTPRequestResponse,
    JSONData,
    LogEntry,
    Name,
    ProjectTag,
    ScenarioDetails,
    ScenarioParameters,
    TextData,
} from '@serenity-js/core/model';

import { SceneDataCollector } from '../../src/cli/SceneDataCollector.js';
import type { SystemContext } from '../../src/cli/SystemContextDetector.js';

const systemContext: SystemContext = { nodeVersion: 'v22', os: { name: 'linux', version: '6', arch: 'x64' }, serenityVersion: new Version('3.44.0'), runtime: { provider: 'localhost', buildNumber: '1', branch: 'main', commit: 'abc123' } };

test.describe('SceneDataCollector', () => {

    test.describe('retry support', () => {

        test('groups multiple SceneStarts/SceneFinished pairs into attempts', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('should allow me to retry a test'),
                new Category('Todo List App'),
                new FileSystemLocation(Path.from('spec/retries.spec.ts'), 8, 1),
            );
            const sceneId = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));
            const t3 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
            const t4 = new Timestamp(new Date('2024-01-01T00:00:00.250Z'));
            const t5 = new Timestamp(new Date('2024-01-01T00:00:00.300Z'));

            // Attempt 1: fails
            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new SceneTagged(sceneId, new ArbitraryTag('retried'), t0));
            const act1 = CorrelationId.create();
            const actDetails1 = new ActivityDetails(new Name('Tess ensures that 0 does equal 2'), new FileSystemLocation(Path.from('spec/retries.spec.ts'), 10, 1));
            queues.enqueue(new InteractionStarts(sceneId, act1, actDetails1, t0));
            queues.enqueue(new InteractionFinished(sceneId, act1, actDetails1, new ExecutionFailedWithAssertionError(new AssertionError('Expected 0 to equal 2')), t1));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionFailedWithAssertionError(new AssertionError('Expected 0 to equal 2')), t2));

            // Attempt 2: succeeds
            queues.enqueue(new SceneStarts(sceneId, details, t3));
            queues.enqueue(new SceneTagged(sceneId, new ArbitraryTag('retried'), t3));
            const act2 = CorrelationId.create();
            const actDetails2 = new ActivityDetails(new Name('Tess ensures that 2 does equal 2'), new FileSystemLocation(Path.from('spec/retries.spec.ts'), 10, 1));
            queues.enqueue(new InteractionStarts(sceneId, act2, actDetails2, t3));
            queues.enqueue(new InteractionFinished(sceneId, act2, actDetails2, new ExecutionSuccessful(), t4));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t5));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            expect(runData.scenes).toHaveLength(1);
            const scene = runData.scenes[0];

            // Final outcome is SUCCESS
            expect(scene.outcome.code).toBe(ExecutionSuccessful.Code);
            // Error should be cleared since final attempt passed
            expect(scene.error).toBeUndefined();
            // Retries count
            expect(scene.retries).toBe(1);
            // Attempts array
            expect(scene.attempts).toHaveLength(2);

            // First attempt (failed)
            expect(scene.attempts[0].attemptNumber).toBe(1);
            expect(scene.attempts[0].outcome.code).toBe(ExecutionFailedWithAssertionError.Code);
            expect(scene.attempts[0].activities).toHaveLength(1);
            expect(scene.attempts[0].activities[0].name).toBe('Tess ensures that 0 does equal 2');
            expect(scene.attempts[0].error).toBeDefined();
            expect(scene.attempts[0].error.message).toContain('Expected 0 to equal 2');

            // Second attempt (passed)
            expect(scene.attempts[1].attemptNumber).toBe(2);
            expect(scene.attempts[1].outcome.code).toBe(ExecutionSuccessful.Code);
            expect(scene.attempts[1].activities).toHaveLength(1);
            expect(scene.attempts[1].activities[0].name).toBe('Tess ensures that 2 does equal 2');
            expect(scene.attempts[1].error).toBeUndefined();
        });

        test('does not produce attempts for non-retried scenarios', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('simple test'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('test.spec.ts'), 1, 1),
            );
            const sceneId = CorrelationId.create();
            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            const act = CorrelationId.create();
            const actDetails = new ActivityDetails(new Name('do something'), new FileSystemLocation(Path.from('test.spec.ts'), 5, 1));
            queues.enqueue(new InteractionStarts(sceneId, act, actDetails, t0));
            queues.enqueue(new InteractionFinished(sceneId, act, actDetails, new ExecutionSuccessful(), t1));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t1));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Mocha', testRunnerVersion: '11.0.0', artifactPaths: new Map(), systemContext });

            expect(runData.scenes).toHaveLength(1);
            const scene = runData.scenes[0];
            expect(scene.retries).toBeUndefined();
            expect(scene.attempts).toBeUndefined();
            expect(scene.activities).toHaveLength(1);
        });

        test('outcome counts use only the final outcome of retried tests', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('retried test'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('test.spec.ts'), 1, 1),
            );
            const sceneId = CorrelationId.create();
            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
            const t3 = new Timestamp(new Date('2024-01-01T00:00:00.300Z'));

            // Attempt 1: fails
            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionFailedWithAssertionError(new AssertionError('fail')), t1));

            // Attempt 2: passes
            queues.enqueue(new SceneStarts(sceneId, details, t2));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t3));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            // Should count as 1 passed scenario (not 1 failed + 1 passed)
            expect(runData.outcomes.passed).toBe(1);
            expect(runData.outcomes.failed).toBe(0);
            expect(runData.scenes).toHaveLength(1);
        });
    });

    test.describe('scenario outline support', () => {

        test('groups example rows into scenarioOutline.parameters', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const outlineDetails = new ScenarioDetails(
                new Name('should greet <Developer>'),
                new Category('Greetings'),
                new FileSystemLocation(Path.from('features/greetings.feature'), 3, 1),
            );

            const sceneId1 = CorrelationId.create();
            const sceneId2_ = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
            const t3 = new Timestamp(new Date('2024-01-01T00:00:00.300Z'));
            const t4 = new Timestamp(new Date('2024-01-01T00:00:00.400Z'));

            // Simulate the merged event queue for a scenario outline with 2 rows
            queues.enqueue(new SceneSequenceDetected(sceneId1, outlineDetails, t0));
            queues.enqueue(new SceneTemplateDetected(sceneId1, new Description('Given <Developer> is a contributor\nWhen they visit the project\nThen they should see a greeting'), t0));

            // Row 1
            queues.enqueue(new SceneParametersDetected(sceneId1, outlineDetails, new ScenarioParameters(new Name('contributors'), new Description(''), { Developer: 'jan-molak' }), t0));
            queues.enqueue(new SceneStarts(sceneId1, outlineDetails, t0));

            const activityId1 = CorrelationId.create();
            const activityDetails1 = new ActivityDetails(new Name('Given jan-molak is a contributor'), new FileSystemLocation(Path.from('features/greetings.feature'), 10, 1));
            queues.enqueue(new InteractionStarts(sceneId1, activityId1, activityDetails1, t0));
            queues.enqueue(new InteractionFinished(sceneId1, activityId1, activityDetails1, new ExecutionSuccessful(), t1));
            queues.enqueue(new SceneFinished(sceneId1, outlineDetails, new ExecutionSuccessful(), t2));

            // Row 2
            queues.enqueue(new SceneParametersDetected(sceneId1, outlineDetails, new ScenarioParameters(new Name('contributors'), new Description(''), { Developer: 'alice' }), t2));
            queues.enqueue(new SceneStarts(sceneId1, outlineDetails, t2));

            const activityId2 = CorrelationId.create();
            const activityDetails2 = new ActivityDetails(new Name('Given alice is a contributor'), new FileSystemLocation(Path.from('features/greetings.feature'), 10, 1));
            queues.enqueue(new InteractionStarts(sceneId1, activityId2, activityDetails2, t3));
            queues.enqueue(new InteractionFinished(sceneId1, activityId2, activityDetails2, new ExecutionFailedWithError(new Error('oops')), t4));
            queues.enqueue(new SceneFinished(sceneId1, outlineDetails, new ExecutionFailedWithError(new Error('oops')), t4));

            const runData = collector.collect({
                queues,
                testRunStartedAt: '2024-01-01T00:00:00.000Z',
                testRunnerName: 'Cucumber',
                testRunnerVersion: '12.0.0',
                artifactPaths: new Map(),
                systemContext,
            });

            expect(runData.scenes).toHaveLength(1);
            const scene = runData.scenes[0];

            expect(scene.name).toBe('should greet <Developer>');
            expect(scene.activities).toEqual([]);

            expect(scene.scenarioOutline).toBeDefined();
            expect(scene.scenarioOutline.template).toContain('Given <Developer> is a contributor');
            expect(scene.scenarioOutline.parameters).toHaveLength(2);

            const row1 = scene.scenarioOutline.parameters[0];
            expect(row1.name).toBe('contributors');
            expect(row1.values).toEqual({ Developer: 'jan-molak' });
            expect(row1.outcome.code).toBe(64); // ExecutionSuccessful.Code
            expect(row1.activities).toHaveLength(1);
            expect(row1.activities[0].name).toBe('Given jan-molak is a contributor');

            const row2 = scene.scenarioOutline.parameters[1];
            expect(row2.values).toEqual({ Developer: 'alice' });
            expect(row2.outcome.code).toBe(2); // ExecutionFailedWithError.Code
            expect(row2.activities).toHaveLength(1);
            expect(row2.activities[0].name).toBe('Given alice is a contributor');
        });

        test('merges outline examples with separate sceneIds into one scenarioOutline (Cucumber adapter pattern)', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            // The Cucumber adapter assigns a unique sceneId per example row,
            // but DomainEventQueues merges them into one queue because they share
            // the same ScenarioDetails (name + location).
            const outlineDetails = new ScenarioDetails(
                new Name('People who make Serenity happen'),
                new Category('Reports scenario outlines'),
                new FileSystemLocation(Path.from('features/outlines.feature'), 8, 1),
            );

            const sceneId1 = CorrelationId.create();
            const sceneId2 = CorrelationId.create();
            const sceneId3 = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));
            const t3 = new Timestamp(new Date('2024-01-01T00:00:00.150Z'));
            const t4 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
            const t5 = new Timestamp(new Date('2024-01-01T00:00:00.250Z'));

            // Example row 1 (sceneId1)
            queues.enqueue(new SceneSequenceDetected(sceneId1, outlineDetails, t0));
            queues.enqueue(new SceneTemplateDetected(sceneId1, new Description('When <Developer> makes a contribution'), t0));
            queues.enqueue(new SceneParametersDetected(sceneId1, outlineDetails, new ScenarioParameters(new Name('contributors'), new Description(''), { Developer: 'jan-molak' }), t0));
            queues.enqueue(new SceneStarts(sceneId1, outlineDetails, t0));
            const act1 = CorrelationId.create();
            const actDetails1 = new ActivityDetails(new Name('When jan-molak makes a contribution'), new FileSystemLocation(Path.from('features/outlines.feature'), 10, 1));
            queues.enqueue(new InteractionStarts(sceneId1, act1, actDetails1, t0));
            queues.enqueue(new InteractionFinished(sceneId1, act1, actDetails1, new ExecutionSuccessful(), t1));
            queues.enqueue(new SceneFinished(sceneId1, outlineDetails, new ExecutionSuccessful(), t1));

            // Example row 2 (sceneId2)
            queues.enqueue(new SceneSequenceDetected(sceneId2, outlineDetails, t2));
            queues.enqueue(new SceneTemplateDetected(sceneId2, new Description('When <Developer> makes a contribution'), t2));
            queues.enqueue(new SceneParametersDetected(sceneId2, outlineDetails, new ScenarioParameters(new Name('contributors'), new Description(''), { Developer: 'alice' }), t2));
            queues.enqueue(new SceneStarts(sceneId2, outlineDetails, t2));
            const act2 = CorrelationId.create();
            const actDetails2 = new ActivityDetails(new Name('When alice makes a contribution'), new FileSystemLocation(Path.from('features/outlines.feature'), 10, 1));
            queues.enqueue(new InteractionStarts(sceneId2, act2, actDetails2, t2));
            queues.enqueue(new InteractionFinished(sceneId2, act2, actDetails2, new ExecutionSuccessful(), t3));
            queues.enqueue(new SceneFinished(sceneId2, outlineDetails, new ExecutionSuccessful(), t3));

            // Example row 3 (sceneId3)
            queues.enqueue(new SceneSequenceDetected(sceneId3, outlineDetails, t4));
            queues.enqueue(new SceneTemplateDetected(sceneId3, new Description('When <Developer> makes a contribution'), t4));
            queues.enqueue(new SceneParametersDetected(sceneId3, outlineDetails, new ScenarioParameters(new Name('contributors'), new Description(''), { Developer: 'bob' }), t4));
            queues.enqueue(new SceneStarts(sceneId3, outlineDetails, t4));
            const act3 = CorrelationId.create();
            const actDetails3 = new ActivityDetails(new Name('When bob makes a contribution'), new FileSystemLocation(Path.from('features/outlines.feature'), 10, 1));
            queues.enqueue(new InteractionStarts(sceneId3, act3, actDetails3, t4));
            queues.enqueue(new InteractionFinished(sceneId3, act3, actDetails3, new ExecutionSuccessful(), t5));
            queues.enqueue(new SceneFinished(sceneId3, outlineDetails, new ExecutionSuccessful(), t5));

            const runData = collector.collect({
                queues,
                testRunStartedAt: '2024-01-01T00:00:00.000Z',
                testRunnerName: 'Cucumber',
                testRunnerVersion: '12.0.0',
                artifactPaths: new Map(),
                systemContext,
            });

            // Should produce ONE scene with a scenarioOutline containing 3 parameters
            expect(runData.scenes).toHaveLength(1);
            const scene = runData.scenes[0];

            expect(scene.name).toBe('People who make Serenity happen');
            expect(scene.scenarioOutline).toBeDefined();
            expect(scene.scenarioOutline.template).toContain('When <Developer> makes a contribution');
            expect(scene.scenarioOutline.parameters).toHaveLength(3);

            expect(scene.scenarioOutline.parameters[0].values).toEqual({ Developer: 'jan-molak' });
            expect(scene.scenarioOutline.parameters[0].outcome.code).toBe(ExecutionSuccessful.Code);
            expect(scene.scenarioOutline.parameters[0].activities).toHaveLength(1);
            expect(scene.scenarioOutline.parameters[0].activities[0].name).toBe('When jan-molak makes a contribution');

            expect(scene.scenarioOutline.parameters[1].values).toEqual({ Developer: 'alice' });
            expect(scene.scenarioOutline.parameters[2].values).toEqual({ Developer: 'bob' });

            // Should NOT have retries/attempts — these are examples, not retries
            expect(scene.retries).toBeUndefined();
            expect(scene.attempts).toBeUndefined();

            // Overall outcome should be SUCCESS
            expect(scene.outcome.code).toBe(ExecutionSuccessful.Code);
        });

        test('still treats multiple sceneIds as retries when RetryableSceneDetected is present', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('should allow retry'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('spec/retry.spec.ts'), 5, 1),
            );

            const sceneId1 = CorrelationId.create();
            const sceneId2 = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
            const t3 = new Timestamp(new Date('2024-01-01T00:00:00.300Z'));

            // Attempt 1 (fails) — has RetryableSceneDetected
            queues.enqueue(new SceneSequenceDetected(sceneId1, details, t0));
            queues.enqueue(new SceneParametersDetected(sceneId1, details, new ScenarioParameters(new Name(''), new Description(''), { Retries: 'Attempt #1' }), t0));
            queues.enqueue(new SceneStarts(sceneId1, details, t0));
            queues.enqueue(new RetryableSceneDetected(sceneId1, t0));
            queues.enqueue(new SceneFinished(sceneId1, details, new ExecutionFailedWithAssertionError(new AssertionError('oops')), t1));

            // Attempt 2 (passes) — has RetryableSceneDetected
            queues.enqueue(new SceneSequenceDetected(sceneId2, details, t2));
            queues.enqueue(new SceneParametersDetected(sceneId2, details, new ScenarioParameters(new Name(''), new Description(''), { Retries: 'Attempt #2' }), t2));
            queues.enqueue(new SceneStarts(sceneId2, details, t2));
            queues.enqueue(new RetryableSceneDetected(sceneId2, t2));
            queues.enqueue(new SceneFinished(sceneId2, details, new ExecutionSuccessful(), t3));

            const runData = collector.collect({
                queues,
                testRunStartedAt: '2024-01-01T00:00:00.000Z',
                testRunnerName: 'Playwright',
                testRunnerVersion: '1.50.0',
                artifactPaths: new Map(),
                systemContext,
            });

            expect(runData.scenes).toHaveLength(1);
            const scene = runData.scenes[0];

            // Should be treated as retries, NOT as scenario outline
            expect(scene.retries).toBe(1);
            expect(scene.attempts).toHaveLength(2);
            expect(scene.attempts[0].outcome.code).toBe(ExecutionFailedWithAssertionError.Code);
            expect(scene.attempts[1].outcome.code).toBe(ExecutionSuccessful.Code);
            expect(scene.scenarioOutline).toBeUndefined();
            expect(scene.outcome.code).toBe(ExecutionSuccessful.Code);
        });

        test('does not produce scenarioOutline for regular scenarios', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('simple test'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('test.spec.ts'), 1, 1),
            );
            const sceneId = CorrelationId.create();
            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t1));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Mocha', testRunnerVersion: '11.0.0', artifactPaths: new Map(), systemContext });

            expect(runData.scenes).toHaveLength(1);
            expect(runData.scenes[0].scenarioOutline).toBeUndefined();
        });
    });

    test.describe('HTTP request/response artifacts', () => {

        test('captures HTTPRequestResponse artifact as restQuery on the activity', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('should verify API health'),
                new Category('API Tests'),
                new FileSystemLocation(Path.from('spec/api.spec.ts'), 5, 1),
            );
            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const activityDetails = new ActivityDetails(
                new Name('Tess sends a HEAD request to "/"'),
                new FileSystemLocation(Path.from('spec/api.spec.ts'), 7, 1),
            );

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new InteractionStarts(sceneId, activityId, activityDetails, t0));
            queues.enqueue(new InteractionFinished(sceneId, activityId, activityDetails, new ExecutionSuccessful(), t1));
            queues.enqueue(new ActivityRelatedArtifactGenerated(
                sceneId,
                activityId,
                new Name('HEAD /'),
                HTTPRequestResponse.fromJSON({
                    request: {
                        method: 'head',
                        url: 'https://api.example.com/',
                        headers: { Accept: 'application/json', 'User-Agent': 'axios/1.17.0' },
                    },
                    response: {
                        status: 200,
                        headers: { 'content-type': 'text/html', server: 'nginx' },
                        data: '',
                    },
                }),
                t1,
            ));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t2));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            expect(runData.scenes).toHaveLength(1);
            const activity = runData.scenes[0].activities[0];
            expect(activity.name).toBe('Tess sends a HEAD request to "/"');
            expect(activity.restQuery).toBeDefined();
            expect(activity.restQuery.method).toBe('HEAD');
            expect(activity.restQuery.url).toBe('https://api.example.com/');
            expect(activity.restQuery.statusCode).toBe(200);
            expect(activity.restQuery.requestHeaders).toContain('Accept: application/json');
            expect(activity.restQuery.responseHeaders).toContain('content-type: text/html');
        });

        test('captures request and response bodies when present', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('should create a todo'),
                new Category('API Tests'),
                new FileSystemLocation(Path.from('spec/api.spec.ts'), 20, 1),
            );
            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const activityDetails = new ActivityDetails(
                new Name('Tess sends a POST request to "/todos"'),
                new FileSystemLocation(Path.from('spec/api.spec.ts'), 22, 1),
            );

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new InteractionStarts(sceneId, activityId, activityDetails, t0));
            queues.enqueue(new InteractionFinished(sceneId, activityId, activityDetails, new ExecutionSuccessful(), t1));
            queues.enqueue(new ActivityRelatedArtifactGenerated(
                sceneId,
                activityId,
                new Name('POST /todos'),
                HTTPRequestResponse.fromJSON({
                    request: {
                        method: 'post',
                        url: 'https://api.example.com/todos',
                        headers: { 'Content-Type': 'application/json' },
                        data: { title: 'Buy milk' },
                    },
                    response: {
                        status: 201,
                        headers: { 'content-type': 'application/json' },
                        data: { id: 1, title: 'Buy milk', completed: false },
                    },
                }),
                t1,
            ));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t2));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            const activity = runData.scenes[0].activities[0];
            expect(activity.restQuery.method).toBe('POST');
            expect(activity.restQuery.statusCode).toBe(201);
            expect(activity.restQuery.requestBody).toContain('Buy milk');
            expect(activity.restQuery.responseBody).toContain('Buy milk');
        });
    });

    test.describe('cast collection', () => {

        test('captures actors and their abilities from ActorEntersStage events', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('should place an order'),
                new Category('Checkout'),
                new FileSystemLocation(Path.from('spec/checkout.spec.ts'), 5, 1),
            );
            const sceneId = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new ActorEntersStage(sceneId, {
                name: 'Alice',
                abilities: [
                    { type: 'BrowseTheWeb', class: 'BrowseTheWebWithPlaywright' },
                    { type: 'TakeNotes' },
                ],
            }, t0));
            queues.enqueue(new ActorEntersStage(sceneId, {
                name: 'Bob',
                abilities: [
                    { type: 'CallAnApi', options: { baseURL: 'https://api.example.com' } },
                ],
            }, t0));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t1));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            expect(runData.scenes).toHaveLength(1);
            expect(runData.scenes[0].cast).toBeDefined();
            expect(runData.scenes[0].cast).toHaveLength(2);

            expect(runData.scenes[0].cast[0].name).toBe('Alice');
            expect(runData.scenes[0].cast[0].abilities).toHaveLength(2);
            expect(runData.scenes[0].cast[0].abilities[0].name).toBe('BrowseTheWebWithPlaywright');
            expect(runData.scenes[0].cast[0].abilities[1].name).toBe('TakeNotes');

            expect(runData.scenes[0].cast[1].name).toBe('Bob');
            expect(runData.scenes[0].cast[1].abilities[0].name).toBe('CallAnApi');
            expect(runData.scenes[0].cast[1].abilities[0].details).toContain('https://api.example.com');
        });
    });

    test.describe('text and log artifacts (reportData)', () => {

        test('captures LogEntry artifact as reportData on the activity', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('should log debug info'),
                new Category('Debug'),
                new FileSystemLocation(Path.from('spec/debug.spec.ts'), 5, 1),
            );
            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const activityDetails = new ActivityDetails(
                new Name('Tess logs the current items'),
                new FileSystemLocation(Path.from('spec/debug.spec.ts'), 7, 1),
            );

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new InteractionStarts(sceneId, activityId, activityDetails, t0));
            queues.enqueue(new InteractionFinished(sceneId, activityId, activityDetails, new ExecutionSuccessful(), t1));
            queues.enqueue(new ActivityRelatedArtifactGenerated(
                sceneId,
                activityId,
                new Name('current items'),
                LogEntry.fromJSON({ data: '["buy milk", "feed cat"]' }),
                t1,
            ));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t2));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            const activity = runData.scenes[0].activities[0];
            expect(activity.reportData).toBeDefined();
            expect(activity.reportData).toHaveLength(1);
            expect(activity.reportData[0].title).toBe('current items');
            expect(activity.reportData[0].contents).toContain('buy milk');
        });

        test('captures TextData artifact as reportData on the activity', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('should capture console output'),
                new Category('Scripts'),
                new FileSystemLocation(Path.from('spec/scripts.spec.ts'), 5, 1),
            );
            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const activityDetails = new ActivityDetails(
                new Name('Tess executes a script'),
                new FileSystemLocation(Path.from('spec/scripts.spec.ts'), 7, 1),
            );

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new InteractionStarts(sceneId, activityId, activityDetails, t0));
            queues.enqueue(new InteractionFinished(sceneId, activityId, activityDetails, new ExecutionSuccessful(), t1));
            queues.enqueue(new ActivityRelatedArtifactGenerated(
                sceneId,
                activityId,
                new Name('server log'),
                TextData.fromJSON({ contentType: 'text/plain', data: 'received payment request' }),
                t1,
            ));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t2));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            const activity = runData.scenes[0].activities[0];
            expect(activity.reportData).toBeDefined();
            expect(activity.reportData).toHaveLength(1);
            expect(activity.reportData[0].title).toBe('server log');
            expect(activity.reportData[0].contents).toBe('received payment request');
            expect(activity.reportData[0].contentType).toBe('text/plain');
        });

        test('collects multiple reportData entries on the same activity', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('should collect multiple attachments'),
                new Category('Debug'),
                new FileSystemLocation(Path.from('spec/debug.spec.ts'), 20, 1),
            );
            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const activityDetails = new ActivityDetails(
                new Name('Tess debugs the state'),
                new FileSystemLocation(Path.from('spec/debug.spec.ts'), 22, 1),
            );

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new InteractionStarts(sceneId, activityId, activityDetails, t0));
            queues.enqueue(new InteractionFinished(sceneId, activityId, activityDetails, new ExecutionSuccessful(), t1));
            queues.enqueue(new ActivityRelatedArtifactGenerated(
                sceneId, activityId, new Name('request'),
                LogEntry.fromJSON({ data: 'GET /api/items' }), t1,
            ));
            queues.enqueue(new ActivityRelatedArtifactGenerated(
                sceneId, activityId, new Name('response'),
                LogEntry.fromJSON({ data: '200 OK' }), t1,
            ));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t2));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            const activity = runData.scenes[0].activities[0];
            expect(activity.reportData).toHaveLength(2);
            expect(activity.reportData[0].title).toBe('request');
            expect(activity.reportData[1].title).toBe('response');
        });
    });

    test.describe('JSONData artifacts (reportData)', () => {

        test('captures JSONData artifact as reportData on the activity', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('scenario with JSON data'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('spec/json.spec.ts'), 1, 1),
            );
            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const actDetails = new ActivityDetails(new Name('log JSON payload'), new FileSystemLocation(Path.from('spec/json.spec.ts'), 3, 1));

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new InteractionStarts(sceneId, activityId, actDetails, t0));
            queues.enqueue(new ActivityRelatedArtifactGenerated(
                sceneId, activityId, new Name('API response'),
                JSONData.fromJSON({ status: 'ok', items: [1, 2, 3] }), t1,
            ));
            queues.enqueue(new InteractionFinished(sceneId, activityId, actDetails, new ExecutionSuccessful(), t1));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t2));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            const activity = runData.scenes[0].activities[0];
            expect(activity.reportData).toHaveLength(1);
            expect(activity.reportData[0].title).toBe('API response');
            expect(JSON.parse(activity.reportData[0].contents)).toEqual({ status: 'ok', items: [1, 2, 3] });
        });

        test('does not treat HTTPRequestResponse as generic JSONData', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('scenario with HTTP exchange'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('spec/http.spec.ts'), 1, 1),
            );
            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const actDetails = new ActivityDetails(new Name('send GET /api'), new FileSystemLocation(Path.from('spec/http.spec.ts'), 3, 1));

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new InteractionStarts(sceneId, activityId, actDetails, t0));
            queues.enqueue(new ActivityRelatedArtifactGenerated(
                sceneId, activityId, new Name('HTTP exchange'),
                HTTPRequestResponse.fromJSON({
                    request: { method: 'GET', url: 'http://localhost/api', headers: {} },
                    response: { status: 200, headers: {}, data: { result: true } },
                }), t1,
            ));
            queues.enqueue(new InteractionFinished(sceneId, activityId, actDetails, new ExecutionSuccessful(), t1));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t2));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            const activity = runData.scenes[0].activities[0];
            // Should be captured as restQuery, NOT as reportData
            expect(activity.restQuery).toBeDefined();
            expect(activity.restQuery.method).toBe('GET');
            expect(activity.reportData).toBeUndefined();
        });
    });

    test.describe('video attachment', () => {

        test('attaches video path from sceneArtifactPaths when available', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('scenario with video'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('spec/video.spec.ts'), 1, 1),
            );
            const sceneId = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:01.000Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t1));

            const sceneArtifactPaths = new Map<string, Path[]>();
            sceneArtifactPaths.set(sceneId.value, [
                Path.from('test-runs/2024-01-01/video-abc123.webm'),
            ]);

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext, sceneArtifactPaths });

            expect(runData.scenes[0].video).toBe('test-runs/2024-01-01/video-abc123.webm');
        });

        test('attaches video to retried scene (merged from multiple sceneIds with same project tag)', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('retried scenario with video'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('spec/video-retry.spec.ts'), 5, 1),
            );

            // Use SceneSequenceDetected framing to put all retry events
            // in one queue under a shared sceneId (matching adapter behaviour)
            const sceneId = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.500Z'));
            const t3 = new Timestamp(new Date('2024-01-01T00:00:00.700Z'));

            // Attempt 1: fails
            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new SceneTagged(sceneId, new ProjectTag('my-project'), t0));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionFailedWithAssertionError(new AssertionError('oops')), t1));

            // Attempt 2: passes (same sceneId, same queue)
            queues.enqueue(new SceneStarts(sceneId, details, t2));
            queues.enqueue(new SceneTagged(sceneId, new ProjectTag('my-project'), t2));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t3));

            // Video is associated with the sceneId
            const sceneArtifactPaths = new Map<string, Path[]>();
            sceneArtifactPaths.set(sceneId.value, [
                Path.from('test-runs/2024-01-01/video-final.webm'),
            ]);

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext, sceneArtifactPaths });

            // The SceneRecordBuilder processes multiple SceneStarts/SceneFinished pairs
            // as retry attempts within a single record. Since they share a project tag,
            // the projectRecords.length > 1 branch is exercised.
            expect(runData.scenes).toHaveLength(1);
            expect(runData.scenes[0].retries).toBe(1);
            expect(runData.scenes[0].video).toBe('test-runs/2024-01-01/video-final.webm');
        });

        test('does not attach video when no .webm file is present', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('scenario without video'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('spec/novideo.spec.ts'), 1, 1),
            );
            const sceneId = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:01.000Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t1));

            const sceneArtifactPaths = new Map<string, Path[]>();
            sceneArtifactPaths.set(sceneId.value, [
                Path.from('test-runs/2024-01-01/screenshot-001.png'),
            ]);

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext, sceneArtifactPaths });

            expect(runData.scenes[0].video).toBeUndefined();
        });

        test('does not attach video when sceneArtifactPaths is not provided', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('scenario without artifact paths'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('spec/noartifacts.spec.ts'), 1, 1),
            );
            const sceneId = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:01.000Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t1));

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext });

            expect(runData.scenes[0].video).toBeUndefined();
        });

        test('attaches video to each retry attempt when retries use separate sceneIds', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('retried scenario with video per attempt'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('spec/video-retry-separate.spec.ts'), 5, 1),
            );

            // Playwright adapter pattern: each retry has its own sceneId
            // but they share a queue via SceneSequenceDetected framing
            const sceneId1 = CorrelationId.create();
            const sceneId2 = CorrelationId.create();

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.500Z'));
            const t3 = new Timestamp(new Date('2024-01-01T00:00:00.700Z'));

            // Attempt 1 (fails) — sceneId1
            queues.enqueue(new SceneSequenceDetected(sceneId1, details, t0));
            queues.enqueue(new SceneParametersDetected(sceneId1, details, new ScenarioParameters(new Name(''), new Description(''), { Retries: 'Attempt #1' }), t0));
            queues.enqueue(new SceneStarts(sceneId1, details, t0));
            queues.enqueue(new SceneTagged(sceneId1, new ProjectTag('chromium'), t0));
            queues.enqueue(new SceneFinished(sceneId1, details, new ExecutionFailedWithAssertionError(new AssertionError('oops')), t1));

            // Attempt 2 (passes) — sceneId2
            queues.enqueue(new SceneSequenceDetected(sceneId2, details, t2));
            queues.enqueue(new SceneParametersDetected(sceneId2, details, new ScenarioParameters(new Name(''), new Description(''), { Retries: 'Attempt #2' }), t2));
            queues.enqueue(new SceneStarts(sceneId2, details, t2));
            queues.enqueue(new SceneTagged(sceneId2, new ProjectTag('chromium'), t2));
            queues.enqueue(new SceneFinished(sceneId2, details, new ExecutionSuccessful(), t3));

            // Each attempt has its own video keyed by sceneId
            const sceneArtifactPaths = new Map<string, Path[]>();
            sceneArtifactPaths.set(sceneId1.value, [
                Path.from('test-runs/2024-01-01/video-attempt-1.webm'),
            ]);
            sceneArtifactPaths.set(sceneId2.value, [
                Path.from('test-runs/2024-01-01/video-attempt-2.webm'),
            ]);

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths: new Map(), systemContext, sceneArtifactPaths });

            expect(runData.scenes).toHaveLength(1);
            expect(runData.scenes[0].retries).toBe(1);

            // Scene-level video should be from the first video found
            expect(runData.scenes[0].video).toBe('test-runs/2024-01-01/video-attempt-1.webm');

            // Each attempt should have its own video
            expect(runData.scenes[0].attempts).toHaveLength(2);
            expect(runData.scenes[0].attempts[0].video).toBe('test-runs/2024-01-01/video-attempt-1.webm');
            expect(runData.scenes[0].attempts[1].video).toBe('test-runs/2024-01-01/video-attempt-2.webm');
        });
    });

    test.describe('artifact path tracking', () => {

        test('records artifact file paths from the artifactPaths map on the activity', () => {
            const collector = new SceneDataCollector();
            const queues = new DomainEventQueues();

            const details = new ScenarioDetails(
                new Name('scenario with screenshots'),
                new Category('Suite'),
                new FileSystemLocation(Path.from('spec/screenshots.spec.ts'), 1, 1),
            );
            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const actDetails = new ActivityDetails(new Name('take screenshot'), new FileSystemLocation(Path.from('spec/screenshots.spec.ts'), 3, 1));

            const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
            const t1 = new Timestamp(new Date('2024-01-01T00:00:00.050Z'));
            const t2 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

            queues.enqueue(new SceneStarts(sceneId, details, t0));
            queues.enqueue(new InteractionStarts(sceneId, activityId, actDetails, t0));
            queues.enqueue(new ActivityRelatedArtifactGenerated(
                sceneId, activityId, new Name('screenshot'),
                JSONData.fromJSON({ ignored: true }), t1,
            ));
            queues.enqueue(new InteractionFinished(sceneId, activityId, actDetails, new ExecutionSuccessful(), t1));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t2));

            const artifactPaths = new Map<string, Path[]>();
            artifactPaths.set(activityId.value, [
                Path.from('test-runs/2024-01-01/screenshot-001.png'),
                Path.from('test-runs/2024-01-01/screenshot-002.png'),
            ]);

            const runData = collector.collect({ queues, testRunStartedAt: '2024-01-01T00:00:00.000Z', testRunnerName: 'Playwright', testRunnerVersion: '1.50.0', artifactPaths, systemContext });

            // Artifacts on the activity record (from handleActivityFinished)
            const activity = runData.scenes[0].activities[0];
            expect(activity.artifacts).toHaveLength(2);
            expect(activity.artifacts[0].path).toBe('test-runs/2024-01-01/screenshot-001.png');
            expect(activity.artifacts[1].path).toBe('test-runs/2024-01-01/screenshot-002.png');

            // Also tracked at scene level (from handleArtifact)
            expect(runData.scenes[0].artifacts).toHaveLength(2);
            expect(runData.scenes[0].artifacts[0].activityId).toBe(activityId.value);
        });
    });
});

test.describe('module tagging', () => {

    test('attaches module tag to all scenes when moduleId is provided', () => {
        const collector = new SceneDataCollector();
        const queues = new DomainEventQueues();

        const details1 = new ScenarioDetails(
            new Name('first test'),
            new Category('Suite'),
            new FileSystemLocation(Path.from('test.spec.ts'), 1, 1),
        );
        const details2 = new ScenarioDetails(
            new Name('second test'),
            new Category('Suite'),
            new FileSystemLocation(Path.from('test.spec.ts'), 10, 1),
        );

        const sceneId1 = CorrelationId.create();
        const sceneId2 = CorrelationId.create();

        const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
        const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));
        const t2 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
        const t3 = new Timestamp(new Date('2024-01-01T00:00:00.300Z'));

        // First scenario
        queues.enqueue(new SceneStarts(sceneId1, details1, t0));
        queues.enqueue(new SceneFinished(sceneId1, details1, new ExecutionSuccessful(), t1));

        // Second scenario
        queues.enqueue(new SceneStarts(sceneId2, details2, t2));
        queues.enqueue(new SceneFinished(sceneId2, details2, new ExecutionSuccessful(), t3));

        const runData = collector.collect({
            queues,
            testRunStartedAt: '2024-01-01T00:00:00.000Z',
            testRunnerName: 'Playwright',
            testRunnerVersion: '1.50.0',
            artifactPaths: new Map(),
            systemContext,
            moduleId: 'playwright-test',
        });

        expect(runData.scenes).toHaveLength(2);

        // Both scenes should have the module tag
        const scene1ModuleTag = runData.scenes[0].tags.find(tag => tag.type === 'module');
        expect(scene1ModuleTag).toBeDefined();
        expect(scene1ModuleTag.name).toBe('playwright-test');

        const scene2ModuleTag = runData.scenes[1].tags.find(tag => tag.type === 'module');
        expect(scene2ModuleTag).toBeDefined();
        expect(scene2ModuleTag.name).toBe('playwright-test');

        // The module tag should also appear in the run-level tags collection
        const runModuleTag = runData.tags.find(tag => tag.type === 'module');
        expect(runModuleTag).toBeDefined();
        expect(runModuleTag.name).toBe('playwright-test');
    });

    test('does not attach module tag when moduleId is undefined', () => {
        const collector = new SceneDataCollector();
        const queues = new DomainEventQueues();

        const details = new ScenarioDetails(
            new Name('test without module'),
            new Category('Suite'),
            new FileSystemLocation(Path.from('test.spec.ts'), 1, 1),
        );
        const sceneId = CorrelationId.create();

        const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
        const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));

        queues.enqueue(new SceneStarts(sceneId, details, t0));
        queues.enqueue(new SceneTagged(sceneId, new ArbitraryTag('smoke'), t0));
        queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t1));

        // Do not provide moduleId
        const runData = collector.collect({
            queues,
            testRunStartedAt: '2024-01-01T00:00:00.000Z',
            testRunnerName: 'Mocha',
            testRunnerVersion: '11.0.0',
            artifactPaths: new Map(),
            systemContext,
        });

        expect(runData.scenes).toHaveLength(1);

        // Should have no module tag when moduleId is undefined
        const moduleTags = runData.scenes[0].tags.filter(tag => tag.type === 'module');
        expect(moduleTags).toHaveLength(0);

        // Run-level tags should also have no module tag
        const runModuleTags = runData.tags.filter(tag => tag.type === 'module');
        expect(runModuleTags).toHaveLength(0);
    });

    test('attaches module tag to retried scenes', () => {
        const collector = new SceneDataCollector();
        const queues = new DomainEventQueues();

        const details = new ScenarioDetails(
            new Name('retried test with module'),
            new Category('Suite'),
            new FileSystemLocation(Path.from('test.spec.ts'), 5, 1),
        );
        const sceneId = CorrelationId.create();

        const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
        const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));
        const t2 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
        const t3 = new Timestamp(new Date('2024-01-01T00:00:00.300Z'));

        // Attempt 1: fails
        queues.enqueue(new SceneStarts(sceneId, details, t0));
        queues.enqueue(new SceneFinished(sceneId, details, new ExecutionFailedWithAssertionError(new AssertionError('fail')), t1));

        // Attempt 2: passes
        queues.enqueue(new SceneStarts(sceneId, details, t2));
        queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t3));

        const runData = collector.collect({
            queues,
            testRunStartedAt: '2024-01-01T00:00:00.000Z',
            testRunnerName: 'Playwright',
            testRunnerVersion: '1.50.0',
            artifactPaths: new Map(),
            systemContext,
            moduleId: 'webdriverio-8-devtools',
        });

        expect(runData.scenes).toHaveLength(1);
        expect(runData.scenes[0].retries).toBe(1);

        // Retried scene should have the module tag
        const moduleTag = runData.scenes[0].tags.find(tag => tag.type === 'module');
        expect(moduleTag).toBeDefined();
        expect(moduleTag.name).toBe('webdriverio-8-devtools');
    });

    test('attaches module tag to scenario outline scenes', () => {
        const collector = new SceneDataCollector();
        const queues = new DomainEventQueues();

        const outlineDetails = new ScenarioDetails(
            new Name('outline with <param>'),
            new Category('Suite'),
            new FileSystemLocation(Path.from('outline.feature'), 3, 1),
        );
        const sceneId = CorrelationId.create();

        const t0 = new Timestamp(new Date('2024-01-01T00:00:00.000Z'));
        const t1 = new Timestamp(new Date('2024-01-01T00:00:00.100Z'));
        const t2 = new Timestamp(new Date('2024-01-01T00:00:00.200Z'));
        const t3 = new Timestamp(new Date('2024-01-01T00:00:00.300Z'));

        queues.enqueue(new SceneSequenceDetected(sceneId, outlineDetails, t0));
        queues.enqueue(new SceneTemplateDetected(sceneId, new Description('Given <param>'), t0));

        // Row 1
        queues.enqueue(new SceneParametersDetected(sceneId, outlineDetails, new ScenarioParameters(new Name('examples'), new Description(''), { param: 'foo' }), t0));
        queues.enqueue(new SceneStarts(sceneId, outlineDetails, t0));
        queues.enqueue(new SceneFinished(sceneId, outlineDetails, new ExecutionSuccessful(), t1));

        // Row 2
        queues.enqueue(new SceneParametersDetected(sceneId, outlineDetails, new ScenarioParameters(new Name('examples'), new Description(''), { param: 'bar' }), t2));
        queues.enqueue(new SceneStarts(sceneId, outlineDetails, t2));
        queues.enqueue(new SceneFinished(sceneId, outlineDetails, new ExecutionSuccessful(), t3));

        const runData = collector.collect({
            queues,
            testRunStartedAt: '2024-01-01T00:00:00.000Z',
            testRunnerName: 'Cucumber',
            testRunnerVersion: '12.0.0',
            artifactPaths: new Map(),
            systemContext,
            moduleId: 'cucumber-12',
        });

        expect(runData.scenes).toHaveLength(1);
        expect(runData.scenes[0].scenarioOutline).toBeDefined();

        // Scenario outline should have the module tag
        const moduleTag = runData.scenes[0].tags.find(tag => tag.type === 'module');
        expect(moduleTag).toBeDefined();
        expect(moduleTag.name).toBe('cucumber-12');
    });
});
