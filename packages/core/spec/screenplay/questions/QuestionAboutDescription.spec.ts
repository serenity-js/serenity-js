/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null */
import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { actorCalled } from '../../../src';
import { Question } from '../../../src/screenplay/Question';
import { expect } from '../../expect';

describe('Question', () => {

    const Quentin = actorCalled('Quentin');

    const p = <T>(value: T) =>
        Promise.resolve(value);

    const q = <T>(subject: string, value: T) =>
        Question.about(subject, actor_ => value);

    describe('description()', () => {

        describe('creates a meta-question that', () => {

            given([
                {
                    description: 'string',
                    input: 'value',
                    expected: '"value"'
                },
                {
                    description: 'number',
                    input: 42,
                    expected: '42'
                },
                {
                    description: 'Promise',
                    input: p('value'),
                    expected: '"value"'
                },
            ]).
            it('resolves to the value of the given primitive Answerable', async ({ input, expected }) => {
                const question  = Question.description().of(input);
                const answer    = await Quentin.answer(question);

                expect(answer).to.equal(expected);
            });

            it('resolves to the description of the given Question', async () => {
                const input = q('some description', 'returned value');
                const expected = 'some description';

                const question  = Question.description().of(input);
                const answer    = await Quentin.answer(question);

                expect(answer).to.equal(expected);
            });

            given([
                {
                    description: 'string',
                    input: 'input',
                    expected: '"input"'
                },
                {
                    description: 'number',
                    input: 42,
                    expected: '42'
                },
                {
                    description: 'Promise',
                    input: Promise.resolve('input'),
                    expected: '"input"'
                },
                {
                    description: 'Question',
                    input: Question.about('some input', actor => 'input'),
                    expected: '"input"'
                },
            ]).
            it('can be chained with Question.value()', async ({ input, expected }) => {
                const question  = Question.description().of(Question.value()).of(input);
                const answer    = await Quentin.answer(question);

                expect(answer).to.equal(expected);
            })
        });
    });
});
