import 'mocha';

import * as sinon from 'sinon';

import {
    ActivityBegins,
    ActivityDetails,
    ActivityFinished,
    ArtifactGenerated,
    ExecutionSuccessful,
    Name,
    SceneBegins,
    SceneFinished,
} from '../../../../../src/domain';
import { Artifact, FileType } from '../../../../../src/io';
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

        it('reports the outcome of a single activity', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneBegins(defaultCardScenario),
                    new ActivityBegins(pickACard),
                    new ActivityFinished(pickACard, new ExecutionSuccessful()),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].description).to.equal(pickACard.name.value);
            expect(report.testSteps[0].result).to.equal('SUCCESS');
        });

        it('reports the outcome of nested activities', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));
            const viewListOfCards = new ActivityDetails(new Name('View the list of available cards'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneBegins(defaultCardScenario),
                    new ActivityBegins(pickACard),
                        new ActivityBegins(viewListOfCards),
                        new ActivityFinished(viewListOfCards, new ExecutionSuccessful()),
                    new ActivityFinished(pickACard, new ExecutionSuccessful()),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
            );

            const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

            expect(report.testSteps).to.have.lengthOf(1);
            expect(report.testSteps[0].children).to.have.lengthOf(1);
            expect(report.testSteps[0].children[0].description).to.equal(viewListOfCards.name.value);
            expect(report.testSteps[0].children[0].result).to.equal('SUCCESS');
        });
    });

    describe('order of events', () => {

        it('records the events in a correct order', () => {
            const pickACard = new ActivityDetails(new Name('Pick the default credit card'));

            given(reporter).isNotifiedOfFollowingEvents(
                new SceneBegins(defaultCardScenario),
                    new ActivityBegins(pickACard),
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
