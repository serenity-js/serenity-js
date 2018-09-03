import 'mocha';

import * as sinon from 'sinon';

import {
    FeatureNarrativeDetected,
    SceneBackgroundDetected,
    SceneDescriptionDetected,
    SceneFinished,
    SceneStarts,
    TestRunFinished,
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

    /**
     * @test {SerenityBDDReporter}
     * @test {SceneStarts}
     * @test {SceneBackgroundDetected}
     * @test {SceneFinished}
     * @test {ExecutionSuccessful}
     * @test {TestRunFinished}
     */
    it('captures information about scenario background', () => {
        given(reporter).isNotifiedOfFollowingEvents(
            new SceneStarts(defaultCardScenario),
                new SceneBackgroundDetected(new Name('Background title'), new Description('Background description')),
            new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinished(),
        );

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

        expect(report.backgroundTitle).to.equal('Background title');
        expect(report.backgroundDescription).to.equal('Background description');
    });

    /**
     * @test {SerenityBDDReporter}
     * @test {SceneStarts}
     * @test {SceneDescriptionDetected}
     * @test {SceneFinished}
     * @test {ExecutionSuccessful}
     * @test {TestRunFinished}
     */
    it('captures the description of the scenario', () => {
        given(reporter).isNotifiedOfFollowingEvents(
            new SceneStarts(defaultCardScenario),
            new SceneDescriptionDetected(new Description('Scenario description')),
            new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinished(),
        );

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

        expect(report.description).to.equal('Scenario description');
    });

    /**
     * @test {SerenityBDDReporter}
     * @test {SceneStarts}
     * @test {FeatureNarrativeDetected}
     * @test {SceneFinished}
     * @test {ExecutionSuccessful}
     * @test {TestRunFinished}
     */
    it('captures the narrative behind the scenario', () => {
        given(reporter).isNotifiedOfFollowingEvents(
            new SceneStarts(defaultCardScenario),
            new FeatureNarrativeDetected(new Description('Feature narrative')),
            new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinished(),
        );

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

        expect(report.userStory.narrative).to.equal('Feature narrative');
    });
});
