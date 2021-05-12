import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';

import { Ensure, isFalse } from '../../src';

describe('isFalse', () => {

    /** @test {isFalse} */
    it('allows for the actor flow to continue when the "actual" is false', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(false, isFalse()),
        )).to.be.fulfilled;
    });

    /** @test {isFalse} */
    it('breaks the actor flow when "actual" is not false', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(true, isFalse()),
        )).to.be.rejectedWith(AssertionError, `Expected true to equal false`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal(false);
                expect(error.actual).to.equal(true);
            });
    });

    /** @test {isFalse} */
    it('contributes to a human-readable description', () => {
        expect(Ensure.that(false, isFalse()).toString())
            .to.equal(`#actor ensures that false does equal false`);
    });
});
