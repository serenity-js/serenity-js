import { expect } from '@integration/testing-tools';
import { DomainEventQueues, Timestamp } from '@serenity-js/core';
import {
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTemplateDetected,
} from '@serenity-js/core/events';
import { FileSystemLocation, Path } from '@serenity-js/core/io';
import {
    ActivityDetails,
    Category,
    CorrelationId,
    Description,
    ExecutionFailedWithError,
    ExecutionSuccessful,
    Name,
    ScenarioDetails,
    ScenarioParameters,
} from '@serenity-js/core/model';
import { describe, it } from 'mocha';

import { SceneDataCollector } from '../src/SceneDataCollector.js';

describe('SceneDataCollector', () => {

    describe('scenario outline support', () => {

        it('groups example rows into scenarioOutline.parameters', () => {
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

            expect(runData.scenes).to.have.lengthOf(1);
            const scene = runData.scenes[0];

            expect(scene.name).to.equal('should greet <Developer>');
            expect(scene.activities).to.deep.equal([]);

            expect(scene.scenarioOutline).to.exist;
            expect(scene.scenarioOutline.template).to.contain('Given <Developer> is a contributor');
            expect(scene.scenarioOutline.parameters).to.have.lengthOf(2);

            const row1 = scene.scenarioOutline.parameters[0];
            expect(row1.name).to.equal('contributors');
            expect(row1.values).to.deep.equal({ Developer: 'jan-molak' });
            expect(row1.outcome.code).to.equal(64); // ExecutionSuccessful.Code
            expect(row1.activities).to.have.lengthOf(1);
            expect(row1.activities[0].name).to.equal('Given jan-molak is a contributor');

            const row2 = scene.scenarioOutline.parameters[1];
            expect(row2.values).to.deep.equal({ Developer: 'alice' });
            expect(row2.outcome.code).to.equal(2); // ExecutionFailedWithError.Code
            expect(row2.activities).to.have.lengthOf(1);
            expect(row2.activities[0].name).to.equal('Given alice is a contributor');
        });

        it('does not produce scenarioOutline for regular scenarios', () => {
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

            expect(runData.scenes).to.have.lengthOf(1);
            expect(runData.scenes[0].scenarioOutline).to.be.undefined;
        });
    });
});
