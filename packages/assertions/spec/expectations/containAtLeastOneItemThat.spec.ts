import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError, Question } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { containAtLeastOneItemThat, Ensure, equals, isGreaterThan } from '../../src';

describe('containAtLeastOneItemThat', () => {

    it('allows for the actor flow to continue when the "actual" includes at least one item that meets the expectation', () => {
        return actorCalled('Astrid').attemptsTo(
            Ensure.that([ 0, 1, 2 ], containAtLeastOneItemThat(isGreaterThan(1))),
        );
    });

    it('breaks the actor flow when "actual" does not include at least one item that meets the expectation', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([ 0, 1, 2 ], containAtLeastOneItemThat(equals(7))),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected [ 0, 1, 2 ] to contain at least one item that does equal 7
            |
            | Expectation: containAtLeastOneItemThat(equals(7))
            |
            | Expected number: 7
            | Received Array
            |
            | [
            |   0,
            |   1,
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
                containAtLeastOneItemThat(
                    containAtLeastOneItemThat(
                        equals(expectedValue)
                    )
                )
            ),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected nested arrays to contain at least one item that does contain at least one item that does equal expected value
            |
            | Expectation: containAtLeastOneItemThat(containAtLeastOneItemThat(equals(6)))
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

    it('breaks the actor flow when "actual" is an empty list', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([], containAtLeastOneItemThat(equals(42))),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected [ ] to contain at least one item that does equal 42
            |
            | Expectation: containAtLeastOneItemThat(<<unanswered>>)
            |
            | Expected Unanswered
            | Received Array
            |
            | []
            |`);
    });

    it('contributes to a human-readable description', () => {

        const numbers = () =>
            Question.about('list of numbers', actor_ => [ 0, 1, 2 ]);

        expect(Ensure.that(numbers(), containAtLeastOneItemThat(isGreaterThan(1))).toString())
            .to.equal(`#actor ensures that list of numbers does contain at least one item that does have value greater than 1`);
    });
});
