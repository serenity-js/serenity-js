import 'mocha';

import * as sinon from 'sinon';

import {
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneStarts,
} from '../../../../../src/events';
import { Description, ExecutionSuccessful, Name } from '../../../../../src/model';
import { SerenityBDDReporter, StageManager } from '../../../../../src/stage';
import { SerenityBDDReport } from '../../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { expect } from '../../../../expect';
import { given } from '../../given';
import { defaultCardScenario } from '../../samples';

describe('SerenityBDDReporter', () => {

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

    beforeEach(() => {
        stageManager = sinon.createStubInstance(StageManager);

        reporter = new SerenityBDDReporter();
        reporter.assignTo(stageManager as any);
    });


    it('captures information about scenario background', () => {
        given(reporter).isNotifiedOfFollowingEvents(
            new SceneStarts(defaultCardScenario),
                new SceneBackgroundDetected(new Name('Background title'), new Description('Background description')),
            new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
        );

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

        expect(report.backgroundTitle).to.equal('Background title');
        expect(report.backgroundDescription).to.equal('Background description');
    });

    it('captures the description of the scenario', () => {
        given(reporter).isNotifiedOfFollowingEvents(
            new SceneStarts(defaultCardScenario),
            new SceneDescriptionDetected(new Description('Scenario description')),
            new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
        );

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

        expect(report.description).to.equal('Scenario description');
    });
});
