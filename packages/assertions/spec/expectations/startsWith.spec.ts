import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';

import { Ensure, startsWith } from '../../src';

describe('startsWith', () => {

    /** @test {startsWith} */
    it('allows for the actor flow to continue when the "actual" starts with "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', startsWith('Hello')),
        )).to.be.fulfilled;
    });

    /** @test {startsWith} */
    it('breaks the actor flow when "actual" does not start with "expected"', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello World!', startsWith('¡Hola')),
        )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to start with '¡Hola'`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal('¡Hola');
                expect(error.actual).to.equal('Hello World!');
            });
    });

    /** @test {startsWith} */
    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello', startsWith('H')).toString())
            .to.equal(`#actor ensures that 'Hello' does start with 'H'`);
    });
});
