import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
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

    it('breaks the actor flow when "actual" meets none of the expectations', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', or(startsWith('¡Hola'), endsWith('Mundo!'))),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected "Hello World!" to start with "¡Hola" or end with "Mundo!"
            |
            | Expectation: endsWith('Mundo!')
            |
            | Expected string: Mundo!
            | Received string: Hello World!`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello', or(startsWith('H'), endsWith('o'))).toString())
            .to.equal(`#actor ensures that "Hello" does start with "H" or end with "o"`);
    });
});
