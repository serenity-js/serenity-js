import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { CorrelationId, ExecutionFailedWithError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises a timed out scenario',  () =>
        cucumber('features/timed_out_scenario.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                let currentSceneId: CorrelationId;

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A timed out scenario'));
                        currentSceneId = event.sceneId;
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a timed out scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that times out')))
                    .next(ActivityFinished,    event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect((event.outcome as ExecutionFailedWithError).error.message).to.match(/function timed out.*100 milliseconds/);
                    })
                    .next(SceneFinishes,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect((event.outcome as ExecutionFailedWithError).error.message).to.match(/function timed out.*100 milliseconds/);
                    })
                ;
            })
    );
});
