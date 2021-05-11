import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';

import { contain, Ensure } from '../../src';

describe('contain', () => {
    /** @test {contain} */
    it('allows for the actor flow to continue when the "actual" contains the "expected" text', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([ { word: 'Hello' }, { word: 'World' } ], contain({ word: 'World' })),
        )).to.be.fulfilled;
    });

    /** @test {contain} */
    it('breaks the actor flow when "actual" does not contain the "expected" text', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([ 'Hello', 'World' ], contain('Mundo')),
        )).to.be.rejectedWith(AssertionError, `Expected [ 'Hello', 'World' ] to contain 'Mundo'`)
            .then((error: AssertionError) => {
                expect(error.expected.toString()).to.equal('Mundo');
                expect(error.actual).to.deep.equal([ 'Hello', 'World' ]);
            });
    });

    /** @test {contain} */
    it('contributes to a human-readable description', () => {
        expect(Ensure.that([ 1, 2, 3 ], contain(2)).toString())
            .to.equal(`#actor ensures that [ 1, 2, 3 ] does contain 2`);
    });
});
