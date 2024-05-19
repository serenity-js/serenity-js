/* eslint-disable unicorn/no-null,unicorn/no-useless-undefined */
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import type { QuestionAdapter} from '../../../src';
import { descriptionText,Masked, Question } from '../../../src';
import { expect } from '../../expect';

function p<T>(value: T): Promise<T> {
    return Promise.resolve(value);
}

function q<T>(value: T, description: string = 'some value'): QuestionAdapter<Awaited<T>> {
    return Question.about('some value', actor => value);
}

describe('descriptionText', () => {

    describe('using custom options', () => {
        it(`trims the parameter to the desired maximum length`, async () => {
            const result = descriptionText({ maxLength: 10 }) `#actor enters a very ${ 'looooooong-should-be-trimmed' } string`;

            expect(result).to.equal('#actor enters a very "looooooong..." string');
        });

        it(`trims the nested object's properties to the desired maximum length`, async () => {
            const value = {
                name: {
                    first: 'Extremely long first name',
                    last: 'Even longer last name',
                },
            };

            const result = descriptionText({ maxLength: 20 }) `#actor enters ${ value }`;

            expect(result).to.equal('#actor enters { name: { first: "Extr... }');
        });

        it(`complains if the custom maximum length is less than 10`, async () => {
            expect(() => descriptionText({ maxLength: 9 }) `#actor enters a very ${ 'looooooong-should-be-trimmed' } string`).to.throw(Error, 'options.maxLength should either be equal to 10 or be greater than 10');
        });
    });

    describe('using default options', () => {

        describe('with no parameters', () => {

            it('is returns the original string value', async () => {
                const result = descriptionText`#actor performs an interaction`;

                expect(result).to.equal('#actor performs an interaction');
            });
        });

        describe('with primitive value parameters', () => {

            const examples = [
                // Primitive values
                { description: 'string',        value: 'string',                    expectedResult: `#actor enters "string"`,    },
                { description: 'number',        value: 123,                         expectedResult: `#actor enters 123`,         },
                { description: 'NaN',           value: Number.NaN,                  expectedResult: `#actor enters NaN`,         },
                { description: 'Infinity',      value: Number.POSITIVE_INFINITY,    expectedResult: `#actor enters Infinity`,    },
                { description: 'bigint',        value: BigInt(123),                 expectedResult: `#actor enters 123`,         },
                { description: 'boolean',       value: false,                       expectedResult: `#actor enters false`,       },
                { description: 'undefined',     value: undefined,                   expectedResult: `#actor enters undefined`,   },
                { description: 'symbol',        value: Symbol('abc'),               expectedResult: `#actor enters Symbol(abc)`, },
                { description: 'null',          value: null,                        expectedResult: `#actor enters null`,        },

                // Promised primitive values
                { description: 'Promise<string>',       value: p('string'),         expectedResult: `#actor enters Promise` },
                { description: 'Promise<number>',       value: p(123),              expectedResult: `#actor enters Promise` },
                { description: 'Promise<bigint>',       value: p(BigInt(123)),      expectedResult: `#actor enters Promise` },
                { description: 'Promise<boolean>',      value: p(false),            expectedResult: `#actor enters Promise` },
                { description: 'Promise<undefined>',    value: p(undefined),        expectedResult: `#actor enters Promise` },
                { description: 'Promise<symbol>',       value: p(Symbol('abc')),    expectedResult: `#actor enters Promise` },
                { description: 'Promise<null>',         value: p(null),             expectedResult: `#actor enters Promise` },

                // Questions resolving to primitive values
                { description: 'Question<string>',       value: q('string'),        expectedResult: `#actor enters some value` },
                { description: 'Question<number>',       value: q(123),             expectedResult: `#actor enters some value` },
                { description: 'Question<bigint>',       value: q(BigInt(123)),     expectedResult: `#actor enters some value` },
                { description: 'Question<boolean>',      value: q(false),           expectedResult: `#actor enters some value` },
                { description: 'Question<undefined>',    value: q(undefined),       expectedResult: `#actor enters some value` },
                { description: 'Question<symbol>',       value: q(Symbol('abc')),   expectedResult: `#actor enters some value` },
                { description: 'Question<null>',         value: q(null),            expectedResult: `#actor enters some value` },

                // Questions resolving to promised primitive values
                { description: 'Question<Promise<string>>',       value: q(p('string')),        expectedResult: `#actor enters some value` },
                { description: 'Question<Promise<number>>',       value: q(p(123)),             expectedResult: `#actor enters some value` },
                { description: 'Question<Promise<bigint>>',       value: q(p(BigInt(123))),     expectedResult: `#actor enters some value` },
                { description: 'Question<Promise<boolean>>',      value: q(p(false)),           expectedResult: `#actor enters some value` },
                { description: 'Question<Promise<undefined>>',    value: q(p(undefined)),       expectedResult: `#actor enters some value` },
                { description: 'Question<Promise<symbol>>',       value: q(p(Symbol('abc'))),   expectedResult: `#actor enters some value` },
                { description: 'Question<Promise<null>>',         value: q(p(null)),            expectedResult: `#actor enters some value` },
            ];

            given(examples).
            it('is described using interpolated parameters', async ({ value, expectedResult }) => {
                const result = descriptionText`#actor enters ${ value }`;

                expect(result).to.equal(expectedResult);
            });
        });

        describe('with objects', () => {
            class Person {
                constructor(
                    public readonly firstName: string,
                    public readonly lastName: string,
                ) {
                }
            }

            const examples = [
                { description: 'plain object',          value: { name: { first: 'Jan', last: 'Molak' } },   expectedValue: `#actor enters { name: { first: "Jan", last: "Molak" } }`,                           },
                { description: 'Array',                 value: [ 'hello', 123 ],                            expectedValue: `#actor enters [ "hello", 123 ]`,                                                    },
                { description: 'Date',                  value: new Date(1995, 11, 17, 3, 24, 0),            expectedValue: `#actor enters Date(1995-12-17T03:24:00.000Z)`,                                      },
                { description: 'Map',                   value: new Map([['key', 'value']]),                 expectedValue: `#actor enters Map({ key: "value" })`,                                               },
                { description: 'Set',                   value: new Set([ 1, 2, 3 ]),                        expectedValue: `#actor enters Set([ 1, 2, 3 ])`,                                                    },
                { description: 'Error',                 value: new Error('example'),                        expectedValue: `#actor enters Error({ message: "example", stack: "Error: example     at ... })`,    },
                { description: 'RegExp',                value: /[Hh]ello/g,                                 expectedValue: `#actor enters /[Hh]ello/g`,                                                         },
                { description: 'custom toString',       value: { toString: () => 'example' } as any,        expectedValue: `#actor enters example`,                                                             },
                { description: 'instance no toString',  value: new Person('Jan', 'Molak'),                  expectedValue: `#actor enters Person({ firstName: "Jan", lastName: "Molak" })`,                     },
            ];

            given(examples).
            it('is described using interpolated parameters', async ({ value, expectedValue }) => {
                const result = descriptionText`#actor enters ${ value }`;

                expect(result).to.equal(expectedValue);
            });
        });

        describe('with masked values', () => {

            it('retains the masked primitive value', async () => {
                const result = descriptionText`#actor enters ${ Masked.valueOf(`password`) }`;

                expect(result).to.equal(`#actor enters [MASKED]`);
            });

            it('retains the masked primitive value nested in an object', async () => {
                const result = descriptionText`#actor enters ${ { password: Masked.valueOf(`password`) } }`;

                expect(result).to.equal(`#actor enters { password: [MASKED] }`);
            });

            it('retains the masked primitive value nested in an array', async () => {
                const result = descriptionText`#actor enters ${ [ Masked.valueOf(`password`) ] }`;

                expect(result).to.equal(`#actor enters [ [MASKED] ]`);
            });
        });
    });
});
