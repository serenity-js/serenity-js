/* eslint-disable unicorn/filename-case, @typescript-eslint/indent */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { StageManager } from '@serenity-js/core';
import {
    ActivityRelatedArtifactArchived,
    ActivityRelatedArtifactGenerated,
    SceneFinished,
    SceneStarts,
    TaskFinished,
    TaskStarts,
    TestRunFinishes,
} from '@serenity-js/core/lib/events';
import { Path } from '@serenity-js/core/lib/io';
import { ActivityDetails, CorrelationId, ExecutionSuccessful, JSONData, Name, Photo, TextData, Timestamp } from '@serenity-js/core/lib/model';
import * as sinon from 'sinon';

import { SerenityBDDReporter } from '../../../../../src/stage';
import { SerenityBDDReport } from '../../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { given } from '../../given';
import { defaultCardScenario, photo } from '../../samples';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

    const
        sceneId = new CorrelationId('a-scene-id'),
        activityIds = [ new CorrelationId('activity-0'), new CorrelationId('activity-1') ];

    beforeEach(() => {
        const env = create();

        stageManager    = env.stageManager;
        reporter        = env.reporter;
    });

    describe('when reporting activities that took place during scenario execution', () => {

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {TaskStarts}
         * @test {TaskFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinishes}
         */
        it('reports the outcome of a single activity', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].description).to.equal(pickACard.name.value);
            expect(report.testSteps[0].result).to.equal('SUCCESS');
        });

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {TaskStarts}
         * @test {TaskFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinishes}
         */
        it('reports the outcome of a sequence of several activities', () => {
            const pickACard   = new ActivityDetails(new Name('Pick the default credit card'));
            const makePayment = new ActivityDetails(new Name('Make the payment'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                    new TaskStarts(sceneId, activityIds[1], makePayment),
                    new TaskFinished(sceneId, activityIds[1], makePayment, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

            expect(report.testSteps).to.have.lengthOf(2);
            expect(report.testSteps[0].description).to.equal(pickACard.name.value);
            expect(report.testSteps[0].result).to.equal('SUCCESS');
            expect(report.testSteps[1].description).to.equal(makePayment.name.value);
            expect(report.testSteps[1].result).to.equal('SUCCESS');
        });

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {TaskStarts}
         * @test {TaskFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinishes}
         */
        it('reports the outcome of nested activities', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));
            const viewListOfCards = new ActivityDetails(new Name('View the list of available cards'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                        new TaskStarts(sceneId, activityIds[1], viewListOfCards),
                        new TaskFinished(sceneId, activityIds[1], viewListOfCards, new ExecutionSuccessful()),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].children).to.have.lengthOf(1);
            expect(report.testSteps[0].children[0].description).to.equal(viewListOfCards.name.value);
            expect(report.testSteps[0].children[0].result).to.equal('SUCCESS');
        });
    });

    describe('order of events', () => {

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {TaskStarts}
         * @test {ArtifactGenerated}
         * @test {TaskFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinishes}
         */
        it('records the events in a correct order', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            const t1 = new Timestamp(new Date(0));
            const t2 = new Timestamp(new Date(10));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('photo1'), photo),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('photo1'), Photo, new Path('target/site/serenity/photo1.png'), t1),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('photo2'), photo),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('photo2'), Photo, new Path('target/site/serenity/photo2.png'), t2),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].screenshots).to.deep.equal([
                { screenshot: 'photo1.png', timeStamp: t1.toMillisecondTimestamp() },
                { screenshot: 'photo2.png', timeStamp: t2.toMillisecondTimestamp() },
            ]);
        });

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {TaskStarts}
         * @test {TaskFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinishes}
         */
        it('records the order of test steps so that the Serenity BDD reporter can display the reportData in the correct context', () => {
            const
                pickACard   = new ActivityDetails(new Name('Pick a credit card')),
                makePayment = new ActivityDetails(new Name('Make a payment'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('pick a card message'), JSONData.fromJSON({ card: 'default' })),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('pick a card message'), JSONData, new Path('target/site/serenity/pick-a-card-message-md5hash.json')),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                    new TaskStarts(sceneId, activityIds[1], makePayment),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[1], new Name('make a payment message'), JSONData.fromJSON({ amount: '£42' })),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[1], new Name('make a payment message'), JSONData, new Path('target/site/serenity/make-a-payment-message-md5hash.json')),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[1], new Name('server log'), TextData.fromJSON({ contentType: 'text/plain', data: 'received payment request' })),
                    new TaskFinished(sceneId, activityIds[1], makePayment, new ExecutionSuccessful()),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

            expect(report.testSteps).to.have.lengthOf(2);
            expect(report.testSteps[0].number).to.equal(1);
            expect(report.testSteps[0].reportData[0].title).to.equal('pick a card message');
            expect(report.testSteps[0].reportData[0].contents).to.equal('{\n    "card": "default"\n}');

            expect(report.testSteps[1].number).to.equal(2);

            expect(report.testSteps[1].reportData[0].title).to.equal('make a payment message');
            expect(report.testSteps[1].reportData[0].contents).to.deep.equal('{\n    "amount": "£42"\n}');

            expect(report.testSteps[1].reportData[1].title).to.equal('server log');
            expect(report.testSteps[1].reportData[1].contents).to.deep.equal('received payment request');
        });
    });

    describe('artifacts', () => {

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {TaskStarts}
         * @test {ArtifactGenerated}
         * @test {TaskFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinishes}
         */
        it('records the arbitrary JSON data emitted during the interaction', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            const t1 = new Timestamp(new Date(0));
            const t2 = new Timestamp(new Date(10));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(sceneId, defaultCardScenario),
                    new TaskStarts(sceneId, activityIds[0], pickACard),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('photo1'), photo),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('photo1'), Photo, new Path('target/site/serenity/photo1.png'), t1),
                    new TaskFinished(sceneId, activityIds[0], pickACard, new ExecutionSuccessful()),
                        new ActivityRelatedArtifactGenerated(sceneId, activityIds[0], new Name('photo2'), photo),
                        new ActivityRelatedArtifactArchived(sceneId, activityIds[0], new Name('photo2'), Photo, new Path('target/site/serenity/photo2.png'), t2),
                new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].screenshots).to.deep.equal([
                { screenshot: 'photo1.png', timeStamp: t1.toMillisecondTimestamp() },
                { screenshot: 'photo2.png', timeStamp: t2.toMillisecondTimestamp() },
            ]);
        });
    });
});
