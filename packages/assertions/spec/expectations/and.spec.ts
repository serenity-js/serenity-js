import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { and, endsWith, Ensure, startsWith } from '../../src';

describe('and', () => {

    it('allows for the actor flow to continue when the "actual" meets all the expectations', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', and(startsWith('Hello'), endsWith('World!'))),
        )).to.be.fulfilled;
    });

    describe('breaks the actor flow when "actual"', () => {

        it('does not meet the first expectation', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that('Hello World!', and(startsWith('¡Hola'), endsWith('World!'))),
            )).to.be.rejectedWith(AssertionError, trimmed`
                | Expected 'Hello World!' to start with '¡Hola'
                | 
                | Expected string: ¡Hola
                | Received string: Hello World!`);
        });

        it('does not meet the second expectation', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that('Hello World!', and(startsWith('Hello'), endsWith('Mundo!'))),
            )).to.be.rejectedWith(AssertionError, trimmed`
                | Expected 'Hello World!' to end with 'Mundo!'
                | 
                | Expected string: Mundo!
                | Received string: Hello World!`);
        });
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello', and(startsWith('H'), endsWith('o'))).toString())
            .to.equal(`#actor ensures that 'Hello' does start with 'H' and end with 'o'`);
    });
});
