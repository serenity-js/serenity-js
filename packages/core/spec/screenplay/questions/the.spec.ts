
import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { type Actor, Cast, Masked, Question, type QuestionAdapter, Serenity, Task, the } from '../../../src';
import { expect } from '../../expect';

function p<T>(value: T): Promise<T> {
    return Promise.resolve(value);
}

function q<T>(value: T, description: string = 'some value'): QuestionAdapter<Awaited<T>> {
    return Question.about(description, actor => value);
}

describe('the', () => {

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
            const question = the`#actor performs an interaction`;

            const answer = await question.answeredBy(actor);

            expect(answer).to.equal('#actor performs an interaction');
        });

        it('is described by the original string value', async () => {
            const question = the`#actor performs an interaction`;

            const toString = question.toString();

            expect(toString).to.equal('#actor performs an interaction');
        });

        it('includes actor name in the description', async () => {
            const question = the`#actor performs an interaction`;

            const description = await question.describedBy(actor);

            expect(description).to.equal('Tess performs an interaction');
        });
    });

    describe('with primitive value parameters', () => {

        const examples = [
            // Primitive values
            { description: 'string',        value: 'string',                    expectedAnswer: `#actor enters "string"`,      expectedDescription: `Tess enters "string"`,         expectedToString: `#actor enters "string"`,         },
            { description: 'number',        value: 123,                         expectedAnswer: `#actor enters 123`,           expectedDescription: `Tess enters 123`,              expectedToString: `#actor enters 123`,              },
            { description: 'NaN',           value: Number.NaN,                  expectedAnswer: `#actor enters NaN`,           expectedDescription: `Tess enters NaN`,              expectedToString: `#actor enters NaN`,              },
            { description: 'Infinity',      value: Number.POSITIVE_INFINITY,    expectedAnswer: `#actor enters Infinity`,      expectedDescription: `Tess enters Infinity`,         expectedToString: `#actor enters Infinity`,         },
            { description: 'bigint',        value: BigInt(123),                 expectedAnswer: `#actor enters 123`,           expectedDescription: `Tess enters 123`,              expectedToString: `#actor enters 123`,              },
            { description: 'boolean',       value: false,                       expectedAnswer: `#actor enters false`,         expectedDescription: `Tess enters false`,            expectedToString: `#actor enters false`,            },
            { description: 'undefined',     value: undefined,                   expectedAnswer: `#actor enters undefined`,     expectedDescription: `Tess enters undefined`,        expectedToString: `#actor enters undefined`,        },
            { description: 'symbol',        value: Symbol('abc'),               expectedAnswer: `#actor enters Symbol(abc)`,   expectedDescription: `Tess enters Symbol(abc)`,      expectedToString: `#actor enters Symbol(abc)`,      },
            { description: 'null',          value: null,                        expectedAnswer: `#actor enters null`,          expectedDescription: `Tess enters null`,             expectedToString: `#actor enters null`,             },

            // Promised primitive values
            { description: 'Promise<string>',       value: p('string'),         expectedAnswer: `#actor enters "string"`,      expectedDescription: `Tess enters Promise`,       expectedToString: `#actor enters Promise` },
            { description: 'Promise<number>',       value: p(123),              expectedAnswer: `#actor enters 123`,           expectedDescription: `Tess enters Promise`,       expectedToString: `#actor enters Promise` },
            { description: 'Promise<bigint>',       value: p(BigInt(123)),      expectedAnswer: `#actor enters 123`,           expectedDescription: `Tess enters Promise`,       expectedToString: `#actor enters Promise` },
            { description: 'Promise<boolean>',      value: p(false),            expectedAnswer: `#actor enters false`,         expectedDescription: `Tess enters Promise`,       expectedToString: `#actor enters Promise` },
            { description: 'Promise<undefined>',    value: p(undefined),        expectedAnswer: `#actor enters undefined`,     expectedDescription: `Tess enters Promise`,       expectedToString: `#actor enters Promise` },
            { description: 'Promise<symbol>',       value: p(Symbol('abc')),    expectedAnswer: `#actor enters Symbol(abc)`,   expectedDescription: `Tess enters Promise`,       expectedToString: `#actor enters Promise` },
            { description: 'Promise<null>',         value: p(null),             expectedAnswer: `#actor enters null`,          expectedDescription: `Tess enters Promise`,       expectedToString: `#actor enters Promise` },
        ];

        given(examples).
        it('resolves to a value with interpolated parameters', async ({ value, expectedAnswer, expectedDescription, expectedToString }) => {
            const question = the `#actor enters ${ value }`;

            const toString      = question.toString();
            const answer        = await actor.answer(question);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expectedToString);
            expect(answer).to.equal(expectedAnswer);
            expect(description).to.equal(expectedDescription);
        });
    });

    describe('with questions', () => {

        const examples = [
            // Questions resolving to primitive values
            { description: 'Question<string>',              value: q('string'),         expectedAnswer: `#actor enters "string"`,     expectedDescription: `Tess enters some value`,    expectedToString: `#actor enters some value` },
            { description: 'Question<number>',              value: q(123),              expectedAnswer: `#actor enters 123`,          expectedDescription: `Tess enters some value`,    expectedToString: `#actor enters some value` },
            { description: 'Question<bigint>',              value: q(BigInt(123)),      expectedAnswer: `#actor enters 123`,          expectedDescription: `Tess enters some value`,    expectedToString: `#actor enters some value` },
            { description: 'Question<boolean>',             value: q(false),            expectedAnswer: `#actor enters false`,        expectedDescription: `Tess enters some value`,    expectedToString: `#actor enters some value` },
            { description: 'Question<undefined>',           value: q(undefined),        expectedAnswer: `#actor enters undefined`,    expectedDescription: `Tess enters some value`,    expectedToString: `#actor enters some value` },
            { description: 'Question<symbol>',              value: q(Symbol('abc')),    expectedAnswer: `#actor enters Symbol(abc)`,  expectedDescription: `Tess enters some value`,    expectedToString: `#actor enters some value` },
            { description: 'Question<null>',                value: q(null),             expectedAnswer: `#actor enters null`,         expectedDescription: `Tess enters some value`,    expectedToString: `#actor enters some value` },

            // // Questions resolving to promised primitive values
            { description: 'Question<Promise<string>>',     value: q(p('string')),      expectedAnswer: `#actor enters "string"`,      expectedDescription: `Tess enters some value`,   expectedToString: `#actor enters some value` },
            { description: 'Question<Promise<number>>',     value: q(p(123)),           expectedAnswer: `#actor enters 123`,           expectedDescription: `Tess enters some value`,   expectedToString: `#actor enters some value` },
            { description: 'Question<Promise<bigint>>',     value: q(p(BigInt(123))),   expectedAnswer: `#actor enters 123`,           expectedDescription: `Tess enters some value`,   expectedToString: `#actor enters some value` },
            { description: 'Question<Promise<boolean>>',    value: q(p(false)),         expectedAnswer: `#actor enters false`,         expectedDescription: `Tess enters some value`,   expectedToString: `#actor enters some value` },
            { description: 'Question<Promise<undefined>>',  value: q(p(undefined)),     expectedAnswer: `#actor enters undefined`,     expectedDescription: `Tess enters some value`,   expectedToString: `#actor enters some value` },
            { description: 'Question<Promise<symbol>>',     value: q(p(Symbol('abc'))), expectedAnswer: `#actor enters Symbol(abc)`,   expectedDescription: `Tess enters some value`,   expectedToString: `#actor enters some value` },
            { description: 'Question<Promise<null>>',       value: q(p(null)),          expectedAnswer: `#actor enters null`,          expectedDescription: `Tess enters some value`,   expectedToString: `#actor enters some value` },
        ];

        given(examples).
        it('uses the static description of the question by default', async ({ value }) => {
            const question = the `#actor enters ${ value }`;

            const toString      = question.toString();
            const answer        = await actor.answer(question);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(`#actor enters some value`);
            expect(answer).to.equal(`#actor enters some value`);
            expect(description).to.equal(`Tess enters some value`);
        });

        given(examples).
        it('uses the dynamic description of the question when provided', async ({ value, expectedAnswer, expectedDescription, expectedToString }) => {
            const question = the `#actor enters ${ value.describedAs(Question.formattedValue()) }`;

            const toString      = question.toString();
            const answer        = await actor.answer(question);
            const description   = await question.describedBy(actor);

            expect(toString).to.equal(expectedToString);
            expect(answer).to.equal(expectedAnswer);
            expect(description).to.equal(expectedDescription);
        });
    });

    describe('with meta-questions', () => {

        const examplePayload = Question.about('payload', actor_ => {
            return { name: 'example' }
        });

        it('passes the context to each meta-question parameter', async () => {
            const question = the `#actor sends ${ Question.formattedValue() } and ${ Question.value() }`
                .of(examplePayload);

            const toString      = question.toString();
            const description   = await question.describedBy(actor);
            const answer        = await actor.answer(question);

            expect(toString).to.equal(`#actor sends formatted value and value of payload`);
            expect(description).to.equal(`Tess sends formatted value and value of payload`);
            expect(answer).to.equal(`#actor sends { name: "example" } and payload`);
        });

        it('passes the context to each meta-question parameter when used as a description of an activity', async () => {
            const task = Task.where(the `#actor sends ${ Question.formattedValue() } and ${ Question.value() }`
                .of(examplePayload))

            const toString      = task.toString();
            const description   = await task.describedBy(actor);

            expect(toString).to.equal(`#actor sends formatted value and value of payload`);
            expect(description).to.equal(`Tess sends { name: "example" } and payload`);
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
            { description: 'plain object',          value: { name: { first: 'Jan', last: 'Molak' } },       expectedAnswer: `#actor enters { name: { first: "Jan", last: "Molak" } }`,       expectedDescription: `Tess enters { name: { first: "Jan", last: "Molak" } }`,        expectedToString: `#actor enters { name: { first: "Jan", last: "Molak" } }`,      },
            { description: 'Date',                  value: new Date('1995-12-17T03:24:00.000Z'),            expectedAnswer: `#actor enters Date(1995-12-17T03:24:00.000Z)`,                  expectedDescription: `Tess enters Date(1995-12-17T03:24:00.000Z)`,                   expectedToString: `#actor enters Date(1995-12-17T03:24:00.000Z)`,                 },
            { description: 'Array',                 value: [ 'hello', 123 ],                                expectedAnswer: `#actor enters [ "hello", 123 ]`,                                expectedDescription: `Tess enters [ "hello", 123 ]`,                                 expectedToString: `#actor enters [ "hello", 123 ]`,                               },
            { description: 'Map',                   value: new Map([['key', 'value']]),                     expectedAnswer: `#actor enters Map({ key: "value" })`,                           expectedDescription: `Tess enters Map({ key: "value" })`,                            expectedToString: `#actor enters Map({ key: "value" })`,                          },
            { description: 'Set',                   value: new Set([ 1, 2, 3 ]),                            expectedAnswer: `#actor enters Set([ 1, 2, 3 ])`,                                expectedDescription: `Tess enters Set([ 1, 2, 3 ])`,                                 expectedToString: `#actor enters Set([ 1, 2, 3 ])`,                               },
            { description: 'RegExp',                value: /[Hh]ello/g,                                     expectedAnswer: `#actor enters /[Hh]ello/g`,                                     expectedDescription: `Tess enters /[Hh]ello/g`,                                      expectedToString: `#actor enters /[Hh]ello/g`,                                    },
            { description: 'custom toString',       value: { toString: () => 'example' } as any,            expectedAnswer: `#actor enters example`,                                         expectedDescription: `Tess enters example`,                                          expectedToString: `#actor enters example`,                                        },
            { description: 'instance no toString',  value: new Person('Jan', 'Molak'),                      expectedAnswer: `#actor enters Person({ firstName: "Jan", lastName: "Molak" })`, expectedDescription: `Tess enters Person({ firstName: "Jan", lastName: "Molak" })`,  expectedToString: `#actor enters Person({ firstName: "Jan", lastName: "Molak" })` },
        ];

        given(examples).
        it('resolves to a value with interpolated parameters', async ({ value, expectedAnswer, expectedDescription, expectedToString }) => {
            const question = the`#actor enters ${ value }`;

            const description = await question.describedBy(actor);
            const answer      = await actor.answer(question);
            const toString    = question.toString();

            expect(answer).to.equal(expectedAnswer);
            expect(description).to.equal(expectedDescription);
            expect(toString).to.equal(expectedToString);
        });
    });

    describe('with masked values', () => {

        it('does not reveal the masked value in the description', async () => {
            const question = the`#actor enters ${ Masked.valueOf('SuperSecretP@ssword!') }`;

            const description = await question.describedBy(actor);
            const answer      = await actor.answer(question);
            const toString    = question.toString();

            expect(answer).to.equal('#actor enters [a masked value]');
            expect(description).to.equal('Tess enters [a masked value]');
            expect(toString).to.equal('#actor enters [a masked value]');
        });

    });

    describe('configuration', () => {

        it ('can be configured to trim the description to a desired maxLength', async () => {
            const value                 = new Error('example');
            const question              = the({ maxLength: 60 }) `#actor enters ${ value }`;

            const expectedAnswer        = `#actor enters Error({ message: "example", stack: "Error: example     at Context... })`;
            const expectedToString      = `#actor enters Error({ message: "example", stack: "Error: example     at Context... })`;
            const expectedDescription   = `Tess enters Error({ message: "example", stack: "Error: example     at Context... })`;

            const description = await question.describedBy(actor);
            const answer      = await actor.answer(question);
            const toString    = question.toString();

            expect(answer).to.equal(expectedAnswer);
            expect(description).to.equal(expectedDescription);
            expect(toString).to.equal(expectedToString);
        })
    });

    it('can have the default description overridden', async () => {
        const question = the`/products/${ 1 }/attributes/${ Promise.resolve(2) }`
            .describedAs('/products/:productId/attributes/:attributeId');

        const description = await question.describedBy(actor);
        const answer      = await actor.answer(question);
        const toString    = question.toString();

        expect(answer).to.equal(`/products/1/attributes/2`);
        expect(description).to.equal('/products/:productId/attributes/:attributeId');
        expect(toString).to.equal('/products/:productId/attributes/:attributeId');
    });
});