import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { Ensure, includes } from '../../src';

describe('includes', () => {

    it('allows for the actor flow to continue when the "actual" includes the "expected" text', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', includes('World')),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" does not include the "expected" text', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', includes('Mundo')),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 'Hello World!' to include 'Mundo'
            | 
            | Expected string: Mundo
            | Received string: Hello World!`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello beautiful world', includes('beautiful')).toString())
            .to.equal(`#actor ensures that 'Hello beautiful world' does include 'beautiful'`);
    });
});
