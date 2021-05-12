/* eslint-disable unicorn/filename-case */
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
import { ExecutionFailedWithError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it('recognises scenarios failing due to a generic error', () =>

            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                './examples/features/failing_scenario.feature',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event).to.be.instanceOf(TestRunStarts))
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A failing scenario'))
                        expect(event.details.location.path.value).to.match(/examples\/features\/failing_scenario.feature$/)
                        expect(event.details.location.line).to.equal(3);
                        expect(event.details.location.column).to.equal(3);
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('A failing feature')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that fails with a generic error')))
                    .next(ActivityFinished,    event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError)
                        const outcome = event.outcome as ExecutionFailedWithError;

                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal(`Something's wrong`);
                    })
                    .next(SceneFinishes,       event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError)
                        const outcome = event.outcome as ExecutionFailedWithError;

                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal(`Something's wrong`);
                    })
                    .next(SceneFinished,       event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError)
                        const outcome = event.outcome as ExecutionFailedWithError;

                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal(`Something's wrong`);
                    })
                    .next(TestRunFinishes,     event => expect(event).to.be.instanceOf(TestRunFinishes))
                    .next(TestRunFinished,     event => expect(event).to.be.instanceOf(TestRunFinished))
                ;
            }));
    });
});
