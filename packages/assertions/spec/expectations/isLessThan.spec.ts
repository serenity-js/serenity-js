import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { Ensure, isLessThan } from '../../src';

describe('isLessThan', () => {

    it('allows for the actor flow to continue when the "actual" is less than "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(2, isLessThan(3)),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" is not less than "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(3, isLessThan(2)),
        )).to.be.rejectedWith(AssertionError, `Expected 3 to have value that's less than 2`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal(2);
                expect(error.actual).to.equal(3);
            });
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that(2, isLessThan(3)).toString())
            .to.equal(`#actor ensures that 2 does have value that's less than 3`);
    });
});
