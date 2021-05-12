/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AssertionError } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithAssertionError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it('recognises a scenario failing due to an assertion error', () =>

            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                './examples/features/assertion_failure_scenario.feature',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('An assertion failure scenario')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a scenario failing due to an assertion error')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that fails with an assertion error')))
                    .next(ActivityFinished,    event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                        expect((event.outcome as ExecutionFailedWithAssertionError).error).to.be.instanceOf(AssertionError);
                    })
                    .next(SceneFinishes,       event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                        expect((event.outcome as ExecutionFailedWithAssertionError).error).to.be.instanceOf(AssertionError);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                        expect((event.outcome as ExecutionFailedWithAssertionError).error).to.be.instanceOf(AssertionError);
                    });
            }));
    });
});
