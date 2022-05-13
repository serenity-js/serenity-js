import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled, Dictionary, LogicError, Question, QuestionAdapter } from '../../../src';
import { expect } from '../../expect';

describe('Dictionary', () => {

    const actor = actorCalled('Daisy');

    given([
        { description: 'empty object',  input: { }                              },
        { description: 'flat object',   input: { key: 'value' }                 },
        { description: 'nested object', input: { key_0: { key_1: 'value' } }    },
    ]).
    it('provides a wrapper around Record<string, unknown>', async ({ input }) => {
        const dictionary = Dictionary.of(input);

        const answer = await actor.answer(dictionary);

        expect(answer).to.deep.equal(input);
    });

    it(`produces a QuestionAdapter that makes it easier to access its fields`, async () => {
        const dictionary = Dictionary.of(q(p({ key_0: { key_1: 'value' } })));

        const answer = await actor.answer(dictionary.key_0.key_1);

        expect(answer).to.deep.equal('value');
    });

    it(`can wrap other dictionaries`, async () => {
        const dictionary_0 = Dictionary.of(q(p({ key_0: 'value_0_0', key_1: 'value_0_1' })))
        const dictionary_1 = Dictionary.of(q(p({ key_1: 'value_1_1' })))

        const dictionary = Dictionary.of(dictionary_0, dictionary_1);

        const answer = await actor.answer(dictionary.key_1);

        expect(answer).to.deep.equal('value_1_1');
    });

    describe('when merging', () => {

        it('combines several objects into one', async () => {

            const input_0 = { key_0: 'value_0' };
            const input_1 = { key_1: 'value_1' };

            const expected = {
                key_0: 'value_0',
                key_1: 'value_1',
            };

            const dictionary: QuestionAdapter< { key_0: string, key_1?: string } > =
                Dictionary.of< { key_0: string, key_1?: string } >(input_0, input_1);

            const answer = await actor.answer(dictionary);

            expect(answer).to.deep.equal(expected);
        });

        it('ensures the properties of the latter objects override the properties of any former objects', async () => {

            const input_0 = { key_0: 'value_0', key_1: 'value_0', key_2: 'value_0' };
            const input_1 = { key_1: 'value_1', key_2: 'value_2' };
            const input_2 = { key_2: 'value_2' };

            const expected = {
                key_0: 'value_0',
                key_1: 'value_1',
                key_2: 'value_2',
            };

            const dictionary: QuestionAdapter< { key_0: string, key_1: string, key_2: string } > =
                Dictionary.of< { key_0: string, key_1: string, key_2: string } >(
                    input_0,
                    input_1,
                    input_2,
                );

            const answer = await actor.answer(dictionary);

            expect(answer).to.deep.equal(expected);
        });

        it('ensures that a property explicitly set to `undefined` unsets a previously set property, but a missing property does not (same as Object.assign)', async () => {

            const input_0 = { key_0: 'value_0', key_1: 'value_0', key_2: 'value_0' };
            const input_1 = { key_1: undefined, key_2: 'value_2' };
            const input_2 = { key_2: undefined };

            const expected = {
                key_0: 'value_0',
                key_1: undefined,
                key_2: undefined,
            };

            const dictionary: QuestionAdapter< { key_0: string, key_1: string, key_2: string } > =
                Dictionary.of< { key_0: string, key_1: string, key_2: string } >(
                    input_0,
                    input_1,
                    input_2,
                );

            const answer = await actor.answer(dictionary);

            expect(answer).to.deep.equal(expected);
        });
    });

    describe('when working with Answerable<T>', () => {

        it('should be able to merge regular Answerables', async () => {
            const input_0 = q(p({ key_0: 'value_0', key_1: 'value_0', key_2: 'value_0' }));
            const input_1 = q({ key_1: 'value_1', key_2: 'value_2' });
            const input_2 = p({ key_2: 'value_2' });

            const expected = {
                key_0: 'value_0',
                key_1: 'value_1',
                key_2: 'value_2',
            };

            const dictionary: QuestionAdapter< { key_0: string, key_1: string, key_2: string } > =
                Dictionary.of< { key_0: string, key_1: string, key_2: string } >(
                    input_0,
                    input_1,
                    input_2,
                );

            const answer = await actor.answer(dictionary);

            expect(answer).to.deep.equal(expected);
        });

        describe('recursively merging regular objects with nested Answerable<T>', () => {

            it('should work for simple Record<string, Answerable<unknown>>', async () => {
                const input = { key: q(p('value')) };

                const expected = { key: 'value' };

                const dictionary = Dictionary.of(input);

                const answer = await actor.answer(dictionary);

                expect(answer).to.deep.equal(expected);
            });

            it('should work for nested Record<string, Record<string, Answerable<unknown>>>', async () => {
                const input = { key_0: { key_1: q(p('value')) } };

                const expected = { key_0: { key_1: 'value' } };

                const dictionary = Dictionary.of(input);

                const answer = await actor.answer(dictionary);

                expect(answer).to.deep.equal(expected);
            });

            it('should work for Record with Array<Answerable<unknown>> values', async () => {
                const input = {
                    key: [
                        q(p('value_0')),
                        q(p('value_1')),
                    ]
                };

                const expected = {
                    key: [
                        'value_0',
                        'value_1',
                    ]
                };

                const dictionary = Dictionary.of(input);

                const answer = await actor.answer(dictionary);

                expect(answer).to.deep.equal(expected);
            });

            it('should work for Record with Array<Record<string, Answerable>> values', async () => {
                const input = {
                    key_0: [
                        { key_1_0: q(p('value_1_0')) },
                        { key_1_1: q(p('value_1_1')) },
                    ]
                };

                const expected = {
                    key_0: [
                        { key_1_0: 'value_1_0' },
                        { key_1_1: 'value_1_1' },
                    ]
                };

                const dictionary = Dictionary.of(input);

                const answer = await actor.answer(dictionary);

                expect(answer).to.deep.equal(expected);
            });

            it(`should complain if it can't fully resolve a given object in 100 recursive calls`, async () => {

                const input_0 = { references: [] };

                const input_1 = { references: [] };
                const input_2 = { references: [] };

                input_1.references.push(q(p(input_2)));
                input_2.references.push(q(p(input_1)));

                const dictionary = Dictionary.of(input_0, input_1, input_2);

                await expect(actor.answer(dictionary))
                    .to.be.rejectedWith(LogicError, `Dictionary has reached the limit of 100 recursive calls while trying to resolve argument 1. Could it contain cyclic references?`);
            });
        });
    });
});

function p<T>(value: T): Promise<T> {
    return Promise.resolve(value);
}

function q<T>(value: T): QuestionAdapter<Awaited<T>> {
    return Question.about('some value', actor => value);
}
