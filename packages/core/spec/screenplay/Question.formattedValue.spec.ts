import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { type Actor, Cast, Question, Serenity } from '../../src';
import { expect } from '../expect';

describe('Question.formattedValue', () => {

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
            { description: 'string',        value: 'string',                    expectedAnswer: `"string"`,     expectedToString: `"string"`,           },
            { description: 'number',        value: 123,                         expectedAnswer: `123`,          expectedToString: `123`,                },
            { description: 'NaN',           value: Number.NaN,                  expectedAnswer: `NaN`,          expectedToString: `NaN`,                },
            { description: 'Infinity',      value: Number.POSITIVE_INFINITY,    expectedAnswer: `Infinity`,     expectedToString: `Infinity`,           },
            { description: 'bigint',        value: BigInt(123),                 expectedAnswer: `123`,          expectedToString: `123`,                },
            { description: 'boolean',       value: false,                       expectedAnswer: `false`,        expectedToString: `false`,              },
            { description: 'undefined',     value: undefined,                   expectedAnswer: `undefined`,    expectedToString: `formatted value`,    },
            { description: 'symbol',        value: Symbol('abc'),               expectedAnswer: `Symbol(abc)`,  expectedToString: `Symbol(abc)`,        },
            { description: 'null',          value: null,                        expectedAnswer: `null`,         expectedToString: `null`,               },

            // Promised primitive values
            { description: 'Promise<string>',       value: p('string'),         expectedAnswer: `"string"`,     expectedToString: `Promise` },
            { description: 'Promise<number>',       value: p(123),              expectedAnswer: `123`,          expectedToString: `Promise` },
            { description: 'Promise<bigint>',       value: p(BigInt(123)),      expectedAnswer: `123`,          expectedToString: `Promise` },
            { description: 'Promise<boolean>',      value: p(false),            expectedAnswer: `false`,        expectedToString: `Promise` },
            { description: 'Promise<undefined>',    value: p(undefined),        expectedAnswer: `undefined`,    expectedToString: `Promise` },
            { description: 'Promise<symbol>',       value: p(Symbol('abc')),    expectedAnswer: `Symbol(abc)`,  expectedToString: `Promise` },
            { description: 'Promise<null>',         value: p(null),             expectedAnswer: `null`,         expectedToString: `Promise` },
        ];

        given(examples).
        it('formats the provided value', async ({ value, expectedAnswer, expectedToString }) => {
            const question = Question.formattedValue().of(value);

            const toString      = question.toString();

            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expectedToString);
            expect(answer).to.equal(expectedAnswer);
            expect(description).to.equal(expectedAnswer);
        });
    });

    describe('with objects', () => {

        class Person {
            constructor(public readonly firstName: string, public readonly lastName: string) {
            }
        }

        const examples = [
            { description: 'plain object',          value: { name: { first: 'Jan', last: 'Molak' } },       expected: `{ name: { first: "Jan", last: "Molak" } }`,                  expectedDescription: `#actor enters { name: { first: "Jan", last: "Molak" } }`,                 },
            { description: 'Date',                  value: new Date('1995-12-17T03:24:00.000Z'),            expected: `Date(1995-12-17T03:24:00.000Z)`,                             expectedDescription: `#actor enters Date(1995-12-17T03:24:00.000Z)`,                            },
            { description: 'Array',                 value: [ 'hello', 123 ],                                expected: `[ "hello", 123 ]`,                                           expectedDescription: `#actor enters [ "hello", 123 ]`,                                          },
            { description: 'Map',                   value: new Map([['key', 'value']]),                     expected: `Map({ key: "value" })`,                                      expectedDescription: `#actor enters Map({ key: "value" })`,                                     },
            { description: 'Set',                   value: new Set([ 1, 2, 3 ]),                            expected: `Set([ 1, 2, 3 ])`,                                           expectedDescription: `#actor enters Set([ 1, 2, 3 ])`,                                          },
            { description: 'Error',                 value: new Error('example'),                            expected: `Error({ message: "example", stack: "Error: example... })`,   expectedDescription: `#actor enters Error({ message: "example", stack: "Error: example... })`,  },
            { description: 'RegExp',                value: /[Hh]ello/g,                                     expected: `/[Hh]ello/g`,                                                expectedDescription: `#actor enters /[Hh]ello/g`,                                               },
            { description: 'custom toString',       value: { toString: () => 'example' } as any,            expected: `example`,                                                    expectedDescription: `#actor enters example`,                                                   },
            { description: 'instance no toString',  value: new Person('Jan', 'Molak'),                      expected: `Person({ firstName: "Jan", lastName: "Molak" })`,            expectedDescription: `#actor enters Person({ firstName: "Jan", lastName: "Molak" })`            },
        ];

        given(examples).
        it('formats the provided value', async ({ value, expected }) => {
            const question = Question.formattedValue({ maxLength: 45 }).of(value);

            const toString      = question.toString();

            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expected);
            expect(answer).to.equal(expected);
            expect(description).to.equal(expected);
        });
    });

    describe('with questions', () => {

        const examples = [
            // Primitive values
            { description: 'Question<string>',        value: 'string',                    expectedAnswer: `"string"`,       },
            { description: 'Question<number>',        value: 123,                         expectedAnswer: `123`,            },
            { description: 'Question<NaN>',           value: Number.NaN,                  expectedAnswer: `NaN`,            },
            { description: 'Question<Infinity>',      value: Number.POSITIVE_INFINITY,    expectedAnswer: `Infinity`,       },
            { description: 'Question<bigint>',        value: BigInt(123),                 expectedAnswer: `123`,            },
            { description: 'Question<boolean>',       value: false,                       expectedAnswer: `false`,          },
            { description: 'Question<undefined>',     value: undefined,                   expectedAnswer: `undefined`,      },
            { description: 'Question<symbol>',        value: Symbol('abc'),               expectedAnswer: `Symbol(abc)`,    },
            { description: 'Question<null>',          value: null,                        expectedAnswer: `null`,           },

            // Promised primitive values
            { description: 'Question<Promise<string>>',       value: p('string'),         expectedAnswer: `"string"`,       },
            { description: 'Question<Promise<number>>',       value: p(123),              expectedAnswer: `123`,            },
            { description: 'Question<Promise<bigint>>',       value: p(BigInt(123)),      expectedAnswer: `123`,            },
            { description: 'Question<Promise<boolean>>',      value: p(false),            expectedAnswer: `false`,          },
            { description: 'Question<Promise<undefined>>',    value: p(undefined),        expectedAnswer: `undefined`,      },
            { description: 'Question<Promise<symbol>>',       value: p(Symbol('abc')),    expectedAnswer: `Symbol(abc)`,    },
            { description: 'Question<Promise<null>>',         value: p(null),             expectedAnswer: `null`,           },
        ];

        given(examples).
        it('formats the provided value', async ({ value, expectedAnswer }) => {
            const originalDescription = 'some context';
            const context = Question.about(originalDescription, actor_ => value);
            const question = Question.formattedValue().of(context);

            const toString      = question.toString();
            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(originalDescription);
            expect(answer).to.equal(expectedAnswer);
            expect(description).to.equal(expectedAnswer);
        });
    });

    describe('formatting', () => {

        it('trims long string descriptions, as per the configuration', async () => {
            const value     = '12345678901234567890'
            const maxLength = 10;
            const expected  = '"1234567..."';

            const question = Question.formattedValue({ maxLength }).of(value);

            const toString      = question.toString();

            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expected);
            expect(answer).to.equal(expected);
            expect(description).to.equal(expected);
        });

        it('trims arrays descriptions, as per the configuration', async () => {
            const value     = [ '1234567890', '1234567890' ]
            const maxLength = 20;
            const expected  = '[ "1234567890", "12... ]';

            const question = Question.formattedValue({ maxLength }).of(value);

            const toString      = question.toString();

            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expected);
            expect(answer).to.equal(expected);
            expect(description).to.equal(expected);
        });

        it('does not trim numbers', async () => {
            const value     = 1234567890;
            const maxLength = 5;
            const expected  = '1234567890';

            const question = Question.formattedValue({ maxLength }).of(value);

            const toString      = question.toString();

            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expected);
            expect(answer).to.equal(expected);
            expect(description).to.equal(expected);
        });

        it('adds ellipsis only when the string is at least 4 characters long', async () => {
            const value     = 'Mal';
            const maxLength = 2;
            const expected  = '"Mal"';

            const question = Question.formattedValue({ maxLength }).of(value);

            const toString      = question.toString();

            const answer        = await question.answeredBy(actor);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expected);
            expect(answer).to.equal(expected);
            expect(description).to.equal(expected);
        });
    });
});

function p<T>(value: T): Promise<T> {
    return Promise.resolve(value);
}

