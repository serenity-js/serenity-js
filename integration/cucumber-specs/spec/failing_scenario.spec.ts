import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
} from '@serenity-js/core/lib/events';
import { CorrelationId, ExecutionFailedWithError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises a failing scenario', () =>
        cucumber('features/failing_scenario.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                let currentSceneId: CorrelationId;

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event).to.be.instanceOf(TestRunStarts))
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A failing scenario'));
                        currentSceneId = event.sceneId;
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a failing scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that fails with a generic error')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(SceneFinishes,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                    })
                    .next(TestRunFinishes,     event => expect(event).to.be.instanceOf(TestRunFinishes))
                    .next(TestRunFinished,     event => expect(event).to.be.instanceOf(TestRunFinished))
                ;
            })
    );

    it('recognises scenarios failing due to a generic error', () =>
        cucumber('features/failing_scenario.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                let currentSceneId: CorrelationId;

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event).to.be.instanceOf(TestRunStarts))
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A failing scenario'))
                        expect(event.details.location.path.value).to.match(/features\/failing_scenario.feature$/)
                        expect(event.details.location.line).to.equal(3);
                        expect(event.details.location.column).to.equal(3);

                        currentSceneId = event.sceneId;
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a failing scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that fails with a generic error')))
                    .next(ActivityFinished,    event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError)
                        const outcome = event.outcome as ExecutionFailedWithError;

                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.match(/Something's wrong/);
                    })
                    .next(SceneFinishes,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);

                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError)
                        const outcome = event.outcome as ExecutionFailedWithError;

                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.match(/Something's wrong/);
                    })
                    .next(TestRunFinishes,     event => expect(event).to.be.instanceOf(TestRunFinishes))
                    .next(TestRunFinished,     event => expect(event).to.be.instanceOf(TestRunFinished))
                ;
            }));
});
