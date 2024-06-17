import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { Ensure, startsWith } from '../../src';

describe('startsWith', () => {

    it('allows for the actor flow to continue when the "actual" starts with "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', startsWith('Hello')),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" does not start with "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', startsWith('¡Hola')),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected "Hello World!" to start with "¡Hola"
            |
            | Expectation: startsWith('¡Hola')
            |
            | Expected string: ¡Hola
            | Received string: Hello World!
            |`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello', startsWith('H')).toString())
            .to.equal(`#actor ensures that "Hello" does start with "H"`);
    });
});
