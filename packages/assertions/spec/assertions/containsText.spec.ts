import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';

import { containsText, Ensure } from '../../src';

describe('containsText', () => {

    const Enrique = Actor.named('Enrique');

    it('checks if the actual value contains the expected value', () =>
        expect(Enrique.attemptsTo(
            Ensure.that('Hello World!', containsText('World')),
        )).to.be.fulfilled);

    describe('when used with Ensure', () => {

        it('throws an error when the assertion is not met', () => {
            return expect(Enrique.attemptsTo(
                Ensure.that('Hello World!', containsText('Mundo'))),
            ).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to contain 'Mundo'`);
        });

        it('contributes to the task description', () => {
            expect(Ensure.that('Hello World!', containsText('World')).toString())
                .to.equal(`#actor ensures that 'Hello World!' does contain 'World'`);
        });
    });
});
