/* eslint-disable unicorn/filename-case, @typescript-eslint/indent */
import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Stage } from '@serenity-js/core';
import { ArtifactGenerated, FeatureNarrativeDetected, SceneBackgroundDetected, SceneDescriptionDetected, SceneFinished, SceneStarts, TestRunFinishes } from '@serenity-js/core/lib/events';
import { CorrelationId, Description, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { beforeEach, describe, it } from 'mocha';

import { defaultCardScenario } from '../../samples';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    const sceneId = new CorrelationId('a-scene-id');

    let stage: Stage,
        recorder: EventRecorder;

    beforeEach(() => {
        const env = create();

        stage       = env.stage;
        recorder    = env.recorder;
    });

    it('captures information about scenario background', () => {
        stage.announce(
            new SceneStarts(sceneId, defaultCardScenario),
            new SceneBackgroundDetected(sceneId, new Name('Background title'), new Description('Background description')),
            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.backgroundTitle).to.equal('Background title');
                expect(report.backgroundDescription).to.equal('Background description');
            });
    });

    it('captures the description of the scenario', () => {
        stage.announce(
            new SceneStarts(sceneId, defaultCardScenario),
            new SceneDescriptionDetected(sceneId, new Description('Scenario description')),
            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.description).to.equal('Scenario description');
            });
    });

    it('captures the narrative behind the scenario', () => {
        stage.announce(
            new SceneStarts(sceneId, defaultCardScenario),
            new FeatureNarrativeDetected(sceneId, new Description('Feature narrative')),
            new SceneFinished(sceneId, defaultCardScenario, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        PickEvent.from(recorder.events)
            .last(ArtifactGenerated, event => {
                const report = event.artifact.map(_ => _);

                expect(report.userStory.narrative).to.equal('Feature narrative');
            });
    });
});
