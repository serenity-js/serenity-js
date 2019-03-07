import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';
import {
    and,
    containAtLeastOneItemThat,
    contains,
    endsWith,
    Ensure,
    equals,
    Expectation,
    includes,
    isGreaterThan,
    isLessThan,
    not,
    or,
    startsWith,
} from '../../src';

describe('not', () => {

    const Astrid = Actor.named('Astrid');

    /** @test {not} */
    it(`allows for the actor flow to continue when the "actual" meets the expectation`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that('Hello World!', not(startsWith('¡Hola'))),
        )).to.be.fulfilled;
    });

    /** @test {not} */
    it(`breaks the actor flow when "actual" does not meet the expectation`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that('Hello World!', not(startsWith('Hello'))),
        )).to.be.rejectedWith(AssertionError, `Expected 'Hello World!' to not start with 'Hello'`);
    });

    /** @test {not} */
    it(`contributes to a human-readable description`, () => {
        expect(Ensure.that('Hello', not(startsWith('o'))).toString())
            .to.equal(`#actor ensures that 'Hello' does not start with 'o'`);
    });

    it(`flips the outcome of an assertion, but doesn't hide any errors that might have happened while making it`, () => {
        const blowsUp = () => Expectation.thatActualShould('blow up', 'expected').soThat((actual, expected) => { throw new Error('boom'); });

        return expect(Astrid.attemptsTo(
            Ensure.that('Hello World!', not(blowsUp())),
        )).to.be.rejectedWith(Error, `boom`);
    });

    describe(`double negative`, () => {
        /** @test {not} */
        it(`contributes to a human-readable description`, () => {
            expect(Ensure.that('Hello', not(not(startsWith('o')))).toString())
                .to.equal(`#actor ensures that 'Hello' does start with 'o'`);
        });
    });

    describe('when combined with other assertions, such as', () => {

        describe('and,', () => {

            /** @test {not} */
            /** @test {and} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that(3, not(and(isGreaterThan(2), isLessThan(4)))),
                )).to.be.rejectedWith(AssertionError, `Expected 3 to not have value greater than 2 and have value that's less than 4`);
            });

            /** @test {not} */
            /** @test {and} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that(3, not(and(isGreaterThan(2), isLessThan(4)))).toString())
                    .to.equal(`#actor ensures that 3 does not have value greater than 2 and have value that's less than 4`);
            });
        });

        describe('contains,', () => {

            /** @test {not} */
            /** @test {contains} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that([ 1, 2, 3 ], not(contains(2)),
                ))).to.be.rejectedWith(AssertionError, `Expected [ 1, 2, 3 ] to not contain 2`);
            });

            /** @test {not} */
            /** @test {contains} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that([ 'H', 'e', 'l', 'l', 'o' ], not(contains('o'))).toString())
                    .to.equal(`#actor ensures that [ 'H', 'e', 'l', 'l', 'o' ] does not contain 'o'`);
            });
        });

        describe('containAtLeastOneItemThat,', () => {

            /** @test {not} */
            /** @test {containAtLeastOneItemThat} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that([ 1, 2, 3 ], not(containAtLeastOneItemThat(equals(2))),
                ))).to.be.rejectedWith(AssertionError, `Expected [ 1, 2, 3 ] to not contain at least one item that does equal 2`);
            });

            /** @test {not} */
            /** @test {containAtLeastOneItemThat} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that([ 'H', 'e', 'l', 'l', 'o' ], not(containAtLeastOneItemThat(equals('o')))).toString())
                    .to.equal(`#actor ensures that [ 'H', 'e', 'l', 'l', 'o' ] does not contain at least one item that does equal 'o'`);
            });
        });

        describe('endsWith,', () => {

            /** @test {not} */
            /** @test {endsWith} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that('Hello', not(endsWith('o'))),
                )).to.be.rejectedWith(AssertionError, `Expected 'Hello' to not end with 'o'`);
            });

            /** @test {not} */
            /** @test {endsWith} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that('Hello', not(endsWith('o'))).toString())
                    .to.equal(`#actor ensures that 'Hello' does not end with 'o'`);
            });
        });

        describe('equals,', () => {

            /** @test {not} */
            /** @test {equals} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that(true, not(equals(true))),
                )).to.be.rejectedWith(AssertionError, `Expected true to not equal true`);
            });

            /** @test {not} */
            /** @test {equals} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that(true, not(equals(true))).toString())
                    .to.equal(`#actor ensures that true does not equal true`);
            });
        });

        describe('includes,', () => {

            /** @test {not} */
            /** @test {includes} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that('Hello', not(includes('Hello'))),
                )).to.be.rejectedWith(AssertionError, `Expected 'Hello' to not include 'Hello'`);
            });

            /** @test {not} */
            /** @test {includes} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that('Hello', not(includes('Hello'))).toString())
                    .to.equal(`#actor ensures that 'Hello' does not include 'Hello'`);
            });
        });

        describe('isGreaterThan,', () => {

            /** @test {not} */
            /** @test {isGreaterThan} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that(2, not(isGreaterThan(1))),
                )).to.be.rejectedWith(AssertionError, `Expected 2 to not have value greater than 1`);
            });

            /** @test {not} */
            /** @test {isGreaterThan} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that(2, not(isGreaterThan(1))).toString())
                    .to.equal(`#actor ensures that 2 does not have value greater than 1`);
            });
        });

        describe('isLessThan,', () => {

            /** @test {not} */
            /** @test {isLessThan} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that(1, not(isLessThan(2))),
                )).to.be.rejectedWith(AssertionError, `Expected 1 to not have value that's less than 2`);
            });

            /** @test {not} */
            /** @test {isLessThan} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that(1, not(isLessThan(2))).toString())
                    .to.equal(`#actor ensures that 1 does not have value that's less than 2`);
            });
        });

        describe('or,', () => {

            /** @test {not} */
            /** @test {or} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that(1, not(or(isGreaterThan(0), isLessThan(2)))),
                )).to.be.rejectedWith(AssertionError, `Expected 1 to not have value greater than 0 or have value that's less than 2`);
            });

            /** @test {not} */
            /** @test {or} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that(1, not(isLessThan(2))).toString())
                    .to.equal(`#actor ensures that 1 does not have value that's less than 2`);
            });
        });

        describe('startsWith,', () => {

            /** @test {not} */
            /** @test {startsWith} */
            it(`produces a sensible error message`, () => {
                return expect(Astrid.attemptsTo(
                    Ensure.that('Hello', not(startsWith('H'))),
                )).to.be.rejectedWith(AssertionError, `Expected 'Hello' to not start with 'H'`);
            });

            /** @test {not} */
            /** @test {startsWith} */
            it(`contributes to a human-readable description`, () => {
                expect(Ensure.that('Hello', not(startsWith('H'))).toString())
                    .to.equal(`#actor ensures that 'Hello' does not start with 'H'`);
            });
        });
    });
});
