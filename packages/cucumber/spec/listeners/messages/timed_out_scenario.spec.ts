/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', function () {

    this.timeout(10000);

    describe('when working with Cucumber 7', () => {

        it('recognises a timed out scenario',  () =>

            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                './examples/features/timed_out_scenario.feature',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A timed out scenario')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a timed out scenario')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that times out')))
                    .next(ActivityFinished,    event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect((event.outcome as ExecutionFailedWithError).error.message).to.match(/function timed out.*100 milliseconds/);
                    })
                    .next(SceneFinishes,       event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect((event.outcome as ExecutionFailedWithError).error.message).to.match(/function timed out.*100 milliseconds/);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect((event.outcome as ExecutionFailedWithError).error.message).to.match(/function timed out.*100 milliseconds/);
                    })
                ;
            }));
    });
});
