import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AssertionError, TestCompromisedError } from '@serenity-js/core';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { trimmed } from '@serenity-js/core/lib/io';
import { ExecutionCompromised, ExecutionFailedWithAssertionError, ExecutionFailedWithError, FeatureTag, Name, ProblemIndication } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { mocha } from '../src/mocha';

describe('@serenity-js/mocha', function () {

    this.timeout(30000);

    describe('recognises a failing scenario that', () => {

        it('throws an error', () => mocha('examples/failing/error-thrown.spec.js')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails when an error is thrown')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                    .next(SceneFinished,       event => {
                        const outcome: ProblemIndication = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal('Something happened');
                    })
                ;
            }));

        it('passes a non-error to done()', () => mocha('examples/failing/non-error-in-done.spec.js')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails when a non-error is passed to done()')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                    .next(SceneFinished,       event => {
                        const outcome: ProblemIndication = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal('done() invoked with non-Error: Something happened');
                    })
                ;
            }));

        it('passes an error to done()', () => mocha('examples/failing/error-in-done.spec.js')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails when an error is passed to done()')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                    .next(SceneFinished,       event => {
                        const outcome: ProblemIndication = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal('Something happened');
                    })
                ;
            }));

        it('fails because of a failing assertion', () => mocha('examples/failing/failing-assertion.spec.js')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails when the assertion fails')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                    .next(SceneFinished,       event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                        const error = outcome.error as AssertionError;

                        expect(error.message).to.equal(trimmed`
                            | Expected values to be strictly equal:
                            |
                            | false !== true
                            |
                        `)
                    })
                ;
            }));

        it('is compromised', () => mocha('examples/failing/test-compromised.spec.js')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario is compromised')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                    .next(SceneFinished,       event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionCompromised);

                        const error = outcome.error as TestCompromisedError;

                        expect(error).to.be.instanceof(TestCompromisedError);
                        expect(error.message).to.equal(`DB is down, pleas cheer it up`);
                    })
                ;
            }));
    });
});
