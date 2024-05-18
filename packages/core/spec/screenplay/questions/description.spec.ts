/* eslint-disable unicorn/no-null,unicorn/no-useless-undefined */
import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { type Actor, Cast, description, Masked, Question, type QuestionAdapter, Serenity, Task } from '../../../src';
import { expect } from '../../expect';

function p<T>(value: T): Promise<T> {
    return Promise.resolve(value);
}

function q<T>(value: T, description: string = 'some value'): QuestionAdapter<Awaited<T>> {
    return Question.about('some value', actor => value);
}

describe('description', () => {

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

    describe('with no parameters', () => {

        it('resolves to the original string value', async () => {
            const question = description`#actor performs an interaction`;

            const answer = await actor.answer(question);

            expect(answer).to.equal('#actor performs an interaction');
        });

        it('is described by the original string value', async () => {
            const question = description`#actor performs an interaction`;

            const taskDescription = question.toString();

            expect(taskDescription).to.equal('#actor performs an interaction');
        });
    });

    describe('with primitive value parameters', () => {

        const examples = [
            // Primitive values
            { description: 'string',        value: 'string',                    expectedAnswer: `#actor enters "string"`,       expectedDescription: `#actor enters "string"`,    },
            { description: 'number',        value: 123,                         expectedAnswer: `#actor enters 123`,            expectedDescription: `#actor enters 123`,         },
            { description: 'NaN',           value: Number.NaN,                  expectedAnswer: `#actor enters NaN`,            expectedDescription: `#actor enters NaN`,         },
            { description: 'Infinity',      value: Number.POSITIVE_INFINITY,    expectedAnswer: `#actor enters Infinity`,       expectedDescription: `#actor enters Infinity`,    },
            { description: 'bigint',        value: BigInt(123),                 expectedAnswer: `#actor enters 123`,            expectedDescription: `#actor enters 123`,         },
            { description: 'boolean',       value: false,                       expectedAnswer: `#actor enters false`,          expectedDescription: `#actor enters false`,       },
            { description: 'undefined',     value: undefined,                   expectedAnswer: `#actor enters undefined`,      expectedDescription: `#actor enters undefined`,   },
            { description: 'symbol',        value: Symbol('abc'),               expectedAnswer: `#actor enters Symbol(abc)`,    expectedDescription: `#actor enters Symbol(abc)`, },
            { description: 'null',          value: null,                        expectedAnswer: `#actor enters null`,           expectedDescription: `#actor enters null`,        },

            // Promised primitive values
            { description: 'Promise<string>',       value: p('string'),         expectedAnswer: `#actor enters "string"`,      expectedDescription: `#actor enters Promise` },
            { description: 'Promise<number>',       value: p(123),              expectedAnswer: `#actor enters 123`,           expectedDescription: `#actor enters Promise` },
            { description: 'Promise<bigint>',       value: p(BigInt(123)),      expectedAnswer: `#actor enters 123`,           expectedDescription: `#actor enters Promise` },
            { description: 'Promise<boolean>',      value: p(false),            expectedAnswer: `#actor enters false`,         expectedDescription: `#actor enters Promise` },
            { description: 'Promise<undefined>',    value: p(undefined),        expectedAnswer: `#actor enters undefined`,     expectedDescription: `#actor enters Promise` },
            { description: 'Promise<symbol>',       value: p(Symbol('abc')),    expectedAnswer: `#actor enters Symbol(abc)`,   expectedDescription: `#actor enters Promise` },
            { description: 'Promise<null>',         value: p(null),             expectedAnswer: `#actor enters null`,          expectedDescription: `#actor enters Promise` },

            // Questions resolving to primitive values
            { description: 'Promise<string>',       value: q('string'),         expectedAnswer: `#actor enters "string"`,      expectedDescription: `#actor enters some value` },
            { description: 'Promise<number>',       value: q(123),              expectedAnswer: `#actor enters 123`,           expectedDescription: `#actor enters some value` },
            { description: 'Promise<bigint>',       value: q(BigInt(123)),      expectedAnswer: `#actor enters 123`,           expectedDescription: `#actor enters some value` },
            { description: 'Promise<boolean>',      value: q(false),            expectedAnswer: `#actor enters false`,         expectedDescription: `#actor enters some value` },
            { description: 'Promise<undefined>',    value: q(undefined),        expectedAnswer: `#actor enters undefined`,     expectedDescription: `#actor enters some value` },
            { description: 'Promise<symbol>',       value: q(Symbol('abc')),    expectedAnswer: `#actor enters Symbol(abc)`,   expectedDescription: `#actor enters some value` },
            { description: 'Promise<null>',         value: q(null),             expectedAnswer: `#actor enters null`,          expectedDescription: `#actor enters some value` },

            // Questions resolving to promised primitive values
            { description: 'Promise<string>',       value: q(p('string')),      expectedAnswer: `#actor enters "string"`,      expectedDescription: `#actor enters some value` },
            { description: 'Promise<number>',       value: q(p(123)),           expectedAnswer: `#actor enters 123`,           expectedDescription: `#actor enters some value` },
            { description: 'Promise<bigint>',       value: q(p(BigInt(123))),   expectedAnswer: `#actor enters 123`,           expectedDescription: `#actor enters some value` },
            { description: 'Promise<boolean>',      value: q(p(false)),         expectedAnswer: `#actor enters false`,         expectedDescription: `#actor enters some value` },
            { description: 'Promise<undefined>',    value: q(p(undefined)),     expectedAnswer: `#actor enters undefined`,     expectedDescription: `#actor enters some value` },
            { description: 'Promise<symbol>',       value: q(p(Symbol('abc'))), expectedAnswer: `#actor enters Symbol(abc)`,   expectedDescription: `#actor enters some value` },
            { description: 'Promise<null>',         value: q(p(null)),          expectedAnswer: `#actor enters null`,          expectedDescription: `#actor enters some value` },
        ];

        given(examples).
        it('resolves to a value with interpolated parameters', async ({ value, expectedAnswer }) => {
            const question = description`#actor enters ${ value }`;

            const answer = await actor.answer(question);

            expect(answer).to.equal(expectedAnswer);
        });

        given(examples).
        it('is described using interpolated parameters', async ({ value, expectedDescription }) => {
            const question = description`#actor enters ${ value }`;

            expect(question.toString()).to.equal(expectedDescription);
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
            { description: 'plain object',          value: { name: { first: 'Jan', last: 'Molak' } },       expectedAnswer: `#actor enters { name: { first: "Jan", last: "Molak" } }`,                          expectedDescription: `#actor enters { name: { first: "Jan", last: "Molak" } }`,                         },
            { description: 'Date',                  value: new Date(1995, 11, 17, 3, 24, 0),                expectedAnswer: `#actor enters Date(1995-12-17T03:24:00.000Z)`,                                     expectedDescription: `#actor enters Date(1995-12-17T03:24:00.000Z)`,                                    },
            { description: 'Array',                 value: [ 'hello', 123 ],                                expectedAnswer: `#actor enters [ "hello", 123 ]`,                                                   expectedDescription: `#actor enters [ "hello", 123 ]`,                                                  },
            { description: 'Map',                   value: new Map([['key', 'value']]),                     expectedAnswer: `#actor enters Map({ key: "value" })`,                                              expectedDescription: `#actor enters Map({ key: "value" })`,                                             },
            { description: 'Set',                   value: new Set([ 1, 2, 3 ]),                            expectedAnswer: `#actor enters Set([ 1, 2, 3 ])`,                                                   expectedDescription: `#actor enters Set([ 1, 2, 3 ])`,                                                  },
            { description: 'Error',                 value: new Error('example'),                            expectedAnswer: `#actor enters Error({ message: "example", stack: "Error: example     at ... })`,   expectedDescription: `#actor enters Error({ message: "example", stack: "Error: example     at ... })`,  },
            { description: 'RegExp',                value: /[Hh]ello/g,                                     expectedAnswer: `#actor enters /[Hh]ello/g`,                                                        expectedDescription: `#actor enters /[Hh]ello/g`,                                                       },
            { description: 'custom toString',       value: { toString: () => 'example' } as any,            expectedAnswer: `#actor enters example`,                                                            expectedDescription: `#actor enters example`,                                                           },
            { description: 'instance no toString',  value: new Person('Jan', 'Molak'),                      expectedAnswer: `#actor enters Person({ firstName: "Jan", lastName: "Molak" })`,                    expectedDescription: `#actor enters Person({ firstName: "Jan", lastName: "Molak" })`                    },
        ];

        given(examples).
        it('resolves to a value with interpolated parameters', async ({ value, expectedAnswer }) => {
            const question = description`#actor enters ${ value }`;

            const answer = await actor.answer(question);

            expect(answer).to.equal(expectedAnswer);
        });

        given(examples).
        it('is described using interpolated parameters', async ({ value, expectedDescription }) => {
            const question = description`#actor enters ${ value }`;

            expect(question.toString()).to.equal(expectedDescription);
        });
    });

    describe('with masked values', () => {

        it('masks the value in the description', async () => {
            const taskDescription = description`#actor enters ${ Masked.valueOf(`password`) }`;
            const task = Task.where(taskDescription);

            expect(task.toString()).to.equal(`#actor enters [MASKED]`);

            const answer = await task.describedBy(actor);

            expect(answer).to.equal(`#actor enters "password"`);
        });

        it(`masks the value in the description when it's nested in an object`, async () => {
            const taskDescription = description`#actor enters ${ { password: Masked.valueOf(`password`) } }`;
            const task = Task.where(taskDescription);

            expect(task.toString()).to.equal(`#actor enters { password: [MASKED] }`);
        });

        it(`masks the value in the description when it's nested in an array`, async () => {
            const taskDescription = description`#actor enters ${ [ Masked.valueOf(`password`) ] }`;
            const task = Task.where(taskDescription);

            expect(task.toString()).to.equal(`#actor enters [ [MASKED] ]`);
        });
    });

    it('can have the default description overridden', async () => {
        const question = description`/products/${ 1 }/attributes/${ Promise.resolve(2) }`
            .describedAs('/products/:productId/attributes/:attributeId');

        expect(question.toString()).to.equal('/products/:productId/attributes/:attributeId')
    });
});
