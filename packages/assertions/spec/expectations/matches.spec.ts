import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
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
        )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to match /mundo$/gi`)
            .then((error: AssertionError) => {
                expect(error.expected.toString()).to.equal('/mundo$/gi');
                expect(error.actual).to.equal('Hello World!');
            });
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello World!', matches(/^[Hh]ello [Ww]orld!?$/g)).toString())
            .to.equal(`#actor ensures that 'Hello World!' does match /^[Hh]ello [Ww]orld!?$/g`);
    });
});
