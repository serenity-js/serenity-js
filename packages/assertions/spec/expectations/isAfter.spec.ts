import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';

import { Ensure, isAfter } from '../../src';

describe('isAfter', () => {

    /** @test {isAfter} */
    it('allows for the actor flow to continue when the "actual" is after the "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(new Date('1995-01-01'), isAfter(new Date('1985-01-01'))),
        )).to.be.fulfilled;
    });

    /** @test {isAfter} */
    it('breaks the actor flow when "actual" is not after the "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(new Date('1985-01-01'), isAfter(new Date('1995-01-01'))),
        )).to.be.rejectedWith(AssertionError, `Expected 1985-01-01T00:00:00.000Z to have value that is after 1995-01-01T00:00:00.000Z`)
            .then((error: AssertionError) => {
                expect(error.expected).to.deep.equal(new Date('1995-01-01'));
                expect(error.actual).to.deep.equal(new Date('1985-01-01'));
            });
    });

    /** @test {isAfter} */
    it('contributes to a human-readable description', () => {
        expect(Ensure.that(new Date('1995-01-01'), isAfter(new Date('1985-01-01'))).toString())
            .to.equal(`#actor ensures that 1995-01-01T00:00:00.000Z does have value that is after 1985-01-01T00:00:00.000Z`);
    });
});
