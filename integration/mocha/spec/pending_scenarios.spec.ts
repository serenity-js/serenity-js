import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ImplementationPending, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { mocha } from '../src/mocha';

describe('@serenity-js/mocha', function () {

    this.timeout(10000);

    describe('recognises a pending scenario that', () => {

        it('is missing the body', () => mocha('examples/pending/missing-implementation.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name(`A scenario is marked as skipped when it hasn't been implemented yet`)))
                    .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Mocha')))
                    .next(SceneFinished,        event => {
                        expect(event.outcome).to.be.instanceof(ImplementationPending);
                        expect((event.outcome as ImplementationPending).error.message).to.equal('Scenario not implemented');
                    })
                ;
            }));

        it('is marked as pending (describe.skip)', () => mocha('examples/pending/marked-as-pending-describe-skip.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name(`A scenario is marked as pending`)))
                    .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Mocha')))
                    .next(SceneFinished,        event => {
                        expect(event.outcome).to.be.instanceof(ImplementationPending);
                        expect((event.outcome as ImplementationPending).error.message).to.equal('Scenario not implemented');
                    })
                ;
            }));

        it('is marked as pending (it.skip())', () => mocha('examples/pending/marked-as-pending-it-skip.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name(`A scenario is marked as pending`)))
                    .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Mocha')))
                    .next(SceneFinished,        event => {
                        expect(event.outcome).to.be.instanceof(ImplementationPending);
                        expect((event.outcome as ImplementationPending).error.message).to.equal('Scenario not implemented');
                    })
                ;
            }));
    });
});
