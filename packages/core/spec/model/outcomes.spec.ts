import 'mocha';
import { given } from 'mocha-testdata';

import { TestCompromisedError } from '../../src/errors';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Outcome,
    ProblemIndication,
} from '../../src/model';
import { expect } from '../expect';

describe('Outcome', () => {

    describe('non-error outcome', () => {

        given([
            new ExecutionSkipped(),
            new ExecutionIgnored(),
            new ImplementationPending(),
            new ExecutionSuccessful(),
        ]).
        it('can be serialised and deserialised', (outcome: Outcome) => {
            const deserialised: any = Outcome.fromJSON(outcome.toJSON());

            expect(deserialised).to.be.instanceOf(outcome.constructor);
        });
    });

    describe('outcome indicating an error', () => {

        given([
            new ExecutionCompromised(new TestCompromisedError('Database is down')),
            new ExecutionFailedWithError(new Error(`Something's wrong`)),
            new ExecutionFailedWithAssertionError(assertionError()),
        ]).
        it('can be serialised and deserialised', (outcome: ProblemIndication) => {
            const deserialised: any = Outcome.fromJSON(outcome.toJSON());

            expect(deserialised).to.be.instanceOf(outcome.constructor);

            expect(deserialised.error.name).to.equal(outcome.error.name);
            expect(deserialised.error.message).to.equal(outcome.error.message);
            expect(deserialised.error.stack).to.equal(outcome.error.stack);
        });

    });

    function assertionError() {
        try {
            expect(true).to.equal(false);
        } catch (e) {
            return e;
        }
    }
});
