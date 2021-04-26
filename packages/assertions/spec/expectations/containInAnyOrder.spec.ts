import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError, Question } from '@serenity-js/core';
import { containInAnyOrder, Ensure } from '../../src';

describe('containInAnyOrder', () => {

    const expected = ['milk', 'butter', 'eggs', 'sugar', 'butter']

    /** @test {containInAnyOrder} */
    it('allows for the actor flow to continue when the "actual" contains "expected" in any order', () => {
        return expect(actorCalled('Simon').attemptsTo(
            Ensure.that(['milk', 'sugar', 'butter', 'eggs', 'butter'],
                containInAnyOrder(expected)),
        )).to.be.fulfilled;
    });

    /** @test {containInAnyOrder} */
    it('breaks the actor flow when "actual" is an empty list', () => {
        return expect(actorCalled('Simon').attemptsTo(
            Ensure.that([], containInAnyOrder(expected)),
        )).to.be.rejectedWith(AssertionError, `Expected [ ] to contain all items in any order from [ 'butter', 'butter', 'eggs', 'milk', 'sugar' ]`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal(expected);
                expect(error.actual).to.deep.equal([]);
            });
    });

    /** @test {containInAnyOrder} */
    it('breaks the actor flow when "actual" is missing an item from "expected"', () => {
        return expect(actorCalled('Simon').attemptsTo(
            Ensure.that(['milk', 'sugar', 'eggs', 'butter'], containInAnyOrder(expected)),
        )).to.be.rejectedWith(AssertionError, `Expected [ 'butter', 'eggs', 'milk', 'sugar' ] to contain all items in any order from [ 'butter', 'butter', 'eggs', 'milk', 'sugar' ]`)
            .then((error: AssertionError) => {
                expect(error.expected).to.equal(expected);
                expect(error.actual).to.deep.equal(['butter', 'eggs', 'milk', 'sugar']);
            });
    });

    /** @test {containInAnyOrder} */
    it('contributes to a human-readable description', () => {
        const actual = () => Question.about('list of items', actor => expected);

        expect(Ensure.that(actual(), containInAnyOrder(expected)).toString())
            .to.equal(`#actor ensures that list of items does contain all items in any order from [ 'butter', 'butter', 'eggs', 'milk', 'sugar' ]`);
    });
});
