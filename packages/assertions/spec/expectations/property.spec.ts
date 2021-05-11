import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';

import { Ensure, equals, property } from '../../src';

describe('hasProperty', () => {

    /** @test {hasProperty} */
    it('allows for the actor flow to continue when the "actual" has a property that meets the expectation', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello!', property('length', equals(6))),
        )).to.be.fulfilled;
    });

    /** @test {hasProperty} */
    it('breaks the actor flow when "actual" does not have a property that meets the expectation', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that('Hello!', property('length', equals(0))),
        )).to.be.rejectedWith(AssertionError, `Expected 'Hello!' to have property 'length' that does equal 0`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal(0);
                expect(error.actual).to.equal(6);
            });
    });

    /** @test {hasProperty} */
    it('contributes to a human-readable description', () => {
        expect(Ensure.that('Hello!', property('length', equals(6))).toString())
            .to.equal(`#actor ensures that 'Hello!' does have property 'length' that does equal 6`);
    });
});
