import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { Ensure, isGreaterThan } from '../../src';

describe('isGreaterThan', () => {

    it('allows for the actor flow to continue when the "actual" is greater than "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(5, isGreaterThan(4)),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" is not greater than "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(0, isGreaterThan(2)),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 0 to have value greater than 2
            |
            | Expected number: 2
            | Received number: 0`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that(5, isGreaterThan(4)).toString())
            .to.equal(`#actor ensures that 5 does have value greater than 4`);
    });
});
