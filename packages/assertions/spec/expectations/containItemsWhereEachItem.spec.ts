import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError, Question } from '@serenity-js/core';

import { containItemsWhereEachItem, Ensure, equals, isGreaterThan } from '../../src';

describe('containItemsWhereEachItem', () => {

    /** @test {containItemsWhereEachItem} */
    it('allows for the actor flow to continue when the "actual" includes only those items that meet the expectation', () => {
        return actorCalled('Astrid').attemptsTo(
            Ensure.that([ 1, 2, 3 ], containItemsWhereEachItem(isGreaterThan(0))),
        );
    });

    /** @test {containItemsWhereEachItem} */
    it('breaks the actor flow when "actual" contains at least one item that does not meet the expectation', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([ 7, 7, 2 ], containItemsWhereEachItem(equals(7))),
        )).to.be.rejectedWith(AssertionError, `Expected [ 7, 7, 2 ] to contain items where each item does equal 7`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal(7);
                expect(error.actual).to.deep.equal([ 7, 7, 2 ]);
            });
    });

    /** @test {containItemsWhereEachItem} */
    it('breaks the actor flow when "actual" is an empty list', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([], containItemsWhereEachItem(equals(42))),
        )).to.be.rejectedWith(AssertionError, `Expected [ ] to contain items where each item does equal 42`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal(undefined);
                expect(error.actual).to.deep.equal([]);
            });
    });

    /** @test {atLeastOne} */
    it('contributes to a human-readable description', () => {
        // eslint-disable-next-line unicorn/consistent-function-scoping
        const numbers = () =>
            Question.about('list of numbers', actor => [ 0, 1, 2 ]);

        expect(Ensure.that(numbers(), containItemsWhereEachItem(isGreaterThan(1))).toString())
            .to.equal(`#actor ensures that list of numbers does contain items where each item does have value greater than 1`);
    });
});
