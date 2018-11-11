import 'mocha';
import { given } from 'mocha-testdata';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError } from '@serenity-js/core';
import { TinyType, TinyTypeOf } from 'tiny-types';

import { Ensure, equals } from '../../src';

describe('equals', () => {

    const Enrique = Actor.named('Enrique');

    class Dev {
        constructor(public readonly name: string) {}
        code() { return null; }
    }
    class Name extends TinyTypeOf<string>() {}

    given([
        { description: 'number', actual: 42, expected: 42 },
        { description: 'boolean', actual: true, expected: true },
        { description: 'string', actual: 42, expected: 42 },
        { description: 'Date', actual: new Date(0), expected: new Date(0) },
        { description: 'object', actual: { name: 'Jan' }, expected: { name: 'Jan' } },
        { description: 'instance', actual: new Dev('Jan'), expected: new Dev('Jan') },
        { description: '.equals()', actual: new Name('Jan'), expected: new Name('Jan') },
        { description: '[ objects ]', actual: [ { k: 1 }, { l: 2 } ], expected: [  { k: 1 }, { l: 2 }  ] },
    ]).
    it('compares by value', ({ description, actual, expected }) =>
        expect(Enrique.attemptsTo(
            Ensure.that(actual, equals(expected)),
        )).to.be.fulfilled);

    // todo add a stringification test [ Array(2) ]

    it('throws an error when the assertion is not met', () => {
        return expect(Enrique.attemptsTo(
            Ensure.that(true, equals(false)),
        )).to.be.rejectedWith(AssertionError, 'true should be equal to false');
    });

    it('contributes to the task description', () => {
        expect(Ensure.that(true, equals(true)).toString())
            .to.equal(`#actor ensures that true is equal to true`);
    });
});
