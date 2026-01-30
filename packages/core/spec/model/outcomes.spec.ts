
import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { ImplementationPendingError, TestCompromisedError } from '../../src/errors';
import type {
    ProblemIndication} from '../../src/model';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Outcome
} from '../../src/model';
import { expect } from '../expect';

describe('Outcome', () => {

    describe('non-error outcome', () => {

        given([
            new ExecutionSkipped(),
            new ExecutionSuccessful(),
        ]).
        it('can be serialised and deserialised', (outcome: Outcome) => {
            const deserialised: any = Outcome.fromJSON(outcome.toJSON());

            expect(deserialised).to.be.instanceOf(outcome.constructor);
        });
    });

    describe('outcome indicating an error', () => {

        given([
            { outcome: new ExecutionCompromised(new TestCompromisedError('Database is down')), description: ExecutionCompromised.name },
            { outcome: new ExecutionFailedWithError(new Error(`Something's wrong`)), description: ExecutionFailedWithError.name },
            { outcome: new ExecutionFailedWithAssertionError(assertionError()), description: ExecutionFailedWithAssertionError.name },
            { outcome: new ImplementationPending(new ImplementationPendingError('method missing')), description: ImplementationPending.name },
            { outcome: new ExecutionIgnored(new Error('Test failed but will be retried')), description: ImplementationPending.name },
        ]).
        it('can be serialised and deserialised', ({ outcome }: { outcome: ProblemIndication }) => {
            const deserialised: any = Outcome.fromJSON(outcome.toJSON());

            expect(deserialised).to.be.instanceOf(outcome.constructor);

            expect(deserialised.error.name).to.equal(outcome.error.constructor.name);
            expect(deserialised.error.message).to.equal(outcome.error.message);
            expect(deserialised.error.stack).to.equal(outcome.error.stack);
        });
    });

    function assertionError() {
        try {
            expect(true).to.equal(false);
        } catch (error) {
            return error;
        }
    }
});
