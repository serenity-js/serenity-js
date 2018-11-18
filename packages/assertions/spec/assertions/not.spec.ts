import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';

import { Ensure, equals, not } from '../../src';

describe('not', () => {

    const Enrique = Actor.named('Enrique');

    it('negates the assertion', () =>
        expect(Enrique.attemptsTo(
            Ensure.that(true, not(equals(false))),
        )).to.be.fulfilled);

    describe('when used with Ensure', () => {

        it('throws an error when the negated assertion is not met', () => {
            return expect(Enrique.attemptsTo(
                Ensure.that(true, not(equals(true))),
            )).to.be.rejectedWith(AssertionError, 'Expected true to not equal true');
        });

        it('contributes to the task description', () => {
            expect(Ensure.that(true, not(equals(true))).toString())
                .to.equal(`#actor ensures that true does not equal true`);
        });
    });
});
