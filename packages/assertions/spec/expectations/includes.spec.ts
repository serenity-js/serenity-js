import 'mocha';

import { expect, stage } from '@integration/testing-tools';
import { AssertionError } from '@serenity-js/core';
import { Ensure, includes } from '../../src';

describe('includes', () => {

    const Astrid = stage().theActorCalled('Astrid');

    /** @test {includes} */
    it('allows for the actor flow to continue when the "actual" includes the "expected" text', () => {
        return expect(Astrid.attemptsTo(
            Ensure.that('Hello World!', includes('World')),
        )).to.be.fulfilled;
    });

    /** @test {includes} */
    it('breaks the actor flow when "actual" does not include the "expected" text', () => {
        return expect(Astrid.attemptsTo(
            Ensure.that('Hello World!', includes('Mundo')),
        )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to include 'Mundo'`);
    });

    /** @test {includes} */
    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello beautiful world', includes('beautiful')).toString())
            .to.equal(`#actor ensures that 'Hello beautiful world' does include 'beautiful'`);
    });
});
