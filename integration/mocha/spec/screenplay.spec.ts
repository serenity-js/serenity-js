import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { trimmed } from '@serenity-js/core/lib/io';
import { ExecutionFailedWithAssertionError, ExecutionFailedWithError, ExecutionSuccessful, FeatureTag, Name, ProblemIndication } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { mocha } from '../src/mocha';

describe('@serenity-js/mocha', function () {

    this.timeout(60 * 1000);

    describe('reports a scenario that', () => {

        it('fails because of a failing Screenplay expectation', () =>
            mocha('examples/screenplay/assertion-error.spec.js')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(1);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario correctly reports assertion errors')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                            expect(outcome.error.name).to.equal('AssertionError');
                            expect(outcome.error.message).to.match(new RegExp(trimmed`
                                | Expected false to equal true
                                |
                                | Expectation: equals\\(true\\)
                                |
                                | Expected boolean: true
                                | Received boolean: false
                                |
                                | \\s{4}at .*examples/screenplay/assertion-error.spec.js:11:24`));
                        })
                    ;
                }));

        it('fails when discarding an ability results in Error', () =>
            mocha('examples/screenplay/ability-discard-error.spec.js')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(1);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete:');
                            expect(message[1]).to.equal('[Stage] Dismissing Donald... - TypeError: Some internal error in ability');
                        })
                    ;
                }));

        it(`fails when discarding an ability doesn't complete within a timeout`, () =>
            mocha('examples/screenplay/ability-discard-timeout.spec.js')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(1);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete within a 50ms cue timeout:');
                            expect(message[1]).to.match(/\d+ms - \[Stage] Dismissing Donald\.\.\./);
                        })
                    ;
                }));

        it(`executes all the scenarios in the test suite even when some of them fail because of an error when discarding an ability`, () =>
            mocha('examples/screenplay/ability-discard-error-should-not-affect-stage-cue.spec.js')
                .then(ifExitCodeIsOtherThan(2, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(2);   // 2 failures, so Mocha returns an exit code of 2

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete:');
                            expect(message[1]).to.equal('[Stage] Dismissing Donald... - TypeError: Some internal error in ability');
                        })
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario succeeds when ability is discarded successfully')))
                        .next(SceneFinished,       event => {
                            expect(event.outcome).to.be.instanceOf(ExecutionSuccessful);
                        })
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails if the ability fails to discard again')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete:');
                            expect(message[1]).to.equal('[Stage] Dismissing Donald... - TypeError: Some internal error in ability');
                        })
                    ;
                }));
    });
});
