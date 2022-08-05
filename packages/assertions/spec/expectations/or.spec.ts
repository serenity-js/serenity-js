import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { endsWith, Ensure, or, startsWith } from '../../src';

describe('or', () => {

    describe('allows for the actor flow to continue when the "actual"', () => {

                it('meets all the expectations', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that('Hello World!', or(startsWith('Hello'), endsWith('World!'))),
            )).to.be.fulfilled;
        });

                it('meets at least one expectation', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that('Hello World!', or(startsWith('¡Hola'), endsWith('World!'))),
            )).to.be.fulfilled;
        });
    });

        it('breaks the actor flow when "actual" does meets none of the expectations', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', or(startsWith('¡Hola'), endsWith('Mundo!'))),
        )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to start with '¡Hola' or end with 'Mundo!'`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal('Mundo!');
                expect(error.actual).to.equal('Hello World!');
            });
    });

        it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello', or(startsWith('H'), endsWith('o'))).toString())
            .to.equal(`#actor ensures that 'Hello' does start with 'H' or end with 'o'`);
    });
});
