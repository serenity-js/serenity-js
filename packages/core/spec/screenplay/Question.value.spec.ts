import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { type Actor, Cast, Question, Serenity } from '../../src';
import { expect } from '../expect';

describe('Question.value', () => {

    let serenity: Serenity,
        actor: Actor;

    beforeEach(() => {
        serenity = new Serenity();

        serenity.configure({
            crew: [ ],
            actors: Cast.where(actor => actor)
        });

        actor = serenity.theActorCalled('Tess');
    });

    describe('with primitive value parameters', () => {

        const examples = [
            // Primitive values
            { description: 'string',                value: 'string',                    expectedAnswer: 'string',                   expectedToString: `"string"`,           expectedDescription: `"string"`,        },
            { description: 'number',                value: 123,                         expectedAnswer: 123,                        expectedToString: `123`,                expectedDescription: `123`,             },
            { description: 'Infinity',              value: Number.POSITIVE_INFINITY,    expectedAnswer: Number.POSITIVE_INFINITY,   expectedToString: `Infinity`,           expectedDescription: `Infinity`,        },
            { description: 'bigint',                value: BigInt(123),                 expectedAnswer: BigInt(123),                expectedToString: `123`,                expectedDescription: `123`,             },
            { description: 'boolean',               value: false,                       expectedAnswer: false,                      expectedToString: `false`,              expectedDescription: `false`,           },
            { description: 'undefined',             value: undefined,                   expectedAnswer: undefined,                  expectedToString: `formatted value`,    expectedDescription: `formatted value`, },
            { description: 'symbol',                value: Symbol.for('abc'),           expectedAnswer: Symbol.for('abc'),          expectedToString: `Symbol(abc)`,        expectedDescription: `Symbol(abc)`,     },
            { description: 'null',                  value: null,                        expectedAnswer: null,                       expectedToString: `null`,               expectedDescription: `null`,            },

            // Promised primitive values
            { description: 'Promise<string>',       value: p('string'),                 expectedAnswer: 'string',                   expectedToString: `Promise`,        expectedDescription: `Promise`,     },
            { description: 'Promise<number>',       value: p(123),                      expectedAnswer: 123,                        expectedToString: `Promise`,        expectedDescription: `Promise`,     },
            { description: 'Promise<bigint>',       value: p(BigInt(123)),              expectedAnswer: BigInt(123),                expectedToString: `Promise`,        expectedDescription: `Promise`,     },
            { description: 'Promise<boolean>',      value: p(false),                    expectedAnswer: false,                      expectedToString: `Promise`,        expectedDescription: `Promise`,     },
            { description: 'Promise<undefined>',    value: p(undefined),                expectedAnswer: undefined,                  expectedToString: `Promise`,        expectedDescription: `Promise`,     },
            { description: 'Promise<symbol>',       value: p(Symbol.for('abc')),        expectedAnswer: Symbol.for('abc'),          expectedToString: `Promise`,        expectedDescription: `Promise`,     },
            { description: 'Promise<null>',         value: p(null),                     expectedAnswer: null,                       expectedToString: `Promise`,        expectedDescription: `Promise`,     },

            // Questions
        ];

        given(examples).
        it('wraps the provided value and adds a human-friendly description', async ({ value, expectedAnswer, expectedToString, expectedDescription }) => {
            const question      = Question.value().of(value);

            const toString      = question.toString();
            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expectedToString);
            expect(answer).to.equal(expectedAnswer);
            expect(description).to.equal(expectedDescription);
        });
    });

    describe('with objects', () => {

        class Person {
            constructor(public readonly firstName: string, public readonly lastName: string) {
            }
        }

        const examples = [
            { description: 'plain object',          value: { name: { first: 'Jan', last: 'Molak' } },       expectedToString: `{ name: { first: "Jan", last: "Molak" } }`,                  expectedDescription: `{ name: { first: "Jan", last: "Molak" } }`,                 },
            { description: 'Date',                  value: new Date('1995-12-17T03:24:00.000Z'),            expectedToString: `Date(1995-12-17T03:24:00.000Z)`,                             expectedDescription: `Date(1995-12-17T03:24:00.000Z)`,                            },
            { description: 'Array',                 value: [ 'hello', 123 ],                                expectedToString: `[ "hello", 123 ]`,                                           expectedDescription: `[ "hello", 123 ]`,                                          },
            { description: 'Map',                   value: new Map([['key', 'value']]),                     expectedToString: `Map({ key: "value" })`,                                      expectedDescription: `Map({ key: "value" })`,                                     },
            { description: 'Set',                   value: new Set([ 1, 2, 3 ]),                            expectedToString: `Set([ 1, 2, 3 ])`,                                           expectedDescription: `Set([ 1, 2, 3 ])`,                                          },
            { description: 'RegExp',                value: /[Hh]ello/g,                                     expectedToString: `/[Hh]ello/g`,                                                expectedDescription: `/[Hh]ello/g`,                                               },
            { description: 'custom toString',       value: { toString: () => 'example' } as any,            expectedToString: `example`,                                                    expectedDescription: `example`,                                                   },
            { description: 'instance no toString',  value: new Person('Jan', 'Molak'),                      expectedToString: `Person({ firstName: "Jan", lastName: "Molak" })`,            expectedDescription: `Person({ firstName: "Jan", lastName: "Molak" })`            },
        ];

        given(examples).
        it('wraps the provided value and adds a human-friendly description', async ({ value, expectedToString, expectedDescription }) => {
            const question      = Question.value().of(value);

            const toString      = question.toString();
            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expectedToString);
            expect(answer).to.deep.equal(value);
            expect(description).to.equal(expectedDescription);
        });
    });

    describe('with questions', () => {

        const examples = [
            // Primitive values
            { description: 'Question<string>',              value: 'string',                    expectedAnswer: 'string',                   },
            { description: 'Question<number>',              value: 123,                         expectedAnswer: 123,                        },
            { description: 'Question<Infinity>',            value: Number.POSITIVE_INFINITY,    expectedAnswer: Number.POSITIVE_INFINITY,   },
            { description: 'Question<bigint>',              value: BigInt(123),                 expectedAnswer: BigInt(123),                },
            { description: 'Question<boolean>',             value: false,                       expectedAnswer: false,                      },
            { description: 'Question<undefined>',           value: undefined,                   expectedAnswer: undefined,                  },
            { description: 'Question<symbol>',              value: Symbol.for('abc'),           expectedAnswer: Symbol.for('abc'),          },
            { description: 'Question<null>',                value: null,                        expectedAnswer: null,                       },

            // Promised primitive values
            { description: 'Question<Promise<string>>',     value: p('string'),                 expectedAnswer: 'string',               },
            { description: 'Question<Promise<number>>',     value: p(123),                      expectedAnswer: 123,                    },
            { description: 'Question<Promise<bigint>>',     value: p(BigInt(123)),              expectedAnswer: BigInt(123),            },
            { description: 'Question<Promise<boolean>>',    value: p(false),                    expectedAnswer: false,                  },
            { description: 'Question<Promise<undefined>>',  value: p(undefined),                expectedAnswer: undefined,              },
            { description: 'Question<Promise<symbol>>',     value: p(Symbol.for('abc')),        expectedAnswer: Symbol.for('abc'),      },
            { description: 'Question<Promise<null>>',       value: p(null),                     expectedAnswer: null,                   },
        ];

        given(examples).
        it('creates a question wrapper that returns the original value and maintains the original description', async ({ value, expectedAnswer }) => {
            const originalDescription = 'original context description';
            const context       = Question.about(originalDescription, actor_ => value);
            const question      = Question.value().of(context);

            const toString      = question.toString();
            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(context.toString());
            expect(answer).to.deep.equal(expectedAnswer);
            expect(description).to.equal(originalDescription);
        });
    });
});

function p<T>(value: T): Promise<T> {
    return Promise.resolve(value);
}

