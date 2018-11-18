import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';

import { Ensure, isLessThan } from '../../src';

describe('isLessThan', () => {

    const Enrique = Actor.named('Enrique');

    it('checks if the actual value is less than the expected value', () =>
        expect(Enrique.attemptsTo(
            Ensure.that(2, isLessThan(3)),
        )).to.be.fulfilled);

    describe('when used with Ensure', () => {

        it('throws an error when the assertion is not met', () => {
            return expect(Enrique.attemptsTo(
                Ensure.that(2, isLessThan(1)),
            )).to.be.rejectedWith(AssertionError, `Expected 2 to have value less than 1`);
        });

        it('contributes to the task description', () => {
            expect(Ensure.that(2, isLessThan(3)).toString())
                .to.equal(`#actor ensures that 2 does have value less than 3`);
        });
    });
});
