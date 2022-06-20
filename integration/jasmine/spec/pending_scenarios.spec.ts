import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ImplementationPendingError } from '@serenity-js/core';
import { SceneFinished, SceneStarts, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ImplementationPending, Name, ProblemIndication } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { jasmine } from '../src/jasmine';

describe('@serenity-js/jasmine', function () {

    this.timeout(5000);

    describe('recognises a pending scenario that', () => {

        it('is missing the body', () => jasmine('examples/pending/missing-implementation.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts, event => expect(event.details.name).to.equal(new Name(`A scenario is marked as pending when it hasn't been implemented yet`)))
                    .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(SceneFinished, event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ImplementationPending);

                        expect(outcome.error).to.be.instanceof(ImplementationPendingError);
                        expect(outcome.error.message).to.equal('');                             // there's no message when the spec body is missing
                    })
                ;
            }));

        it('is marked as pending (xit)', () => jasmine('examples/pending/marked-as-pending-xit.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts, event => expect(event.details.name).to.equal(new Name(`A scenario is marked as pending`)))
                    .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(SceneFinished, event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ImplementationPending);

                        expect(outcome.error).to.be.instanceof(ImplementationPendingError);
                        expect(outcome.error.message).to.equal('Temporarily disabled with xit');
                    })
                ;
            }));

        it('is marked as pending (xdescribe)', () => jasmine('examples/pending/marked-as-pending-xdescribe.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts, event => expect(event.details.name).to.equal(new Name(`A scenario is marked as pending`)))
                    .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(SceneFinished, event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ImplementationPending);

                        expect(outcome.error).to.be.instanceof(ImplementationPendingError);
                        expect(outcome.error.message).to.equal('');                             // there's no message when the entire describe has been disabled
                    })
                ;
            }));

        it('is marked as pending with reason', () => jasmine('examples/pending/marked-as-pending-with-reason.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts, event => expect(event.details.name).to.equal(new Name(`A scenario is marked as pending`)))
                    .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(SceneFinished, event => {
                        const outcome = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ImplementationPending);

                        expect(outcome.error).to.be.instanceof(ImplementationPendingError);
                        expect(outcome.error.message).to.equal('implementation missing');      // the reason given to `pending()`
                    })
                ;
            }));
    });
});
