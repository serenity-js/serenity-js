import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';
import { and, endsWith, Ensure, startsWith } from '../../src';

describe('and', () => {

    const Astrid = Actor.named('Astrid');

    /** @test {and} */
    it(`allows for the actor flow to continue when the "actual" meets all the expectations`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that('Hello World!', and(startsWith('Hello'), endsWith('World!'))),
        )).to.be.fulfilled;
    });

    describe(`breaks the actor flow when "actual"`, () => {

        /** @test {and} */
        it(`does not meet the first expectation`, () => {
            return expect(Astrid.attemptsTo(
                Ensure.that('Hello World!', and(startsWith('¡Hola'), endsWith('World!'))),
            )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to start with '¡Hola'`);
        });

        /** @test {and} */
        it(`does not meet the second expectation`, () => {
            return expect(Astrid.attemptsTo(
                Ensure.that('Hello World!', and(startsWith('Hello'), endsWith('Mundo!'))),
            )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to end with 'Mundo!`);
        });
    });

    /** @test {and} */
    it(`contributes to a human-readable description`, () => {
        expect(Ensure.that('Hello', and(startsWith('H'), endsWith('o'))).toString())
            .to.equal(`#actor ensures that 'Hello' does start with 'H' and end with 'o'`);
    });
});
