import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AssertionError } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { trimmed } from '@serenity-js/core/lib/io';
import { ExecutionFailedWithAssertionError, ExecutionFailedWithError, FeatureTag, Name, ProblemIndication } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { jasmine } from '../src/jasmine';

describe('@serenity-js/jasmine', function () {

    describe('recognises a failing scenario that', () => {

        it('has an explicit call to fail()', () => jasmine('examples/failing/marked-as-failing.spec.js')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails when marked as failed')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(SceneFinished,       event => {
                        const outcome: ProblemIndication = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal('Failed: Something happened');
                    })
                ;
            }));

        it('throws an error', () => jasmine('examples/failing/error-thrown.spec.js')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails when an error is thrown')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(SceneFinished,       event => {
                        const outcome: ProblemIndication = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal('Something happened');
                    })
                ;
            }));

        it('fails because of a failing assertion', () => jasmine('examples/failing/assertion-fails.spec.js')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails when the assertion fails')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(SceneFinished,       event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                        const error = outcome.error as AssertionError;

                        expect(error).to.be.instanceof(AssertionError);
                        expect(error.message).to.equal(trimmed`
                            | Expected false to equal true.
                            |
                            | Expected boolean: true
                            | Received boolean: false
                            |`);
                        expect(error.cause.message).to.equal(`Expected false to equal true.`);
                    })
                ;
            }));

        it('has multiple failing assertions, which will be wrapped in individual activities', () => jasmine('examples/failing/multiple-failures.spec.js')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario can fail with multiple failures')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Expectation')))
                    .next(ActivityFinished,    event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect(outcome.error.message).to.equal('Failed: first issue');
                    })
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Expectation')))
                    .next(ActivityFinished,    event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect(outcome.error.message).to.equal('Failed: second issue');
                    })
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Expectation')))
                    .next(ActivityFinished,    event => {
                        const outcome: ProblemIndication = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                        const error = outcome.error as AssertionError;

                        expect(error).to.be.instanceof(AssertionError);
                        expect(error.message).to.match(new RegExp(trimmed`
                            | Expected false to equal true.
                            |
                            | Expected boolean: true
                            | Received boolean: false
                            |
                            | \\s{4}at .*/examples/failing/multiple-failures.spec.js:5:9
                        `));
                        expect(error.cause.message).to.equal(`Expected false to equal true.`);
                    })
                    .next(SceneFinished,       event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal('Failed: first issue');
                    })
                ;
            }));
    });
});
