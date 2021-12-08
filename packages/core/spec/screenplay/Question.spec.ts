/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null */
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { actorCalled } from '../../src';
import { Actor, Question } from '../../src/screenplay';
import { expect } from '../expect';

/** @test {Question} */
describe('Question', () => {

    const Quentin = actorCalled('Quentin');

    const p = <T>(value: T) =>
        Promise.resolve(value);

    const q = <T>(subject: string, value: T) =>
        Question.about(subject, actor => value);

    describe('about()', () => {

        describe('creates a question which', () => {

            describe('body', () => {

                /** @test {Question.about} */
                it('returns a static value', () => {
                    const Name = () =>
                        Question.about('a name', (actor: Actor) => actor.name);

                    const answer = Name().answeredBy(actorCalled('Jacques'));

                    expect(answer).to.equal('Jacques');
                });

                /** @test {Question.about} */
                it('returns a Promise of a value', () => {
                    const Name = () =>
                        Question.about('a name', (actor: Actor) => Promise.resolve(actor.name));

                    const answer = Name().answeredBy(actorCalled('Jill'));

                    return expect(answer).to.eventually.equal('Jill');
                });
            });

            describe('subject', () => {
                /** @test {Question#toString} */
                it('can be defined at the same time as the question body', () => {
                    const ExampleQuestion = () =>
                        Question.about('some subject', (actor: Actor) => 'some return value');

                    expect(ExampleQuestion().toString()).to.equal('some subject');
                });

                /** @test {Question#describedAs} */
                it('can be defined at a later stage and override the default one', () => {
                    const ExampleQuestion = () =>
                        Question.about('some subject', (actor: Actor) => 'some return value');

                    expect(ExampleQuestion().describedAs('a different subject').toString())
                        .to.equal('a different subject');
                });

                /** @test {Question.about} */
                it('is returned when the question is used in a template literal', () => {
                    const ExampleQuestion = () =>
                        Question.about('some subject', (actor: Actor) => 'some return value');

                    const result = `question about "${ ExampleQuestion() }"`

                    expect(result).to.equal('question about "some subject"');
                });

                /** @test {Question.about} */
                it('is returned when the question is used in string concatenation', () => {
                    const ExampleQuestion = () =>
                        Question.about('some subject', (actor: Actor) => 'some return value');

                    const result = 'question about ' + ExampleQuestion();

                    expect(result).to.equal('question about some subject');
                });

                /** @test {Question#describedAs} */
                it('can be overridden at any point in the proxied method chain', async () => {

                    const Alex = actorCalled('Alex');

                    const Value = <V>(value: V) =>
                        Question.about<Promise<V>>('a value', (actor: Actor) =>
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
                    expect(subject).to.equal('some answer as Number');
                });

                it('can be mapped from a sync value to another type', async () => {
                    const input     = q('some answer', '42');
                    const question  = input.as(Number);

                    const result    = await question.answeredBy(Quentin);
                    const subject   = question.toString();

                    expect(result).to.deep.equal(42);
                    expect(subject).to.equal('some answer as Number');
                });

                it('can be mapped to another Array type', async () => {
                    const input: Question<Promise<string[]>> = q('list of strings', p([ '1', '2', '3' ]));

                    const question: Question<Promise<number[]>> = input.as(function numbers(items: string[]) {
                        return items.map(Number);
                    });

                    const result    = await question.answeredBy(Quentin);
                    const subject   = question.toString();

                    expect(result).to.deep.equal([ 1, 2, 3 ]);
                    expect(subject).to.equal('list of strings as numbers');
                });
            });
        });
    });

    describe('isAQuestion', () => {

        given([
            { isAQuestion: false, value: null                                                           },
            { isAQuestion: false, value: false                                                          },
            { isAQuestion: false, value: void 0                                                         },
            { isAQuestion: false, value: ''                                                             },
            { isAQuestion: false, value: {}                                                             },
            { isAQuestion: false, value: 42                                                             },
            { isAQuestion: false, value: () => void 0                                                   },
            { isAQuestion: true,  value: Question.about('something', actor => void 0)                   },
            { isAQuestion: true,  value: Question.about('proxied question', actor => 'result').length   },
        ]).
        it('recognises if something is a question', ({ value, isAQuestion }) => {
            expect(Question.isAQuestion(value)).to.equal(isAQuestion);
        });
    });
});
