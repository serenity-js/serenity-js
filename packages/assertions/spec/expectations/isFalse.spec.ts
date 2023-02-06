import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { Ensure, isFalse } from '../../src';

describe('isFalse', () => {

    it('allows for the actor flow to continue when the "actual" is false', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(false, isFalse()),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" is not false', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(true, isFalse()),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected true to equal false
            |
            | Expectation: equals(false)
            |
            | Expected boolean: false
            | Received boolean: true
            |`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that(false, isFalse()).toString())
            .to.equal(`#actor ensures that false does equal false`);
    });
});
