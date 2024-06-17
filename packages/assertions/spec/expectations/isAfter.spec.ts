import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError, Timestamp } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { Ensure, isAfter } from '../../src';

describe('isAfter', () => {

    it('allows for the actor flow to continue when the "actual" is after the "expected" Date', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(new Date('1995-01-01'), isAfter(new Date('1985-01-01'))),
        )).to.be.fulfilled;
    });

    it('allows for the actor flow to continue when the "actual" Timestamp is after the "expected" Timestamp', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(Timestamp.fromJSON('1995-01-01'), isAfter(Timestamp.fromJSON('1985-01-01'))),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" is not after the "expected" Date', async () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(new Date('1985-01-01'), isAfter(new Date('1995-01-01'))),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected Date(1985-01-01T00:00:00.000Z) to have value that is after Date(1995-01-01T00:00:00.000Z)
            |
            | Expectation: isAfter(1995-01-01T00:00:00.000Z)
            |
            | Expected Date: 1995-01-01T00:00:00.000Z
            | Received Date: 1985-01-01T00:00:00.000Z
            |`);
    });

    it('breaks the actor flow when "actual" is not after the "expected" Timestamp', async () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(Timestamp.fromJSON('1985-01-01'), isAfter(Timestamp.fromJSON('1995-01-01'))),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 1985-01-01T00:00:00.000Z to have value that is after 1995-01-01T00:00:00.000Z
            |
            | Expectation: isAfter(Timestamp(1995-01-01T00:00:00.000Z))
            |
            | Expected Timestamp  - 1
            | Received Timestamp  + 1
            | 
            | - "1995-01-01T00:00:00.000Z"
            | + "1985-01-01T00:00:00.000Z"
            |`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that(new Date('1995-01-01'), isAfter(new Date('1985-01-01'))).toString())
            .to.equal(`#actor ensures that Date(1995-01-01T00:00:00.000Z) does have value that is after Date(1985-01-01T00:00:00.000Z)`);
    });
});
