import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunFinished, TestRunFinishes, TestRunnerDetected, TestRunStarts } from '@serenity-js/core/lib/events';
import { CapabilityTag, CorrelationId, ExecutionSuccessful, FeatureTag, Name,ThemeTag } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    it('emits requirement tags so that Serenity BDD can aggregate them correctly', () => playwrightTest('--project=default', 'my_super_theme/my_theme/my_capability/my_feature.spec.ts')
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            let currentSceneId: CorrelationId;

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes'));
                    currentSceneId = event.sceneId;
                })
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('My super theme')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ThemeTag('My theme')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('My capability')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('My feature')))

                // triggered by requiring actorCalled
                .next(SceneFinishes,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(SceneFinished,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        }));
});
