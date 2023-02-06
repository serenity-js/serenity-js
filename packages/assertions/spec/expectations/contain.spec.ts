import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { contain, Ensure } from '../../src';

describe('contain', () => {
    it('allows for the actor flow to continue when the "actual" contains the "expected" text', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([ { word: 'Hello' }, { word: 'World' } ], contain({ word: 'World' })),
        )).to.be.fulfilled;
    });

    it('breaks the actor flow when "actual" does not contain the "expected" text', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that([ 'Hello', 'World' ], contain('Mundo')),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected [ 'Hello', 'World' ] to contain 'Mundo'
            |
            | Expectation: contain('Mundo')
            |
            | Expected string: Mundo
            | Received Array
            |
            | [
            |   'Hello',
            |   'World'
            | ]
            |`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that([ 1, 2, 3 ], contain(2)).toString())
            .to.equal(`#actor ensures that [ 1, 2, 3 ] does contain 2`);
    });
});
