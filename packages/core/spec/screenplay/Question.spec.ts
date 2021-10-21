/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null */
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { actorCalled, LogicError } from '../../src';
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
            });

            describe('acts as a proxy that', () => {

                describe('wraps any field of the underlying answer in another question which', () => {

                    const Name = () =>
                        Question.about(`name`, (actor: Actor) =>
                            actor.name
                        );

                    describe('subject', () => {

                        /** @test {Question.about} */
                        it('is generated automatically based on the name of the field', () => {
                            const length: Question<Promise<number>> = Name().length;

                            const result = length.toString();

                            expect(result).to.equal(`<<name>>.length`);
                        });

                        /** @test {Question.about} */
                        it('can be used in string template literals', () => {
                            const length: Question<Promise<number>> = Name().length;

                            const result = `question: ${ length }`;

                            expect(result).to.equal(`question: <<name>>.length`);
                        });

                        /** @test {Question.about} */
                        it('can be concatenated with other strings', () => {
                            const length: Question<Promise<number>> = Name().length;

                            const result = 'question: ' + length

                            expect(result).to.equal(`question: <<name>>.length`);
                        });
                    });

                    describe('when answered', () => {

                        const Value = <T>(value: T) =>
                            Question.about(`some value`, (actor: Actor) =>
                                value
                            );

                        /** @test {Question.about} */
                        it('resolves to the value of the underlying answer', async () => {
                            const length: Question<Promise<number>> = Name().length;

                            const result: number = await length.answeredBy(Quentin);

                            expect(result).to.equal(7);
                        });

                        /** @test {Question.about} */
                        it(`resolves to undefined if the underlying field is undefined`, async () => {
                            interface Person {
                                firstName: string;
                                lastName?: string;
                            }

                            const person: Person = { firstName: 'Cher' };
                            const lastName: Question<Promise<string>> = Value(person).lastName;

                            const result: string = await lastName.answeredBy(Quentin);

                            expect(result).to.equal(undefined);
                        });

                        it(`can be mapped to another type`, async () => {
                            const question: Question<Promise<string>> = q('example', p({ name: 'Hello42' }))
                                .name
                                .slice(5, 7);

                            const extracted: Question<Promise<number>> = question.as(Number);

                            const result: number = await extracted.answeredBy(Quentin);

                            expect(extracted.toString()).to.equal('<<example>>.name.slice(5, 7) as <<Number>>');
                            expect(result).to.equal(42);
                        })
                    });
                });

                describe('wraps any method of the underlying answer in a proxy function that', () => {
                    const Name = () =>
                        Question.about(`name`, (actor: Actor) =>
                            actor.name
                        );

                    describe('produces a question which', () => {

                        describe('subject', () => {

                            /** @test {Question.about} */
                            it('is generated automatically based on the name of the method', () => {
                                const lowerCase: Question<Promise<string>> = Name().toLocaleLowerCase();

                                const result = lowerCase.toString();

                                expect(result).to.equal(`<<name>>.toLocaleLowerCase()`);
                            });

                            /** @test {Question.about} */
                            it('is generated automatically based on the name of the method and its arguments', () => {
                                const start = (value: number) =>
                                    Question.about('start index', actor => value);

                                const end = (value: number) =>
                                    Question.about('end index', actor => value);

                                const slice: Question<Promise<string>> = Name()
                                    .slice(start(0), end(0))
                                    .toLocaleLowerCase([ 'en-GB', 'en-US' ]);

                                const result = slice.toString();

                                expect(result).to.equal(`<<name>>.slice(<<start index>>, <<end index>>).toLocaleLowerCase([ 'en-GB', 'en-US' ])`);
                            });

                            /** @test {Question.about} */
                            it('can be used in string template literals', () => {
                                const slice: Question<Promise<string>> = Name().slice(0, 5);

                                const result = `question: ${ slice }`;

                                expect(result).to.equal(`question: <<name>>.slice(0, 5)`);
                            });

                            /** @test {Question.about} */
                            it('can be concatenated with other strings', () => {
                                const slice: Question<Promise<string>> = Name().slice(0, 5);

                                const result = 'question: ' + slice;

                                expect(result).to.equal(`question: <<name>>.slice(0, 5)`);
                            });
                        });

                        describe('when answered', () => {

                            const Value = <T>(value: T) =>
                                Question.about(`some value`, (actor: Actor) =>
                                    value
                                );

                            /** @test {Question.about} */
                            it('resolves to the value of the underlying answer', async () => {
                                const chunk: Question<Promise<string>> = Name().slice(0, 3);

                                const result: string = await chunk.answeredBy(Quentin);

                                expect(result).to.equal('Que');
                            });

                            /** @test {Question.about} */
                            it(`resolves to undefined if the underlying field is undefined`, async () => {
                                interface Person {
                                    fullName(): string;
                                }

                                const person: Person = { fullName: () => void 0 };
                                const fullName: Question<Promise<string>> = Value(person).fullName();

                                const result: string = await fullName.answeredBy(Quentin);

                                expect(result).to.equal(undefined);
                            });
                        });
                    });

                    describe('when used with Arrays', () => {

                        describe(`resolves any "Answerable" arguments before they're passed to callback functions so that`, () => {

                            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
                            describe('Array.map', () => {

                                it('works with a sync callback', async () => {
                                    const question = q('list', p([ '1', '2', '3' ]))
                                        .map((value: string) => Number.parseInt(value, 10));

                                    const result = await question.answeredBy(Quentin)

                                    expect(result).to.deep.equal([ 1, 2, 3 ]);
                                    expect(question.toString()).to.equal('<<list>>.map(<<Function>>)');
                                });
                            });

                            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
                            describe('Array.reduce', () => {

                                it('works with a sync callback and async initial value', async () => {
                                    const question = q('list', p([ 1, 2, 3 ]))
                                        .reduce(
                                            (acc: number, current: number) => {
                                                return acc + current;
                                            }, q('initial value', p(0)));

                                    const result = await question.answeredBy(Quentin)

                                    expect(result).to.equal(6);
                                    expect(question.toString()).to.equal('<<list>>.reduce(<<Function>>, <<initial value>>)');
                                });

                                it('works with a sync callback and sync initial value', async () => {
                                    const question = q('list', p([ 1, 2, 3 ]))
                                        .reduce(
                                            (acc: number, current: number) => {
                                                return acc + current;
                                            }, 0);

                                    const result = await question.answeredBy(Quentin)

                                    expect(result).to.equal(6);
                                    expect(question.toString()).to.equal('<<list>>.reduce(<<Function>>, 0)');
                                });
                            });
                        });
                    });

                    it('automatically resolves any "Answerable" arguments passed to it', async () => {
                        const q = <T>(subject: string, returnValue: T) =>
                            Question.about(subject, actor => returnValue);

                        const p = <T>(returnValue: T) =>
                            Promise.resolve(returnValue);

                        const slice: Question<Promise<string>> = Name()
                            .slice(q('start index', p(0)), p(3));

                        const subject   = slice.toString();
                        const result    = await slice.answeredBy(Quentin);

                        expect(subject).to.equal(`<<name>>.slice(<<start index>>, <<Promise>>)`);
                        expect(result).to.equal(`Que`);
                    });
                });

                describe('enables chaining of', () => {

                    interface Address {
                        lines: string[];
                    }

                    interface Person {
                        firstName: string;
                        lastName: string;
                        fullName(): string;
                        address: Address;
                        lastKnownAddress(): Address;
                        siblings?: Person[]
                    }

                    const address: Address = {
                        lines: [
                            '17 Cherry Tree Lane',
                            'London',
                        ]
                    }

                    function siblings(): [ Person, Person ] {
                        const Jane: Person = {
                            firstName: 'Jane',
                            lastName: 'Banks',
                            fullName(): string {
                                return `${ this.firstName } ${ this.lastName }`;
                            },
                            lastKnownAddress(): Address {
                                return this.address
                            },
                            address,
                            siblings: [ ],
                        }

                        const Michael: Person = {
                            firstName: 'Michael',
                            lastName: 'Banks',
                            fullName(): string {
                                return `${ this.firstName } ${ this.lastName }`;
                            },
                            lastKnownAddress(): Address {
                                return this.address
                            },
                            address,
                            siblings: [ ],
                        }

                        Jane.siblings.push(Michael);
                        Michael.siblings.push(Jane);

                        return [Jane, Michael]
                    }

                    function mary(): Person {
                        return {
                            firstName: 'Mary',
                            lastName: 'Poppins',
                            fullName(): string {
                                return `${ this.firstName } ${ this.lastName }`;
                            },
                            lastKnownAddress(): Address {
                                return this.address
                            },
                            address: undefined,
                        }
                    }

                    const Value = <T>(value: T) =>
                        Question.about(`some value`, (actor: Actor) =>
                            Promise.resolve(value)
                        );

                    describe('fields', () => {

                        describe('so that the answer', () => {

                            it('resolves to the value of the expected field', async () => {
                                const [ Jane ] = siblings();

                                const city: Question<Promise<string>> = Value(Jane).address.lines[1].toLocaleUpperCase();

                                const result: string = await city.answeredBy(Quentin);

                                expect(result).to.equal('LONDON');
                            });

                            it('has a human-readable subject', async () => {
                                const [ Jane ] = siblings();

                                const city: Question<Promise<string>> = Value(Jane).address.lines[1].toLocaleUpperCase();

                                const result: string = city.toString();

                                expect(result).to.equal('<<some value>>.address.lines[1].toLocaleUpperCase()');
                            });

                            it(`complains if any of the objects in the proxied chain is undefined`, async () => {
                                const Mary = mary();

                                const city: Question<Promise<string>> = Value(Mary).address.lines[1].toLocaleUpperCase();

                                await expect(city.answeredBy(Quentin))
                                    .to.be.rejectedWith(LogicError, `<<some value>>.address is undefined, can't read property "lines"`);
                            });
                        });
                    });

                    describe('methods', () => {

                        describe('so that the answer', () => {

                            it('resolves to the value returned by the proxied methods', async () => {
                                const [ Jane ] = siblings();

                                const fullName: Question<Promise<string>> = Value(Jane)
                                    .fullName()
                                    .toLocaleUpperCase(Value(['en-GB']));

                                const result: string = await fullName.answeredBy(Quentin);

                                expect(result).to.equal('JANE BANKS');
                            });

                            it('has a human-readable subject', async () => {
                                const [ Jane ] = siblings();

                                const fullName: Question<Promise<string>> = Value(Jane).fullName().toLocaleUpperCase(Value(['en-GB']));

                                const subject: string = fullName.toString();

                                expect(subject).to.equal('<<some value>>.fullName().toLocaleUpperCase(<<some value>>)');
                            });

                            it(`complains if any of the objects in the proxied chain is undefined`, async () => {
                                const Mary = mary();

                                const city: Question<Promise<string>> = Value(Mary).lastKnownAddress().lines[1].toLocaleUpperCase();

                                await expect(city.answeredBy(Quentin))
                                    .to.be.rejectedWith(LogicError, `<<some value>>.lastKnownAddress() is undefined, can't read property "lines"`);
                            });
                        });
                    });

                    describe('so that an answer with cyclic dependencies', () => {
                        it('is correctly resolved', async () => {
                            const [ Jane ] = siblings();

                            const name: Question<Promise<string>> = Value(Jane).siblings[0].siblings[0].firstName;

                            const subject: string   = name.toString();

                            expect(subject).to.equal('<<some value>>.siblings[0].siblings[0].firstName');
                        });

                        it('is correctly described', async () => {
                            const [ Jane ] = siblings();

                            const name: Question<Promise<string>> = Value(Jane).siblings[0].siblings[0].firstName;

                            const subject: string   = name.toString();

                            expect(subject).to.equal('<<some value>>.siblings[0].siblings[0].firstName');
                        });
                    });
                });
            });

            describe('answer', () => {

                it('can be mapped from an async value to another type', async () => {
                    const input     = q('some answer', p('42'));
                    const question  = input.as(Number);

                    const result    = await question.answeredBy(Quentin);
                    const subject   = question.toString();

                    expect(result).to.deep.equal(42);
                    expect(subject).to.equal('some answer as <<Number>>');
                });

                it('can be mapped from a sync value to another type', async () => {
                    const input     = q('some answer', '42');
                    const question  = input.as(Number);

                    const result    = await question.answeredBy(Quentin);
                    const subject   = question.toString();

                    expect(result).to.deep.equal(42);
                    expect(subject).to.equal('some answer as <<Number>>');
                });

                it('can be mapped to another Array type', async () => {
                    const input: Question<Promise<string[]>> = q('list of strings', p([ '1', '2', '3' ]));

                    const question: Question<Promise<number[]>> = input.as(function numbers(items: string[]) {
                        return items.map(Number);
                    });

                    const result    = await question.answeredBy(Quentin);
                    const subject   = question.toString();

                    expect(result).to.deep.equal([ 1, 2, 3 ]);
                    expect(subject).to.equal('list of strings as <<numbers>>');
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

    // todo: REVIEW ------------------------------------------------------------------------------------------------

    describe('subject', () => {

        /** @test {Question} */
        it('proxies method calls so that they accept Answerable of an appropriate type', async () => {
            const Alex = actorCalled('Alex');

            const Value = <V>(value: V) =>
                Question.about<Promise<V>>('a value', (actor: Actor) =>
                    Promise.resolve(value)
                );

            const start = Value(0).describedAs('start index');
            const end   = Promise.resolve(5);

            const question =
                Value('Hello World')
                    .slice(start, end)
                    .toLocaleLowerCase();

            expect(await question.answeredBy(Alex)).to.equal('hello');
            expect(await question.length.answeredBy(Alex)).to.equal(5);
        });

        /** @test {Question#describedAs} */
        it('can override the description at any point in the proxied method chain', async () => {

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

        /** @test {Question#describedAs} */
        it('overrides the name of the subject with the last call to describedAs', async () => {

            const Value = <V>(value: V) =>
                Question.about<Promise<V>>('a value', (actor: Actor) =>
                    Promise.resolve(value)
                );

            const start = Value(0);
            const end   = Promise.resolve(5);

            const question: Question<Promise<number>> =
                Value('Hello World')
                    .describedAs('greeting 1')
                    .slice(start, end)
                    .describedAs('greeting 2')
                    .toLocaleLowerCase(Value('en-GB'))
                    .describedAs('greeting 3')
                    .length
                    .describedAs('greeting')

            expect(question.toString())
                .to.equal('greeting');
        });
    });
});
