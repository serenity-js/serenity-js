import 'mocha';

import * as sinon from 'sinon';

import {
    ActivityFinished,
    ActivityStarts,
    ArtifactGenerated,
    SceneFinished,
    SceneStarts,
    TestRunFinished,
} from '../../../../../src/events';
import { Artifact, FileType } from '../../../../../src/io';
import { ActivityDetails, ExecutionSuccessful, Name } from '../../../../../src/model';
import { SerenityBDDReporter, StageManager } from '../../../../../src/stage';
import { SerenityBDDReport } from '../../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { expect } from '../../../../expect';
import { given } from '../../given';
import { defaultCardScenario, photo } from '../../samples';

describe('SerenityBDDReporter', () => {

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

    beforeEach(() => {
        stageManager = sinon.createStubInstance(StageManager);

        reporter = new SerenityBDDReporter();
        reporter.assignTo(stageManager as any);
    });

    describe('reports the activities that took place during scenario execution:', () => {

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {ActivityStarts}
         * @test {ActivityFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinished}
         */
        it('reports the outcome of a single activity', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                    new ActivityStarts(pickACard),
                    new ActivityFinished(pickACard, new ExecutionSuccessful()),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].description).to.equal(pickACard.name.value);
            expect(report.testSteps[0].result).to.equal('SUCCESS');
        });

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {ActivityStarts}
         * @test {ActivityFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinished}
         */
        it('reports the outcome of a sequence of several activities', () => {
            const pickACard   = new ActivityDetails(new Name('Pick the default credit card'));
            const makePayment = new ActivityDetails(new Name('Make the payment'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                    new ActivityStarts(pickACard),
                    new ActivityFinished(pickACard, new ExecutionSuccessful()),
                    new ActivityStarts(makePayment),
                    new ActivityFinished(makePayment, new ExecutionSuccessful()),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

            expect(report.testSteps).to.have.lengthOf(2);
            expect(report.testSteps[0].description).to.equal(pickACard.name.value);
            expect(report.testSteps[0].result).to.equal('SUCCESS');
            expect(report.testSteps[1].description).to.equal(makePayment.name.value);
            expect(report.testSteps[1].result).to.equal('SUCCESS');
        });

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {ActivityStarts}
         * @test {ActivityFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinished}
         */
        it('reports the outcome of nested activities', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));
            const viewListOfCards = new ActivityDetails(new Name('View the list of available cards'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                    new ActivityStarts(pickACard),
                        new ActivityStarts(viewListOfCards),
                        new ActivityFinished(viewListOfCards, new ExecutionSuccessful()),
                    new ActivityFinished(pickACard, new ExecutionSuccessful()),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

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
         * @test {ActivityStarts}
         * @test {ArtifactGenerated}
         * @test {ActivityFinished}
         * @test {ExecutionSuccessful}
         * @test {SceneFinished}
         * @test {TestRunFinished}
         */
        it('records the events in a correct order', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                    new ActivityStarts(pickACard),
                        new ArtifactGenerated(new Artifact(
                            new Name('photo1.png'),
                            FileType.PNG,
                            photo,
                        )),
                    new ActivityFinished(pickACard, new ExecutionSuccessful()),
                        new ArtifactGenerated(new Artifact(
                            new Name('photo2.png'),
                            FileType.PNG,
                            photo,
                        )),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].screenshots).to.deep.equal([
                { screenshot: 'photo1.png'},
                { screenshot: 'photo2.png'},
            ]);
        });
    });
});
