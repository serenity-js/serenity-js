import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';

import { Ensure, startsWith } from '../../src';

describe('startsWith', () => {

    const Enrique = Actor.named('Enrique');

    it('checks if the actual value ends with the expected value', () =>
        expect(Enrique.attemptsTo(
            Ensure.that('Hello World!', startsWith('Hello')),
        )).to.be.fulfilled);

    describe('when used with Ensure', () => {

        it('throws an error when the assertion is not met', () => {
            return expect(Enrique.attemptsTo(
                Ensure.that('Hello World!', startsWith('¡Hola'))),
            ).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to start with '¡Hola'`);
        });

        it('contributes to the task description', () => {
            expect(Ensure.that('Hello World!', startsWith('Hello')).toString())
                .to.equal(`#actor ensures that 'Hello World!' does start with 'Hello'`);
        });
    });
});
