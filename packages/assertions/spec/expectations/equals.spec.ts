import { expect } from '@integration/testing-tools';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import { TinyTypeOf } from 'tiny-types';

import { Ensure, equals } from '../../src';

describe('equals', () => {

    class Name extends TinyTypeOf<string>() {
    }

    given([
        { description: 'string', expected: 'hello', actual: 'hello' },
        { description: 'number', expected: 42, actual: 42 },
        { description: 'boolean', expected: false, actual: false },
        { description: 'object', expected: { k: 'v' }, actual: { k: 'v' } },
        { description: 'TinyType', expected: new Name('Jan'), actual: new Name('Jan') },
        { description: 'array', expected: [ null, 2, '3' ], actual: [ null, 2, '3' ] },
        { description: 'Date', expected: new Date('Jan 27, 2019'), actual: new Date('Jan 27, 2019') },
    ]).
    it('compares the value of "actual" and "expected" and allows for the actor flow to continue when they match', ({ actual, expected }) => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(actual, equals(expected)),
        )).to.be.fulfilled;
    });

    it(`breaks the actor flow when the values of "actual" and "expected" don't match`, () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(27, equals(42)),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 27 to equal 42
            |
            | Expectation: equals(42)
            |
            | Expected number: 42
            | Received number: 27
            |`);
    });

    it(`provides details when the actual value is undefined`, () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(undefined, equals(1)),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected undefined to equal 1
            |
            | Expectation: equals(1)
            |
            | Expected number:    1
            | Received undefined
            |`);
    });

    it(`provides details when the expected value is undefined`, () => {
        return expect(actorCalled('Astrid').attemptsTo(
            Ensure.that(1, equals(undefined)),
        )).to.be.rejectedWith(AssertionError, trimmed`
            | Expected 1 to equal undefined
            |
            | Expectation: equals(undefined)
            |
            | Expected undefined
            | Received number:    1
            |`);
    });

    it('contributes to a human-readable description', () => {
        expect(Ensure.that(27, equals(42)).toString()).to.equal('#actor ensures that 27 does equal 42');
    });
});
