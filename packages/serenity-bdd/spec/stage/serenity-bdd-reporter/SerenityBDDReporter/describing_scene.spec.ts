import { expect } from '@integration/testing-tools';
import { StageManager } from '@serenity-js/core';
import { FeatureNarrativeDetected, SceneBackgroundDetected, SceneDescriptionDetected, SceneFinished, SceneStarts, TestRunFinished } from '@serenity-js/core/lib/events';
import { Description, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import 'mocha';
import * as sinon from 'sinon';

import { SerenityBDDReporter } from '../../../../src';
import { SerenityBDDReport } from '../../../../src/stage/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { given } from '../../given';
import { defaultCardScenario } from '../../samples';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

    beforeEach(() => {
        const env = create();

        stageManager    = env.stageManager;
        reporter        = env.reporter;
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

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

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

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

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

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

        expect(report.userStory.narrative).to.equal('Feature narrative');
    });
});
