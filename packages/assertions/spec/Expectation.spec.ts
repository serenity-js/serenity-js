import { expect } from '@integration/testing-tools';
import type { Answerable} from '@serenity-js/core';
import { actorCalled, AssertionError, Expectation } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { and, Ensure, equals, isGreaterThan, isLessThan, or } from '../src';
import { isIdenticalTo, p, q } from './fixtures';

describe('Expectation', () => {

    describe('allows to easily define an assertion, which', () => {

        it('allows the actor flow to continue when the assertion passes', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(4, isIdenticalTo(4)),
            )).to.be.fulfilled;
        });

        it('stops the actor flow when the assertion fails', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(4, isIdenticalTo('4' as any)),
            )).to.be.rejectedWith(AssertionError, `Expected 4 to have value identical to '4'`);
        });

        given<Answerable<number>>(
            42,
            p(42),
            q(42),
            q(p(42)),
        ).
        it('allows for the expected value to be defined as any Answerable<T>', (expected: Answerable<number>) => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(42, isIdenticalTo(expected)),
            )).to.be.fulfilled;
        });
    });

    describe('allows to alias an expectation, so that the alias', () => {

        function isWithin(lowerBound: number, upperBound: number) {
            return Expectation
                .to(`have value within ${ lowerBound } and ${ upperBound }`)
                .soThatActual(and(
                    or(isGreaterThan(lowerBound), equals(lowerBound)),
                    or(isLessThan(upperBound), equals(upperBound)),
                ));
        }

        it('contributes to a human-readable description', () => {
            expect(Ensure.that(5, isWithin(3, 6)).toString())
                .to.equal(`#actor ensures that 5 does have value within 3 and 6`);
        });

        it('provides a precise failure message when the expectation is not met', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(9, isWithin(7, 8)),
            )).to.be.rejectedWith(AssertionError, trimmed`
                | Expected 9 to have value greater than 7 or equal 7 and have value that's less than 8 or equal 8
                |
                | Expectation: equals(8)
                |
                | Expected number: 8
                | Received number: 9
                |`
            );
        });
    });

    describe('allows to override the description of an expectation, so that the new version', () => {

        function isWithin(lowerBound: number, upperBound: number) {
            return and(
                or(isGreaterThan(lowerBound), equals(lowerBound)),
                or(isLessThan(upperBound), equals(upperBound)),
            ).describedAs(`have value within ${ lowerBound } and ${ upperBound }`);
        }

        it('replaces the old description', () => {
            expect(Ensure.that(5, isWithin(3, 6)).toString())
                .to.equal(`#actor ensures that 5 does have value within 3 and 6`);
        });

        it('provides a precise failure message when the expectation is not met', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(9, isWithin(7, 8)),
            )).to.be.rejectedWith(AssertionError, trimmed`
                | Expected 9 to have value greater than 7 or equal 7 and have value that's less than 8 or equal 8
                |
                | Expectation: equals(8)
                |
                | Expected number: 8
                | Received number: 9
                |`);
        });
    });
});
