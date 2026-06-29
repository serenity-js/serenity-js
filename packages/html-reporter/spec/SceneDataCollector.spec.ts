import { expect, test } from '@playwright/test';
import { DomainEventQueues, Timestamp } from '@serenity-js/core';
import {
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTagged,
    SceneTemplateDetected,
} from '@serenity-js/core/events';
import { FileSystemLocation, Path } from '@serenity-js/core/io';
import {
    ActivityDetails,
    Category,
    CorrelationId,
    Description,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSuccessful,
    Name,
    ScenarioDetails,
    ScenarioParameters,
    Tag,
} from '@serenity-js/core/model';

import { SceneDataCollector } from '../src/SceneDataCollector.js';

const systemContext = { nodeVersion: 'v22', os: { name: 'linux', version: '6', arch: 'x64' }, serenityVersion: '3.44.0', testRunner: { name: 'Playwright', version: '1.50.0' }, browsers: [], runtime: { provider: 'node', version: 'v22' } };

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
            queues.enqueue(new SceneTagged(sceneId, new Tag('retried', 'retried'), t0));
            const act1 = CorrelationId.create();
            const actDetails1 = new ActivityDetails(new Name('Tess ensures that 0 does equal 2'), new FileSystemLocation(Path.from('spec/retries.spec.ts'), 10, 1));
            queues.enqueue(new InteractionStarts(sceneId, act1, actDetails1, t0));
            queues.enqueue(new InteractionFinished(sceneId, act1, actDetails1, new ExecutionFailedWithAssertionError(new Error('Expected 0 to equal 2')), t1));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionFailedWithAssertionError(new Error('Expected 0 to equal 2')), t2));

            // Attempt 2: succeeds
            queues.enqueue(new SceneStarts(sceneId, details, t3));
            queues.enqueue(new SceneTagged(sceneId, new Tag('retried', 'retried'), t3));
            const act2 = CorrelationId.create();
            const actDetails2 = new ActivityDetails(new Name('Tess ensures that 2 does equal 2'), new FileSystemLocation(Path.from('spec/retries.spec.ts'), 10, 1));
            queues.enqueue(new InteractionStarts(sceneId, act2, actDetails2, t3));
            queues.enqueue(new InteractionFinished(sceneId, act2, actDetails2, new ExecutionSuccessful(), t4));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t5));

            const runData = collector.collect(queues, '2024-01-01T00:00:00.000Z', 'Playwright', '1.50.0', new Map(), systemContext);

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

            const runData = collector.collect(queues, '2024-01-01T00:00:00.000Z', 'Mocha', '11.0.0', new Map(), systemContext);

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
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionFailedWithAssertionError(new Error('fail')), t1));

            // Attempt 2: passes
            queues.enqueue(new SceneStarts(sceneId, details, t2));
            queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful(), t3));

            const runData = collector.collect(queues, '2024-01-01T00:00:00.000Z', 'Playwright', '1.50.0', new Map(), systemContext);

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

            const runData = collector.collect(
                queues,
                '2024-01-01T00:00:00.000Z',
                'Cucumber',
                '12.0.0',
                new Map(),
                { nodeVersion: 'v22', os: { name: 'linux', version: '6', arch: 'x64' }, serenityVersion: '3.44.0', testRunner: { name: 'Cucumber', version: '12.0.0' }, browsers: [], runtime: { provider: 'node', version: 'v22' } },
            );

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

            const runData = collector.collect(queues, '2024-01-01T00:00:00.000Z', 'Mocha', '11.0.0', new Map(), { nodeVersion: 'v22', os: { name: 'linux', version: '6', arch: 'x64' }, serenityVersion: '3.44.0', testRunner: { name: 'Mocha', version: '11.0.0' }, browsers: [], runtime: { provider: 'node', version: 'v22' } });

            expect(runData.scenes).toHaveLength(1);
            expect(runData.scenes[0].scenarioOutline).toBeUndefined();
        });
    });
});
