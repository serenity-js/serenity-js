import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';
import { endsWith, Ensure } from '../../src';

describe('endsWith', () => {

    const Astrid = Actor.named('Astrid');

    /** @test {endsWith} */
    it(`allows for the actor flow to continue when the "actual" ends with "expected"`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that('Hello World!', endsWith('World!')),
        )).to.be.fulfilled;
    });

    /** @test {endsWith} */
    it(`breaks the actor flow when "actual" does not end with "expected"`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that('Hello World!', endsWith('Mundo!')),
        )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to end with 'Mundo!'`);
    });

    /** @test {endsWith} */
    it(`contributes to a human-readable description`, () => {
        expect(Ensure.that('Hello', endsWith('o')).toString())
            .to.equal(`#actor ensures that 'Hello' does end with 'o'`);
    });
});
