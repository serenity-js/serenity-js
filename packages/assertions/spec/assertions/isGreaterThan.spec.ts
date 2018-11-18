import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';

import { Ensure, isGreaterThan } from '../../src';

describe('isGreaterThan', () => {

    const Enrique = Actor.named('Enrique');

    it('checks if the actual value is greater than the expected value', () =>
        expect(Enrique.attemptsTo(
            Ensure.that(3, isGreaterThan(2)),
        )).to.be.fulfilled);

    describe('when used with Ensure', () => {

        it('throws an error when the assertion is not met', () => {
            return expect(Enrique.attemptsTo(
                Ensure.that(2, isGreaterThan(3)),
            )).to.be.rejectedWith(AssertionError, `Expected 2 to have value greater than 3`);
        });

        it('contributes to the task description', () => {
            expect(Ensure.that(3, isGreaterThan(2)).toString())
                .to.equal(`#actor ensures that 3 does have value greater than 2`);
        });
    });
});
