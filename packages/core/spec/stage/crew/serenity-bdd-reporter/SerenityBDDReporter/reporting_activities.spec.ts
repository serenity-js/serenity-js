import 'mocha';

import * as sinon from 'sinon';

import {
    ActivityRelatedArtifactArchived,
    ActivityRelatedArtifactGenerated,
    ArtifactArchived,
    ArtifactGenerated,
    SceneFinished,
    SceneStarts,
    TaskFinished,
    TaskStarts,
    TestRunFinished,
} from '../../../../../src/events';
import { Path } from '../../../../../src/io';
import { ActivityDetails, ExecutionSuccessful, JSONData, Name, Photo } from '../../../../../src/model';
import { SerenityBDDReporter, StageManager } from '../../../../../src/stage';
import { SerenityBDDReport } from '../../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { expect } from '../../../../expect';
import { given } from '../../given';
import { defaultCardScenario, photo } from '../../samples';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

    beforeEach(() => {
        const env = create();

        stageManager    = env.stageManager;
        reporter        = env.reporter;
    });

    describe('reports the activities that took place during scenario execution:', () => {

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {TaskStarts}
         * @test {TaskFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinished}
         */
        it('reports the outcome of a single activity', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                    new TaskStarts(pickACard),
                    new TaskFinished(pickACard, new ExecutionSuccessful()),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
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
         * @test {TestRunFinished}
         */
        it('reports the outcome of a sequence of several activities', () => {
            const pickACard   = new ActivityDetails(new Name('Pick the default credit card'));
            const makePayment = new ActivityDetails(new Name('Make the payment'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                    new TaskStarts(pickACard),
                    new TaskFinished(pickACard, new ExecutionSuccessful()),
                    new TaskStarts(makePayment),
                    new TaskFinished(makePayment, new ExecutionSuccessful()),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
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
         * @test {TestRunFinished}
         */
        it('reports the outcome of nested activities', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));
            const viewListOfCards = new ActivityDetails(new Name('View the list of available cards'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                    new TaskStarts(pickACard),
                        new TaskStarts(viewListOfCards),
                        new TaskFinished(viewListOfCards, new ExecutionSuccessful()),
                    new TaskFinished(pickACard, new ExecutionSuccessful()),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
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
         * @test {TestRunFinished}
         */
        it('records the events in a correct order', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                    new TaskStarts(pickACard),
                        new ActivityRelatedArtifactGenerated(pickACard, new Name('photo1'), photo),
                        new ActivityRelatedArtifactArchived(pickACard, new Name('photo1'), Photo, new Path('target/site/serenity/photo1.png')),
                    new TaskFinished(pickACard, new ExecutionSuccessful()),
                        new ActivityRelatedArtifactGenerated(pickACard, new Name('photo2'), photo),
                        new ActivityRelatedArtifactArchived(pickACard, new Name('photo2'), Photo, new Path('target/site/serenity/photo2.png')),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].screenshots).to.deep.equal([
                { screenshot: 'photo1.png'},
                { screenshot: 'photo2.png'},
            ]);
        });

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {TaskStarts}
         * @test {TaskFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinished}
         */
        it('records the order of test steps so that the Serenity BDD reporter can display the reportData in the correct context', () => {
            const
                pickACard   = new ActivityDetails(new Name('Pick a credit card')),
                makePayment = new ActivityDetails(new Name('Make a payment'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                    new TaskStarts(pickACard),
                        new ArtifactGenerated(new Name('pick a card message'), JSONData.fromJSON({ card: 'default' })),
                        new ArtifactArchived(new Name('pick a card message'), JSONData, new Path('target/site/serenity/pick-a-card-message-md5hash.json')),
                    new TaskFinished(pickACard, new ExecutionSuccessful()),
                    new TaskStarts(makePayment),
                        new ArtifactGenerated(new Name('make a payment message'), JSONData.fromJSON({ amount: '£42' })),
                        new ArtifactArchived(new Name('make a payment message'), JSONData, new Path('target/site/serenity/make-a-payment-message-md5hash.json')),
                    new TaskFinished(makePayment, new ExecutionSuccessful()),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

            expect(report.testSteps).to.have.lengthOf(2);
            expect(report.testSteps[0].number).to.equal(1);
            expect(report.testSteps[0].reportData.title).to.equal('pick a card message');
            expect(report.testSteps[0].reportData.contents).to.equal('{\n    "card": "default"\n}');

            expect(report.testSteps[1].number).to.equal(2);
            expect(report.testSteps[1].reportData.title).to.equal('make a payment message');
            expect(report.testSteps[1].reportData.contents).to.deep.equal('{\n    \"amount\": \"£42\"\n}');
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
         * @test {TestRunFinished}
         */
        it('records the arbitrary JSON data emitted during the interaction', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                new TaskStarts(pickACard),
                new ActivityRelatedArtifactGenerated(pickACard, new Name('photo1'), photo),
                new ActivityRelatedArtifactArchived(pickACard, new Name('photo1'), Photo, new Path('target/site/serenity/photo1.png')),
                new TaskFinished(pickACard, new ExecutionSuccessful()),
                new ActivityRelatedArtifactGenerated(pickACard, new Name('photo2'), photo),
                new ActivityRelatedArtifactArchived(pickACard, new Name('photo2'), Photo, new Path('target/site/serenity/photo2.png')),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].screenshots).to.deep.equal([
                { screenshot: 'photo1.png'},
                { screenshot: 'photo2.png'},
            ]);
        });
    });
});
