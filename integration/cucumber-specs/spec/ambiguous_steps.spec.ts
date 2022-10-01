import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { CorrelationId, ExecutionFailedWithError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises scenarios with ambiguous steps', () =>
        cucumber('features/passing_scenario.feature', 'ambiguous.steps.ts')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                let currentSceneId: CorrelationId;

                PickEvent.from(result.events)
                    .next(SceneStarts, event => {
                        expect(event.details.name).to.equal(new Name('A passing scenario'))

                        currentSceneId = event.sceneId;
                    })
                    .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                    .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                    .next(ActivityFinished, event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                        const error = (event.outcome as ExecutionFailedWithError).error;

                        const lines = error.message.split('\n');

                        expect(lines[0]).to.equal('Multiple step definitions match:');
                        expect(lines[1]).to.contain('/^.*step .* passes$/');
                        expect(lines[2]).to.contain('/^.*step .* passes$/');
                    })
                    .next(SceneFinishes, event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished, event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                        const error = (event.outcome as ExecutionFailedWithError).error;

                        expect(error.message).to.match(/^Multiple step definitions match/);
                    })
                ;
            })
    );
});
