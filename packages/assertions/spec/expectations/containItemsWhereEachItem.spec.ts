import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError, Question } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { containItemsWhereEachItem, Ensure, equals, isGreaterThan, property, startsWith } from '../../src';

describe('containItemsWhereEachItem', () => {

    it('allows for the actor flow to continue when the "actual" includes only those items that meet the expectation', () => {
        return actorCalled('Astrid').attemptsTo(
            Ensure.that([ 1, 2, 3 ], containItemsWhereEachItem(isGreaterThan(0))),
        );
    });

    it('breaks the actor flow when "actual" contains at least one item that does not meet the expectation', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([ 7, 7, 2 ], containItemsWhereEachItem(equals(7))),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected [ 7, 7, 2 ] to contain items where each item does equal 7
            |
            | Expectation: containItemsWhereEachItem(equals(7))
            |
            | Expected number: 7
            | Received Array
            |
            | [
            |   7,
            |   7,
            |   2
            | ]
            |`);
    });

    it('works with nested arrays', () => {
        const nestedArrays = Question.about('nested arrays', actor_ => [ [ 0, 1 ], [ 2, 3 ], [ 4, 5 ] ]);
        const expectedValue = Question.about('expected value', actor_ => 6);

        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(
                nestedArrays,
                containItemsWhereEachItem(
                    containItemsWhereEachItem(
                        equals(expectedValue)
                    )
                )
            ),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected nested arrays to contain items where each item does contain items where each item does equal expected value
            |
            | Expectation: containItemsWhereEachItem(containItemsWhereEachItem(equals(6)))
            |
            | Expected number: 6
            | Received Array
            |
            | [
            |   [
            |     0,
            |     1
            |   ],
            |   [
            |     2,
            |     3
            |   ],
            |   [
            |     4,
            |     5
            |   ]
            | ]
            |`);
    });

    it('works with arrays of objects', () => {
        const people = Question.about('nested arrays', actor_ => [ { name: 'Alice' }, { name: 'Barbara' } ]);

        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(
                people,
                containItemsWhereEachItem(
                    property('name', startsWith('A'))
                )
            ),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected nested arrays to contain items where each item does have property name that does start with "A"
            |
            | Expectation: containItemsWhereEachItem(property('name', startsWith('A')))
            |
            | Expected string: A
            | Received Array
            |
            | [
            |   {
            |     name: 'Alice'
            |   },
            |   {
            |     name: 'Barbara'
            |   }
            | ]
            |`);
    });

    it('breaks the actor flow when "actual" is an empty list', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([], containItemsWhereEachItem(equals(42))),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected [ ] to contain items where each item does equal 42
            |
            | Expectation: containItemsWhereEachItem(<<unanswered>>)
            |
            | Expected Unanswered
            | Received Array
            |
            | []
            |`);
    });

    it('contributes to a human-readable description', () => {

        const numbers = () =>
            Question.about('list of numbers', actor => [ 0, 1, 2 ]);

        expect(Ensure.that(numbers(), containItemsWhereEachItem(isGreaterThan(1))).toString())
            .to.equal(`#actor ensures that list of numbers does contain items where each item does have value greater than 1`);
    });
});
