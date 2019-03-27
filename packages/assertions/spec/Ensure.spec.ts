import 'mocha';
import { given } from 'mocha-testdata';

import { expect, stage } from '@integration/testing-tools';
import { AnswersQuestions, AssertionError, KnowableUnknown, LogicError } from '@serenity-js/core';
import { Ensure, equals, Expectation, Outcome } from '../src';
import { isIdenticalTo, p, q } from './fixtures';

/** @test {Ensure} */
describe('Ensure', () => {

    const Enrique = stage().theActorCalled('Enrique');

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

    /** @test {Ensure.that} */
    it('provides a description of the assertion being made, while correctly cleaning the output from new line characters', () => {
        expect(Ensure.that({ person: { name: 'Jan' }}, equals({
            person: {
                name: 'Jan',
            },
        })).toString()).to.equal(`#actor ensures that { person: { name: 'Jan' } } does equal { person: { name: 'Jan' } }`);
    });

    given<KnowableUnknown<number>>(
        42,
        p(42),
        q(42),
        q(p(42)),
    ).
    /** @test {Ensure.that} */
    it('allows for the actual to be a KnowableUnknown<T> as it compares its value', (actual: KnowableUnknown<number>) => {
        return expect(Enrique.attemptsTo(
            Ensure.that(actual, isIdenticalTo(42)),
        )).to.be.fulfilled;
    });

    /** @test {Ensure.that} */
    it(`complains when given an Expectation that doesn't conform to the interface`, () => {
        class BrokenExpectation<Expected, Actual> extends Expectation<Expected, Actual> {
            answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<any, Actual>> {
                return (actual: Actual) => Promise.resolve(null);
            }

            toString(): string {
                return `broken`;
            }
        }

        return expect(Enrique.attemptsTo(
            Ensure.that(4, new BrokenExpectation()),
        )).to.be.rejectedWith(LogicError, 'An Expectation should return an instance of an Outcome, not null');
    });
});
