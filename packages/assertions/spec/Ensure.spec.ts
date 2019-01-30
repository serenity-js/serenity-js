import 'mocha';
import { given } from 'mocha-testdata';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError, KnowableUnknown, Question } from '@serenity-js/core';
import { Assertion, Ensure } from '../src';

/** @test {Ensure} */
describe('Ensure', () => {

    const
        Enrique = Actor.named('Enrique'),

        isIdenticalTo = <T>(expected: T) =>
            Assertion.thatActualShould<T, T>('have value identical to', expected)
                .soThat((actualValue: T, expectedValue: T) => actualValue === expectedValue),

        p = <T>(value: T) => Promise.resolve(value),
        q = <T>(value: T): Question<T> => Question.about(`something`, actor => value);

    /** @test {Ensure.that} */
    it('allows the actor to make an assertion', () => {
        return expect(Enrique.attemptsTo(
            Ensure.that(4, isIdenticalTo(4)),
        )).to.be.fulfilled;
    });

    /** @test {Ensure.that} */
    it('fails the actor flow when the assertion is not met', () => {
        return expect(Enrique.attemptsTo(
            Ensure.that(4, isIdenticalTo(7)),
        )).to.be.rejectedWith(AssertionError, 'Expected 4 to have value identical to 7');
    });

    /** @test {Ensure.that} */
    it('provides a description of the assertion being made', () => {
        expect(Ensure.that(4, isIdenticalTo(7)).toString()).to.equal(`#actor ensures that 4 does have value identical to 7`);
    });

    given<KnowableUnknown<number>>(
        42,
        p(42),
        q(42),
        q(p(42)),
    ).
    it('allows for the actual to be a KnowableUnknown<T> as it compares its value', (actual: KnowableUnknown<number>) => {
        return expect(Enrique.attemptsTo(
            Ensure.that(actual, isIdenticalTo(42)),
        )).to.be.fulfilled;
    });
});
