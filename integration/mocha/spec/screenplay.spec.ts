import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithAssertionError, ExecutionFailedWithError, FeatureTag, Name, ProblemIndication } from '@serenity-js/core/lib/model';
import { mocha } from '../src/mocha';

describe('@serenity-js/mocha', function () {

    this.timeout(60 * 1000);

    describe('reports a scenario that', () => {

        it('fails because of a failing Screenplay expectation', () =>
            mocha('examples/screenplay/assertion-error.spec.js')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(res => {

                    expect(res.exitCode).to.equal(1);

                    PickEvent.from(res.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario correctly reports assertion errors')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                            expect(outcome.error.name).to.equal('AssertionError');
                            expect(outcome.error.message).to.equal('Expected false to equal true');
                        })
                    ;
                }));

        it('fails when discarding an ability results in Error', () =>
            mocha('examples/screenplay/ability-discard-error.spec.js')
                .then(ifExitCodeIsOtherThan(100, logOutput))
                .then(res => {
                    expect(res.exitCode).to.equal(1);

                    PickEvent.from(res.events)
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
                .then(ifExitCodeIsOtherThan(100, logOutput))
                .then(res => {
                    expect(res.exitCode).to.equal(1);

                    PickEvent.from(res.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete within a 50ms cue timeout:');
                            expect(message[1]).to.match(/[\d]+ms - \[Stage] Dismissing Donald\.\.\./);
                        })
                    ;
                }));
    });
});
