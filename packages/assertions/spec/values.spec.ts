import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError, Question } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { TinyType, TinyTypeOf } from 'tiny-types';

import { descriptionOf } from '../src';

describe('functions', () => {

    const p = _ => Promise.resolve(_);
    const q = _ => Question.about(`answer to some question`, actor => _);

    describe('descriptionOf', () => {

        const example = 'example value';

        given([
            { description: 'promise', value: p(example), expected: `the promised value` },
            { description: 'question', value: q(example), expected: `answer to some question` },
            { description: 'question about a promise', value: q(p(example)), expected: `answer to some question` },
        ]).
        it(`describes the values that should not be immediately resolved`, ({ value, expected }) =>
            expect(descriptionOf(value)).to.equal(expected),
        );

        given([
            { description: 'string',    value: 'string',            expected: `'string'`         },
            { description: 'number',    value: 123,                 expected: `123`              },
            { description: 'object',    value: { key: 'value' },    expected: `{ key: 'value' }` },
            { description: 'array',     value: [ 1, 2, 3 ],         expected: `[ 1, 2, 3 ]`      },
            { description: 'null',      value: null,                expected: `null` },
            { description: 'undefined', value: undefined,           expected: `undefined`        },
        ]).
        it('describes the values that can be immediately resolved', ({ value, expected }) =>
            expect(descriptionOf(value)).to.equal(expected),
        );

        describe('custom methods', () => {

            class Name extends TinyTypeOf<string>() {}
            class Person extends TinyType {
                constructor(public readonly name: Name) {
                    super();
                }
            }

            const
                actor = Actor.named('Andy'),
                person = new Person(new Name('Billy')),
                immutableJsOutput = 'Map { "a": List [ 1, 2, 3 ] }',
                inspectable = { inspect: () => immutableJsOutput },
                date = new Date('2018-09-27');

            given([
                { description: 'Actor',         value: actor,        expected: `Actor(name=Andy, abilities=[])` },
                { description: 'TinyType',      value: person,       expected: `Person(name=Name(value=Billy))` },
            ]).
            it('uses toString() if the object defines it', ({ value, expected }) =>
                expect(descriptionOf(value)).to.equal(expected),
            );

            it('uses inspect() if the object defines it', () =>
                expect(descriptionOf(inspectable)).to.equal(immutableJsOutput),
            );

            it('uses toISOString if the object is a Date', () => {
                expect(descriptionOf(date)).to.equal(date.toISOString());
            });
        });
    });
});
