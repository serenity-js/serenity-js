import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError, Question } from '@serenity-js/core';
import { containItemsWhereEachItem, Ensure, equals, isGreaterThan } from '../../src';

describe('containItemsWhereEachItem', () => {

    const Astrid = Actor.named('Astrid');

    /** @test {containItemsWhereEachItem} */
    it(`allows for the actor flow to continue when the "actual" includes only those items that meet the expectation`, () => {
        return Astrid.attemptsTo(
            Ensure.that([ 1, 2, 3 ], containItemsWhereEachItem(isGreaterThan(0))),
        );
    });

    /** @test {containItemsWhereEachItem} */
    it(`breaks the actor flow when "actual" contains at least one item that does not meet the expectation`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that([ 7, 7, 2 ], containItemsWhereEachItem(equals(7))),
        )).to.be.rejectedWith(AssertionError, `Expected [ 7, 7, 2 ] to contain items where each item does equal 7`);
    });

    /** @test {containItemsWhereEachItem} */
    it(`breaks the actor flow when "actual" is an empty list`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that([], containItemsWhereEachItem(equals(42))),
        )).to.be.rejectedWith(AssertionError, `Expected [ ] to contain items where each item does equal 42`);
    });

    /** @test {atLeastOne} */
    it(`contributes to a human-readable description`, () => {
        const numbers = () => Question.about('list of numbers', actor => [ 0, 1, 2 ]);

        expect(Ensure.that(numbers(), containItemsWhereEachItem(isGreaterThan(1))).toString())
            .to.equal(`#actor ensures that list of numbers does contain items where each item does have value greater than 1`);
    });
});
