import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';
import { endsWith, Ensure, or, startsWith } from '../../src';

describe('or', () => {

    const Astrid = Actor.named('Astrid');

    describe(`allows for the actor flow to continue when the "actual"`, () => {

        /** @test {or} */
        it(`meets all the expectations`, () => {
            return expect(Astrid.attemptsTo(
                Ensure.that('Hello World!', or(startsWith('Hello'), endsWith('World!'))),
            )).to.be.fulfilled;
        });

        /** @test {or} */
        it(`meets at least one expectation`, () => {
            return expect(Astrid.attemptsTo(
                Ensure.that('Hello World!', or(startsWith('¡Hola'), endsWith('World!'))),
            )).to.be.fulfilled;
        });
    });

    /** @test {or} */
    it(`breaks the actor flow when "actual" does meets none of the expectations`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that('Hello World!', or(startsWith('¡Hola'), endsWith('Mundo!'))),
        )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to start with '¡Hola' or end with 'Mundo!'`);
    });

    /** @test {or} */
    it(`contributes to a human-readable description`, () => {
        expect(Ensure.that('Hello', or(startsWith('H'), endsWith('o'))).toString())
            .to.equal(`#actor ensures that 'Hello' does start with 'H' or end with 'o'`);
    });
});
