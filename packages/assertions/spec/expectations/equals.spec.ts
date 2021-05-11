import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { TinyTypeOf } from 'tiny-types';

import { Ensure, equals } from '../../src';

/** @test {equals} */
describe('equals', () => {

    class Name extends TinyTypeOf<string>() {}

    given([
        { description: 'string',    expected: 'hello',          actual: 'hello'             },
        { description: 'number',    expected: 42,               actual: 42                  },
        { description: 'boolean',   expected: false,            actual: false               },
        { description: 'object',    expected: { k: 'v' },       actual: { k: 'v' }          },
        { description: 'TinyType',  expected: new Name('Jan'),  actual: new Name('Jan')     },
        { description: 'array',     expected: [ null, 2, '3' ], actual: [ null, 2, '3' ]    },      // eslint-disable-line unicorn/no-null
        { description: 'Date',      expected: new Date('Jan 27, 2019'), actual: new Date('Jan 27, 2019') },
    ]).
    it('compares the value of "actual" and "expected" and allows for the actor flow to continue when they match', ({ actual, expected }) => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(actual, equals(expected)),
        )).to.be.fulfilled;
    });

    /** @test {equals} */
    it('breaks the actor flow when the values of "actual" and "expected" don\'t match', () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(27, equals(42)),
        )).to.be.rejectedWith(AssertionError, 'Expected 27 to equal 42')
            .then((error: AssertionError) => {
                expect(error.expected).to.equal(42);
                expect(error.actual).to.equal(27);
            });
    });

    /** @test {equals} */
    it('contributes to a human-readable description', () => {
        expect(Ensure.that(27, equals(42)).toString()).to.equal('#actor ensures that 27 does equal 42');
    });
});
