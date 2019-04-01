import 'mocha';
import { given } from 'mocha-testdata';

import { expect, stage } from '@integration/testing-tools';
import { Answerable, AssertionError } from '@serenity-js/core';
import { Ensure, Expectation } from '../../src';
import { isIdenticalTo, p, q } from '../fixtures';

/** @test {Expectation} */
describe('Expectation', () => {

    const Astrid = stage().theActorCalled('Astrid');

    describe('allows to easily define an assertion, which', () => {

        /**
         * @test {Expectation.that}
         * @test {Ensure.that}
         */
        it('allows the actor flow to continue when the assertion passes', () => {
            return expect(Astrid.attemptsTo(
                Ensure.that(4, isIdenticalTo(4)),
            )).to.be.fulfilled;
        });

        /**
         * @test {Expectation.that}
         * @test {Ensure.that}
         */
        it('stops the actor flow when the assertion fails', () => {
            return expect(Astrid.attemptsTo(
                Ensure.that(4, isIdenticalTo('4' as any)),
            )).to.be.rejectedWith(AssertionError, "Expected 4 to have value identical to '4'");
        });

        given<Answerable<number>>(
            42,
            p(42),
            q(42),
            q(p(42)),
        ).
        it('allows for the expected value to be defined as any Answerable<T>', (expected: Answerable<number>) => {
            return expect(Astrid.attemptsTo(
                Ensure.that(42, isIdenticalTo(expected)),
            )).to.be.fulfilled;
        });
    });
});
