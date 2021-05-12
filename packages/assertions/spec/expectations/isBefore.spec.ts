import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';

import { Ensure, isBefore } from '../../src';

describe('isBefore', () => {

    /** @test {isBefore} */
    it('allows for the actor flow to continue when the "actual" is before the "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(new Date('1985-01-01'), isBefore(new Date('1995-01-01'))),
        )).to.be.fulfilled;
    });

    /** @test {isBefore} */
    it('breaks the actor flow when "actual" is not before the "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(new Date('1995-01-01'), isBefore(new Date('1985-01-01'))),
        )).to.be.rejectedWith(AssertionError, `Expected 1995-01-01T00:00:00.000Z to have value that is before 1985-01-01T00:00:00.000Z`)
            .then((error: AssertionError) => {
                expect(error.expected).to.deep.equal(new Date('1985-01-01'));
                expect(error.actual).to.deep.equal(new Date('1995-01-01'));
            });
    });

    /** @test {isBefore} */
    it('contributes to a human-readable description', () => {
        expect(Ensure.that(new Date('1985-01-01'), isBefore(new Date('1995-01-01'))).toString())
            .to.equal(`#actor ensures that 1985-01-01T00:00:00.000Z does have value that is before 1995-01-01T00:00:00.000Z`);
    });
});
