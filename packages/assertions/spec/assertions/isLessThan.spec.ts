import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';
import { Ensure, isLessThan } from '../../src';

describe('isLessThan', () => {

    const Astrid = Actor.named('Astrid');

    /** @test {isLessThan} */
    it(`allows for the actor flow to continue when the "actual" is less than "expected"`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that(2, isLessThan(3)),
        )).to.be.fulfilled;
    });

    /** @test {isLessThan} */
    it(`breaks the actor flow when "actual" is not less than "expected"`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that(3, isLessThan(2)),
        )).to.be.rejectedWith(AssertionError, `Expected 3 to have value that's less than 2`);
    });

    /** @test {isLessThan} */
    it(`contributes to a human-readable description`, () => {
        expect(Ensure.that(2, isLessThan(3)).toString())
            .to.equal(`#actor ensures that 2 does have value that's less than 3`);
    });
});
