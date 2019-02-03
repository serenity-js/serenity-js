import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';
import { contains, Ensure } from '../../src';

describe('contains', () => {

    const Astrid = Actor.named('Astrid');

    /** @test {contains} */
    it(`allows for the actor flow to continue when the "actual" contains the "expected" text`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that([ { word: 'Hello' }, { word: 'World' } ], contains({ word: 'World' })),
        )).to.be.fulfilled;
    });

    /** @test {contains} */
    it(`breaks the actor flow when "actual" does not contain the "expected" text`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that([ 'Hello', 'World' ], contains('Mundo')),
        )).to.be.rejectedWith(AssertionError, `Expected [ 'Hello', 'World' ] to contain 'Mundo'`);
    });

    /** @test {contains} */
    it(`contributes to a human-readable description`, () => {
        expect(Ensure.that([ 1, 2, 3 ], contains(2)).toString())
            .to.equal(`#actor ensures that [ 1, 2, 3 ] does contain 2`);
    });
});
