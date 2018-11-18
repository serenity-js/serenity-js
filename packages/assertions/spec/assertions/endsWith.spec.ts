import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';

import { endsWith, Ensure } from '../../src';

describe('endsWith', () => {

    const Enrique = Actor.named('Enrique');

    it('checks if the actual value ends with the expected value', () =>
        expect(Enrique.attemptsTo(
            Ensure.that('Hello World!', endsWith('World!')),
        )).to.be.fulfilled);

    describe('when used with Ensure', () => {

        it('throws an error when the assertion is not met', () => {
            return expect(Enrique.attemptsTo(
                Ensure.that('Hello World!', endsWith('Mundo!'))),
            ).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to end with 'Mundo!'`);
        });

        it('contributes to the task description', () => {
            expect(Ensure.that('Hello World!', endsWith('World!')).toString())
                .to.equal(`#actor ensures that 'Hello World!' does end with 'World!'`);
        });
    });
});
