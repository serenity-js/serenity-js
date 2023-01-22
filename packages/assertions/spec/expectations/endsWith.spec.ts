import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { endsWith, Ensure } from '../../src';

describe('endsWith', () => {

    it('allows for the actor flow to continue when the "actual" ends with "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', endsWith('World!')),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" does not end with "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', endsWith('Mundo!')),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 'Hello World!' to end with 'Mundo!'
            | 
            | Expected string: Mundo!
            | Received string: Hello World!`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello', endsWith('o')).toString())
            .to.equal(`#actor ensures that 'Hello' does end with 'o'`);
    });
});
