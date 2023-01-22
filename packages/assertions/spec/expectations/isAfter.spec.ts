import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { Ensure, isAfter } from '../../src';

describe('isAfter', () => {

    it('allows for the actor flow to continue when the "actual" is after the "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(new Date('1995-01-01'), isAfter(new Date('1985-01-01'))),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" is not after the "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(new Date('1985-01-01'), isAfter(new Date('1995-01-01'))),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 1985-01-01T00:00:00.000Z to have value that is after 1995-01-01T00:00:00.000Z
            |
            | Expected Date: 1995-01-01T00:00:00.000Z
            | Received Date: 1985-01-01T00:00:00.000Z`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that(new Date('1995-01-01'), isAfter(new Date('1985-01-01'))).toString())
            .to.equal(`#actor ensures that 1995-01-01T00:00:00.000Z does have value that is after 1985-01-01T00:00:00.000Z`);
    });
});
