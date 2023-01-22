import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { Ensure, matches } from '../../src';

describe('matches', () => {

    it('allows for the actor flow to continue when the "actual" matches the "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', matches(/^[Hh]ello [Ww]orld!?$/)),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" does not match the "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', matches(/mundo$/gi)),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 'Hello World!' to match /mundo$/gi
            | 
            | Expected RegExp: /mundo$/gi
            | Received string: Hello World!`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello World!', matches(/^[Hh]ello [Ww]orld!?$/g)).toString())
            .to.equal(`#actor ensures that 'Hello World!' does match /^[Hh]ello [Ww]orld!?$/g`);
    });
});
