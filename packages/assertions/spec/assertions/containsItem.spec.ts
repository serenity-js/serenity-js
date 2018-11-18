import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';

import { containsItem, Ensure } from '../../src';

describe('containsItem', () => {

    const Enrique = Actor.named('Enrique');

    it('checks if a list of items contains the expected value', () =>
        expect(Enrique.attemptsTo(
            Ensure.that([1, 2, 3], containsItem(2)),
        )).to.be.fulfilled);

    describe('when used with Ensure', () => {

        it('throws an error when the assertion is not met', () => {
            return expect(Enrique.attemptsTo(
                Ensure.that([1, 2, 3], containsItem(5)),
            )).to.be.rejectedWith(AssertionError, `Expected [ 1, 2, 3 ] to contain 5`);
        });

        it('contributes to the task description', () => {
            expect(Ensure.that([1, 2, 3], containsItem(2)).toString())
                .to.equal(`#actor ensures that [ 1, 2, 3 ] does contain 2`);
        });
    });
});
