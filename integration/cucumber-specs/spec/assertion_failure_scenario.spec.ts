import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AssertionError } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { CorrelationId, ExecutionFailedWithAssertionError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises a scenario failing due to an assertion failure', () =>
        cucumber('features/assertion_failure_scenario.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                let currentSceneId: CorrelationId;

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('An assertion failure scenario'));
                        currentSceneId = event.sceneId;
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a scenario failing due to an assertion error')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that fails with an assertion error')))
                    .next(ActivityFinished,    event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                        expect((event.outcome as ExecutionFailedWithAssertionError).error).to.be.instanceOf(AssertionError);
                    })
                    .next(SceneFinishes,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                        expect((event.outcome as ExecutionFailedWithAssertionError).error).to.be.instanceOf(AssertionError);
                    })
                ;
            })
    );

    it('recognises a scenario failing due to a non-Serenity/JS assertion error being thrown', () =>
        cucumber('features/non_serenity_assertion_failure_scenario.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                let currentSceneId: CorrelationId;

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('An assertion failure scenario'));
                        currentSceneId = event.sceneId;
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a scenario failing due to an assertion error')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that fails with a non-Serenity assertion error')))
                    .next(ActivityFinished,    event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                        expect((event.outcome as ExecutionFailedWithAssertionError).error.constructor.name).to.equal('AssertionError');
                    })
                    .next(SceneFinishes,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                        expect((event.outcome as ExecutionFailedWithAssertionError).error.constructor.name).to.equal('AssertionError');
                    });
            })
    );
});
