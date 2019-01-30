import 'mocha';
import { given } from 'mocha-testdata';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError, KnowableUnknown, Question } from '@serenity-js/core';
import { Assertion, Ensure } from '../../src';
import { isIdenticalTo, p, q } from '../fixtures';

/** @test {Assertion} */
describe('Assertion', () => {

    const Astrid = Actor.named('Astrid');

    describe('allows to easily define an assertion, which', () => {

        /**
         * @test {Assertion.that}
         * @test {Ensure.that}
         */
        it('allows the actor flow to continue when the assertion passes', () => {
            return expect(Astrid.attemptsTo(
                Ensure.that(4, isIdenticalTo(4)),
            )).to.be.fulfilled;
        });

        /**
         * @test {Assertion.that}
         * @test {Ensure.that}
         */
        it('stops the actor flow when the assertion fails', () => {
            return expect(Astrid.attemptsTo(
                Ensure.that(4, isIdenticalTo('4' as any)),
            )).to.be.rejectedWith(AssertionError, "Expected 4 to have value identical to '4'");
        });

        given<KnowableUnknown<number>>(
            42,
            p(42),
            q(42),
            q(p(42)),
        ).
        it('allows for the expected value to be defined as any KnowableUnknown<T>', (expected: KnowableUnknown<number>) => {
            return expect(Astrid.attemptsTo(
                Ensure.that(42, isIdenticalTo(expected)),
            )).to.be.fulfilled;
        });
    });
});
