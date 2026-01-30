
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import type { Answerable, QuestionAdapter, RecursivelyAnswered } from '../../src';
import { actorCalled, LogicError } from '../../src';
import type { Actor, WithAnswerableProperties } from '../../src/screenplay';
import { Question } from '../../src/screenplay';
import { expect } from '../expect';

describe('Question', () => {

    const Quentin = actorCalled('Quentin');

    const p = <T>(value: T) =>
        Promise.resolve(value);

    const q = <T>(subject: string, value: T) =>
        Question.about(subject, actor => value);

    describe('about()', () => {

        it('correctly detects its invocation location', () => {
            const question = () => Question.about('subject', actor_ => 42);
            const location = question().instantiationLocation();

            expect(location.path.basename()).to.equal('Question.spec.ts');
            expect(location.line).to.equal(25);
            expect(location.column).to.equal(30);
        });

        describe('creates a question which', () => {

            describe('body', () => {

                it('returns a static value', async () => {
                    const Name = () =>
                        Question.about('a name', (actor: Actor) => actor.name);

                    const answer = await actorCalled('Jacques').answer(Name());

                    expect(answer).to.equal('Jacques');
                });

                it('returns a Promise of a value', () => {
                    const Name = () =>
                        Question.about('a name', (actor: Actor) => Promise.resolve(actor.name));

                    const answer = Name().answeredBy(actorCalled('Jill'));

                    return expect(answer).to.eventually.equal('Jill');
                });
            });

            describe('subject', () => {

                const newDescription = 'a different subject';

                it('can be defined at the same time as the question body', () => {
                    const ExampleQuestion = () =>
                        Question.about('some subject', (actor: Actor) => 'some return value');

                    expect(ExampleQuestion().toString()).to.equal('some subject');
                });

                it('can be defined at a later stage and override the default one', () => {
                    const ExampleQuestion = () =>
                        Question.about('some subject', (actor: Actor) => 'some return value');

                    expect(ExampleQuestion().describedAs('a different subject').toString())
                        .to.equal('a different subject');
                });

                given([
                    { description: 'string',            subject: newDescription,                  expectedToString: newDescription },
                    { description: 'Promise',           subject: p(newDescription),               expectedToString: 'Promise' },
                    { description: 'Question',          subject: q('subject', newDescription),    expectedToString: 'subject' },
                    { description: 'Question<Promise>', subject: q('subject', p(newDescription)), expectedToString: 'subject' },
                ]).
                it('can be described using an Answerable', async ({ subject, expectedToString }) => {
                    const ExampleQuestion = () =>
                        Question.about(subject, actor_ => 'some return value');

                    expect(ExampleQuestion().toString()).to.equal(expectedToString);
                    expect(await ExampleQuestion().describedBy(Quentin)).to.equal(newDescription);
                });

                it('can be described using a MetaQuestion', async () => {
                    const ExampleQuestion = () =>
                        Question.about('original subject', actor_ => 'some return value')
                            .describedAs(Question.formattedValue());

                    expect(ExampleQuestion().toString()).to.equal(`original subject`);

                    const description = await ExampleQuestion().describedBy(Quentin);
                    expect(description).to.equal('"some return value"');
                });

                it('is returned when the question is used in a template literal', () => {
                    const ExampleQuestion = () =>
                        Question.about('some subject', (actor: Actor) => 'some return value');

                    const result = `question about "${ ExampleQuestion() }"`

                    expect(result).to.equal('question about "some subject"');
                });

                it('is returned when the question is used in string concatenation', () => {
                    const ExampleQuestion = () =>
                        Question.about('some subject', (actor: Actor) => 'some return value');

                    const result = 'question about ' + ExampleQuestion();

                    expect(result).to.equal('question about some subject');
                });

                it('can be overridden at any point in the proxied method chain', async () => {

                    const Alex = actorCalled('Alex');

                    const Value = <V>(value: V) =>
                        Question.about<V>('a value', (actor: Actor) =>
                            Promise.resolve(value)
                        );

                    const start = Value(0);
                    const end   = Promise.resolve(5);

                    const question: Question<Promise<number>> =
                        Value('Hello World')
                            .describedAs('greeting')
                            .slice(start.describedAs('start index'), end)
                            .toLocaleLowerCase(Value('en-GB').describedAs('locale'))
                            .length

                    expect(await question.answeredBy(Alex)).to.equal(5);

                    expect(question.toString())
                        .to.equal('<<greeting>>.slice(<<start index>>, <<Promise>>).toLocaleLowerCase(<<locale>>).length');
                });
            });

            describe('answer', () => {

                it('can be mapped from an async value to another type', async () => {
                    const input     = q('some answer', p('42'));
                    const question  = input.as(Number);

                    const result    = await question.answeredBy(Quentin);
                    const subject   = question.toString();

                    expect(result).to.deep.equal(42);
                    expect(subject).to.equal('<<some answer>>.as(Number)');
                });

                it('can be mapped from a sync value to another type', async () => {
                    const input     = q('some answer', '42');
                    const question  = input.as(Number);

                    const result    = await question.answeredBy(Quentin);
                    const subject   = question.toString();

                    expect(result).to.deep.equal(42);
                    expect(subject).to.equal('<<some answer>>.as(Number)');
                });

                it('can be mapped to another Array type', async () => {
                    const input: QuestionAdapter<string[]> = q('list of strings', p([ '1', '2', '3' ]));

                    const question: Question<Promise<number[]>> = input.as(function numbers(items: string[]) {
                        return items.map(Number);
                    });

                    const result    = await question.answeredBy(Quentin);
                    const subject   = question.toString();

                    expect(result).to.deep.equal([ 1, 2, 3 ]);
                    expect(subject).to.equal('<<list of strings>>.as(numbers)');
                });
            });

            it('allows for proxying of the underlying methods', async () => {
                const v = <V>(value: V) =>
                    Question.about<V>('a value', (actor: Actor) =>
                        Promise.resolve(value)
                    );

                const question = Question.about('subject', actor_ => Promise.resolve(' £1,000,000.75 '))
                    .trimStart()
                    .trimEnd()
                    .replace('£', '')
                    .replaceAll(v(','), '')
                    .as(Number)
                    .describedAs('price');

                expect(question.toString()).to.equal('price');

                const result = await question.answeredBy(Quentin);

                expect(result).to.equal(1_000_000.75);
            })
        });
    });

    describe('isAQuestion', () => {

        given([
            { expected: false, value: null                                                           },
            { expected: false, value: false                                                          },
            { expected: false, value: void 0                                                         },
            { expected: false, value: ''                                                             },
            { expected: false, value: {}                                                             },
            { expected: false, value: 42                                                             },
            { expected: false, value: () => void 0                                                   },
            { expected: true,  value: Question.about('something', actor => void 0)                   },
            { expected: true,  value: Question.about('proxied question', actor => 'result').length   },
        ]).
        it('recognises if something is a question', ({ value, expected }) => {
            expect(Question.isAQuestion(value)).to.equal(expected);
        });
    });

    describe('isAMetaQuestion', () => {

        given([
            { expected: false, value: null                                                            },
            { expected: false, value: false                                                           },
            { expected: false, value: void 0                                                          },
            { expected: false, value: ''                                                              },
            { expected: false, value: {}                                                              },
            { expected: false, value: 42                                                              },
            { expected: false, value: () => void 0                                                    },
            { expected: false, value: Question.about('something', actor => void 0)                    },
            { expected: false, value: Question.about('proxied question', actor => 'result').length    },
            { expected: true,  value: Question.about(
                'meta-value',
                actor => '',
                context => Question.about('context', actor => '')
            ) },
            { expected: true,  value: Question.about(
                'chainable meta-value',
                actor => '',
                context => Question.about(
                    'context',
                    actor => '',
                    nestedContext => Question.about(
                        'nested context',
                        actor => ''
                    )
                )
            ) },
        ]).
        it('recognises if something is a question', ({ value, expected }) => {
            expect(Question.isAMetaQuestion(value)).to.equal(expected);
        });
    });

    const emptyObject = {};

    describe('fromObject()', () => {

        describe('creates a QuestionAdapter which', () => {

            given([
                { description: 'empty object',  input: { }                              },
                { description: 'flat object',   input: { key: 'value' }                 },
                { description: 'nested object', input: { key_0: { key_1: 'value' } }    },
            ]).
            it('resolves to the value itself for plain JavaScript objects', async ({ input }) => {

                const question  = Question.fromObject(input);
                const answer    = await Quentin.answer(question);

                expect(answer).to.deep.equal(input);
            });

            given([
                { description: 'value',                     input: { key: 'value' }                     },
                { description: 'Promise<value>',            input: p({ key: 'value' })                  },
                { description: 'Question<value>',           input: q('example', { key: 'value' })       },
                { description: 'Question<Promise<value>>',  input: q('example', p({ key: 'value' }))    },
            ]).
            it(`can wrap any Answerable`, async ({ input }) => {

                const question = Question.fromObject(input);
                const answer = await Quentin.answer(question.key);

                expect(answer).to.equal('value');
            });

            describe('when used with null-ish values', () => {

                it(`resolves to undefined for undefined`, async () => {
                    const question: QuestionAdapter<undefined> = Question.fromObject(undefined);
                    const answer = await Quentin.answer(question);

                    expect(answer).to.equal(undefined);
                });

                it(`resolves to null for null`, async () => {
                    const question: QuestionAdapter<null> = Question.fromObject(null);
                    const answer = await Quentin.answer(question);

                    expect(answer).to.equal(null);
                });
            });

            describe('when used with nested data structures', () => {

                it(`is symmetric`, () => {
                    interface Example {
                        nested: string;
                    }

                    const e1: Example = { nested: 'example' };
                    const e2: RecursivelyAnswered<WithAnswerableProperties<Example>> = { nested: 'example' };

                    expect(e1).to.deep.equal(e2);
                })

                it(`recursively resolves nested objects`, async () => {
                    interface Example {
                        nested: string;
                    }

                    const input: Answerable<Example> = p({
                        nested: 'example',
                    })

                    const question: QuestionAdapter<Example> = Question.fromObject<Example>(input);
                    const answer = await Quentin.answer(question);

                    expect(answer).to.deep.equal({
                        nested: 'example',
                    });
                })

                it(`recursively resolves nested promises`, async () => {
                    interface Example {
                        nested: { promised: { key: string } }
                    }

                    const input: Answerable<WithAnswerableProperties<Example>> = p({
                        nested: {
                            // promised: p({ key: 'example'})
                            // promised: { key: 'example'}
                            promised: { key: p('example') }
                        }
                    })

                    const question: QuestionAdapter<Example> = Question.fromObject<Example>(input);
                    const answer = await Quentin.answer(question);

                    expect(answer).to.deep.equal({
                        nested: {
                            promised: { key: 'example' }
                        }
                    });
                });

                it(`recursively resolves nested questions`, async () => {
                    interface Example {
                        nested: {
                            promised: string
                        }
                    }

                    const input: Answerable<WithAnswerableProperties<Example>> = p({
                        nested: {
                            promised: q('question', p('example'))
                        }
                    })

                    const question: QuestionAdapter<Example> = Question.fromObject<Example>(input);
                    const answer = await Quentin.answer(question);

                    expect(answer).to.deep.equal({
                        nested: {
                            promised: 'example'
                        }
                    });
                });
            });

            it(`recursively resolves arrays of promises`, async () => {
                interface Example {
                    nested: Array<number>
                }

                const input: Answerable<WithAnswerableProperties<Example>> = p({
                    nested: [ p(1), p(2) ]
                })

                const question: QuestionAdapter<Example> = Question.fromObject<Example>(input);
                const answer = await Quentin.answer(question);

                expect(answer).to.deep.equal({
                    nested: [ 1, 2 ]
                });
            });

            it(`recursively resolves arrays of questions`, async () => {

                interface Example {
                    nested: Array<number>
                }

                const input: Promise<WithAnswerableProperties<Example>> = p({
                    nested: [ q('first', p(1)), q('second', p(2)) ]
                })

                const question: QuestionAdapter<Example> = Question.fromObject<Example>(input);
                const answer = await Quentin.answer(question);

                expect(answer).to.deep.equal({
                    nested: [ 1, 2 ]
                });
            });

            it(`makes it easy to access fields and methods of the wrapped value`, async () => {
                const questionAdapter = Question.fromObject(p({ key_0: { key_1: 'value' } }));

                const answer = await Quentin.answer(questionAdapter.key_0.key_1.toLocaleUpperCase());

                expect(answer).to.deep.equal('VALUE');
            });

            it('provides a human-readable description', () => {
                const description = Question.fromObject(emptyObject).toString();
                expect(description).to.equal('value');
            });

            it('can have its description overridden', () => {
                const description = Question.fromObject(emptyObject).describedAs('age').toString();
                expect(description).to.equal('age');
            });
        });

        describe('when used to merge objects', () => {

            it('creates a new object, overriding the properties of the source object, without mutating the original', async () => {

                const original = { key_0: 'value_0', key_1: '' };
                const input_0  = { key_0: 'value_0', key_1: '' };
                const input_1  = { key_1: 'value_1' };

                const expected = {
                    key_0: 'value_0',
                    key_1: 'value_1',
                };

                const result = Question.fromObject(input_0, input_1);

                const answer = await Quentin.answer(result);

                expect(answer).to.deep.equal(expected);
                expect(input_0).to.deep.equal(original);
            });

            it('ensures the properties of the latter objects override the properties of any former objects', async () => {

                interface Example {
                    key_0: string;
                    key_1: string;
                    key_2: string;
                }

                const input_0 = { key_0: 'value_0', key_1: 'value_0', key_2: 'value_0' };
                const input_1 = { key_1: 'value_1', key_2: 'value_2' };
                const input_2 = { key_2: 'value_2' };

                const expected = {
                    key_0: 'value_0',
                    key_1: 'value_1',
                    key_2: 'value_2',
                };

                const result: QuestionAdapter<Example> =
                    Question.fromObject(
                        input_0,
                        input_1,
                        input_2,
                    );

                const answer = await Quentin.answer(result);

                expect(answer).to.deep.equal(expected);
            });

            it('ensures that a property explicitly set to `undefined` unsets a previously set property, but a missing property does not (same as Object.assign)', async () => {

                interface Example {
                    key_0: string;
                    key_1: string;
                    key_2: string;
                }

                const input_0 = { key_0: 'value_0', key_1: 'value_0', key_2: 'value_0' };
                const input_1 = { key_1: undefined, key_2: 'value_2' };
                const input_2 = { key_2: undefined };

                const expected = {
                    key_0: 'value_0',
                    key_1: undefined,
                    key_2: undefined,
                };

                const result: QuestionAdapter<Example> =
                    Question.fromObject(
                        input_0,
                        input_1,
                        input_2,
                    );

                const answer = await Quentin.answer(result);

                expect(answer).to.deep.equal(expected);
            });

            it(`should complain if it can't fully resolve a given object in 100 recursive calls`, async () => {

                const input_0 = { references: [] };

                const input_1 = { references: [] };
                const input_2 = { references: [] };

                input_1.references.push(q('question', p(input_2)));
                input_2.references.push(q('question', p(input_1)));

                const result = Question.fromObject(input_0, input_1, input_2);

                await expect(Quentin.answer(result))
                    .to.be.rejectedWith(LogicError, `Question.fromObject() has reached the limit of 100 recursive calls while trying to resolve argument 1. Could it contain cyclic references?`);
            });

            describe('when working with Answerable<T>', () => {

                it('should be able to merge regular Answerables', async () => {

                    interface Example {
                        key_0: string;
                        key_1: string;
                        key_2: string;
                    }

                    const input_0 = q('question', p({ key_0: 'value_0', key_1: 'value_0', key_2: 'value_0' }));
                    const input_1 = q('question', { key_1: 'value_1', key_2: 'value_2' });
                    const input_2 = p({ key_2: 'value_2' });

                    const expected = {
                        key_0: 'value_0',
                        key_1: 'value_1',
                        key_2: 'value_2',
                    };

                    const result: QuestionAdapter<Example> =
                        Question.fromObject<Example>(
                            input_0,
                            input_1,
                            input_2,
                        );

                    const answer = await Quentin.answer(result);

                    expect(answer).to.deep.equal(expected);
                });
            });
        });
    });

    describe('fromArray()', () => {

        describe('creates a QuestionAdapter which', () => {

            given([
                { description: 'empty array' ,  input: [ ]         },
                { description: 'flat array',    input: [ 'value' ] },
            ]).
            it('resolves to the value itself for plain JavaScript arrays', async ({ input }) => {

                const question  = Question.fromArray(input);
                const answer    = await Quentin.answer(question);

                expect(answer).to.deep.equal(input);
            });

            given([
                { description: 'empty array' ,  input: [ ],         expectedToString: '[ ]',         expectedDescription: '[ ]'         },
                { description: 'flat array',    input: [ 'value' ], expectedToString: '[ "value" ]', expectedDescription: '[ "value" ]' },
            ]).
            it('is described using array values', async ({ input, expectedToString, expectedDescription }) => {

                const question  = Question.fromArray(input);

                const description = await question.describedBy(Quentin);
                const toString    = question.toString();

                expect(description).to.equal(expectedDescription);
                expect(toString).to.equal(expectedToString);
            });

            given([
                { description: 'empty array' ,  input: [ ],         expectedToString: '[ ]',         expectedDescription: '[ ]'       },
                { description: 'flat array',    input: [ 'value' ], expectedToString: '[ "value" ]', expectedDescription: '[ "v..." ]' },
            ]).
            it('supports configuring the descriptions of items individually', async ({ input, expectedToString, expectedDescription }) => {

                const question  = Question.fromArray(input, { maxLength: 4 });

                const description = await question.describedBy(Quentin);
                const toString    = question.toString();

                expect(description).to.equal(expectedDescription);
                expect(toString).to.equal(expectedToString);
            });

            given([
                { description: 'empty array' ,  input: [ ],         expectedToString: '[ ]',         expectedDescription: '[ ]'       },
                { description: 'flat array',    input: [ 'value' ], expectedToString: '[ "value" ]', expectedDescription: '[ "va... ]' },
            ]).
            it('supports configuring the description of the output as a whole', async ({ input, expectedToString, expectedDescription }) => {

                const question  = Question.fromArray(input).describedAs(Question.formattedValue({  maxLength: 6 }));

                const description = await question.describedBy(Quentin);
                const toString    = question.toString();

                expect(description).to.equal(expectedDescription);
                expect(toString).to.equal(expectedToString);
            });
        });
    });
});
