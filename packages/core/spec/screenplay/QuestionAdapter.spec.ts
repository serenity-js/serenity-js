import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import type { Actor, QuestionAdapter } from '../../src';
import { actorCalled, Interaction, Question } from '../../src';
import { expect } from '../expect';

function p<T>(value?: T): Promise<T> {
    return Promise.resolve(value);
}

describe('Question', () => {

    let actor: Actor;

    beforeEach(() => {
        actor = actorCalled('Stella');
    });

    afterEach(() => actor.dismiss());

    describe('about()', () => {

        describe('creates a QuestionAdapter, which', () => {

            describe('when used as a Question', () => {

                describe('answeredBy()', () => {

                    given([
                        { description: 'null', actual: null, expected: null },
                        { description: 'Promise<null>', actual: p(null), expected: null },
                        { description: 'undefined', actual: undefined, expected: undefined },
                        { description: 'Promise<undefined>', actual: p(undefined), expected: undefined },
                        { description: 'object', actual: { name: 'Alice' }, expected: { name: 'Alice' } },
                        { description: 'Promise<object>', actual: p({ name: 'Alice' }), expected: { name: 'Alice' } },
                        { description: 'primitive', actual: 42, expected: 42 },
                        { description: 'Promise<primitive>', actual: p(42), expected: 42 },
                    ]).it('returns a promise of the underlying answer', async ({ expected, actual }) => {
                        const answer = await actor.answer(Question.about('some value', _actor => actual));

                        expect(answer).to.deep.equal(expected);
                    });
                });

                describe('isPresent()', () => {

                    given([
                        undefined,
                        null,
                    ]).it('resolves to false when the answer is not defined', async (value: any) => {
                        const answer = await actor.answer(Question.about('some value', _actor => value).isPresent());

                        expect(answer).to.equal(false);
                    });

                    it('resolves to false when one of the links in the chain is not defined', async () => {
                        const example: { a?: { b?: { c?: string } } } = { a: {} };

                        const actual = await actor.answer(
                            Question.about('some array', _actor => example)
                                .a
                                .b
                                .c
                                .isPresent()
                        );

                        expect(actual).to.equal(false);
                    });

                    it('resolves to true when the answer exists', async () => {
                        const answer = await actor.answer(Question.about('some value', _actor => 42).isPresent());

                        expect(answer).to.equal(true);
                    });

                    it('provides a human-readable description', async () => {
                        const example: { a?: { b?: { c?: string } } } = { a: {} };

                        const actual = Question.about('some array', _actor => example)
                            .a
                            .b
                            .c
                            .isPresent()
                            .toString();

                        expect(actual).to.equal('<<some array>>.a.b.c.isPresent()');
                    });

                    it('can have its description overridden', async () => {
                        const example: { a?: { b?: { c?: string } } } = { a: {} };

                        const actual = Question.about('some array', _actor => example)
                            .a
                            .b
                            .c
                            .isPresent()
                            .describedAs('some element')
                            .toString();

                        expect(actual).to.equal('some element');
                    });
                });

                describe(`as()`, () => {
                    const QuestionAdapter: QuestionAdapter<string> = Question.about('example', _actor => ({ name: 'Hello42' }))
                        .name
                        .slice(5, 7);

                    it(`can be mapped to another type`, async () => {

                        const expected = 42;

                        const mapped: Question<Promise<number>> = QuestionAdapter.as(Number);

                        const actual: number = await mapped.answeredBy(actor);

                        expect(mapped.toString()).to.equal('<<example>>.name.slice(5, 7).as(Number)');
                        expect(actual).to.equal(expected);
                    });

                    it(`proxies methods of the mapped type`, async () => {

                        const expected = '42.00';

                        const mapped: Question<Promise<string>> = QuestionAdapter.as(Number)
                            .toFixed(2);

                        const actual: string = await mapped.answeredBy(actor);

                        expect(mapped.toString()).to.equal('<<example>>.name.slice(5, 7).as(Number).toFixed(2)');
                        expect(actual).to.equal(expected);
                    });

                    it(`allows for the mapped QuestionAdapter to be renamed`, async () => {

                        const mapped: Question<Promise<string>> = QuestionAdapter.as(Number)
                            .describedAs('the answer')
                            .toFixed(2);

                        expect(mapped.toString()).to.equal('<<the answer>>.toFixed(2)');
                    });
                });

                describe('handling `undefined`', () => {

                    it('resolves to `undefined` if any links in the chain are `undefined`', async () => {

                        const example: { a?: { b?: { c?: string } } } = { a: {} };

                        const QuestionAdapter = Question.about('some array', _actor => example)
                            .a
                            .b
                            .c;

                        const actual = await actor.answer(QuestionAdapter);

                        expect(actual).to.equal(undefined);
                    });

                    it('resolves to `undefined` when a mapping function is used on a chain with an undefined link', async () => {

                        const example: { a?: { b?: { c?: string } } } = { a: {} };

                        const QuestionAdapter = Question.about('some array', _actor => example)
                            .a
                            .b
                            .c
                            .as(Number)
                            .toFixed(2);

                        const actual = await actor.answer(QuestionAdapter);

                        expect(actual).to.equal(undefined);
                    });
                });

                describe('wrapping an Array', () => {

                    describe(`resolves any "Answerable" arguments before they're passed to callback functions so that`, () => {

                        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
                        describe('Array.map', () => {

                            it('works with a sync callback', async () => {
                                const QuestionAdapter = Question.about('list', _actor => p([ '1', '2', '3' ]))
                                    .map((value: string) => Number.parseInt(value, 10));

                                const result = await QuestionAdapter.answeredBy(actor);

                                expect(result).to.deep.equal([ 1, 2, 3 ]);
                                expect(QuestionAdapter.toString()).to.equal('<<list>>.map(<<Function>>)');
                            });
                        });

                        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
                        describe('Array.reduce', () => {

                            it('works with a sync callback and async initial value', async () => {
                                const question = Question.about('list', _actor => p([ 1, 2, 3 ]))
                                    .reduce(
                                        (acc: number, current: number) => {
                                            return acc + current;
                                        }, Question.about('initial value', _actor => p(0)));

                                const result = await question.answeredBy(actor)

                                expect(result).to.equal(6);
                                expect(question.toString()).to.equal('<<list>>.reduce(<<Function>>, <<initial value>>)');
                            });

                            it('works with a sync callback and sync initial value', async () => {
                                const question = Question.about('list', _actor => p([ 1, 2, 3 ]))
                                    .reduce(
                                        (acc: number, current: number) => {
                                            return acc + current;
                                        }, 0);

                                const result = await question.answeredBy(actor)

                                expect(result).to.equal(6);
                                expect(question.toString()).to.equal('<<list>>.reduce(<<Function>>, 0)');
                            });
                        });
                    });
                });

                describe('handling cycles in object graph', () => {

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
                            siblings: [],
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
                            siblings: [],
                        }

                        Jane.siblings.push(Michael);
                        Michael.siblings.push(Jane);

                        return [ Jane, Michael ]
                    }

                    const Value = <T>(value: T) =>
                        Question.about(`some value`, _actor => value);

                    it('is correctly resolved', async () => {
                        const [ Jane ] = siblings();

                        const name: Question<Promise<string>> = Value(Jane).siblings[0].siblings[0].firstName;

                        const subject: string = await actor.answer(name);

                        expect(subject).to.equal('Jane');
                    });

                    it('is correctly described', async () => {
                        const [ Jane ] = siblings();

                        const name: Question<Promise<string>> = Value(Jane).siblings[0].siblings[0].firstName;

                        const subject: string = name.toString();

                        expect(subject).to.equal('<<some value>>.siblings[0].siblings[0].firstName');
                    });
                });
            });

            describe('when used as an Interaction', () => {

                it('is an instance of Interaction', async () => {

                    const stack: Interaction & QuestionAdapter<Array<number>> = Question.about('some stack', _actor => [ 1, 2, 3 ]);
                    const push: Interaction = stack.push(4);

                    expect(stack).to.be.instanceOf(Interaction);
                    expect(push).to.be.instanceOf(Interaction);
                });

                it('allows for method calls to be executed as part of the Actor flow', async () => {
                    const actual: number[] = [];
                    const expected = [ 1, 2 ];

                    const stack: QuestionAdapter<Array<number>> = Question.about('some stack', _actor => actual);

                    await actor.attemptsTo(
                        stack.push(1),
                        stack.push(2),
                    );

                    expect(actual).to.deep.equal(expected);
                });
            });

            describe('acts as a proxy, which', () => {

                it('wraps fields of the underlying answer in Questions', async () => {
                    const example = 'Hello World!';
                    const answer = await actor.answer(
                        Question.about('some value', _actor => example).length
                    );

                    expect(answer).to.equal(example.length);
                });

                it('wraps methods of the underlying answer in Interactions', async () => {
                    const example = [ 3, 1, 2 ];
                    const sorted = [ 1, 2, 3 ];

                    await actor.attemptsTo(
                        Question.about('some array', _actor => example).sort(),
                    );

                    expect(example).to.deep.equal(sorted);
                });

                it('makes the wrapped methods of the underlying answer accept Answerables', async () => {
                    const example = [ 1, 2, 3 ];
                    const expected = [ 1, 2, 3, 4, 5, 6 ];

                    await actor.attemptsTo(
                        Question.about('some array', _actor => example).push(
                            Question.about('one more value', _actor => 4),
                            Promise.resolve(5),
                            6
                        ),
                    );

                    expect(example).to.deep.equal(expected);
                });

                it('allows chaining method calls', async () => {
                    const example = [ 'c', 'b', 'a' ];
                    const expected = [ 'a', 'b', 'c', 'd', 'e' ];

                    const actual = await actor.answer(
                        Question.about('some array', _actor => example)
                            .concat('e')
                            .concat('d')
                            .sort()
                    );

                    expect(actual).to.deep.equal(expected);
                });

                it('allows chaining field calls', async () => {
                    const example = { a: { b: { c: 'value' } } };
                    const expected = 'value';

                    const actual = await actor.answer(
                        Question.about('some array', _actor => example)
                            .a
                            .b
                            .c
                    );

                    expect(actual).to.equal(expected);
                });

                it('resolves to undefined if any of the links in the chain resolves to `undefined`', async () => {
                    const example: { a?: { b?: { c?: string } } } = { a: {} };
                    const expected = undefined;

                    const actual = await actor.answer(
                        Question.about('some array', _actor => example)
                            .a
                            .b
                            .c
                    );

                    expect(actual).to.equal(expected);
                });

                describe(`correctly proxies calls to fields, even if they exist on the proxy itself`, () => {

                    interface User {
                        name: string;
                        caller: string;
                        arguments: boolean;
                        description: string;
                        location: string;
                    }

                    const Response = () =>
                        Question.about<{ users: User[] }>(`users`, _actor => ({
                            users: [
                                // "caller" and "argument" are here to show how a proxy resolves conflicts
                                // between a built-in fields like function.caller and function.arguments
                                // and properties of the wrapped object of the same name
                                { name: 'Alice', caller: 'Bob', arguments: false, location: 'London', description: 'first actor' },
                                { name: 'Bob', caller: 'Alice', arguments: true, location: 'New York', description: 'second actor' },
                            ]
                        }));

                    it('proxies "arguments"', async () => {
                        const args: Question<Promise<boolean>> = Response().users[0].arguments;

                        const result: boolean = await actor.answer(args);

                        expect(result).to.equal(false);
                    });

                    it('proxies "caller"', async () => {
                        const caller: Question<Promise<string>> = Response().users[0].caller;

                        const result: string = await actor.answer(caller);

                        expect(result).to.equal('Bob');
                    });

                    it('proxies "length"', async () => {
                        const length: Question<Promise<number>> = Response().users.length;

                        const result: number = await actor.answer(length);

                        expect(result).to.equal(2);
                    });

                    it('proxies "name"', async () => {
                        const name: Question<Promise<string>> = Response().users[0].name;

                        const result: string = await actor.answer(name);

                        expect(result).to.equal('Alice');
                    });

                    it('proxies "description"', async () => {
                        const description: Question<Promise<string>> = Response().users[0].description;

                        const result: string = await actor.answer(description);

                        expect(result).to.equal('first actor');
                    });

                    it('proxies "location"', async () => {
                        const location: Question<Promise<string>> = Response().users[0].location;

                        const result: string = await actor.answer(location);

                        expect(result).to.equal('London');
                    });
                });
            });

            describe('subject', () => {
                it('is set when the QuestionAdapter is created', () => {
                    const subject = Question.about('some value', _actor => 42).toString();

                    expect(subject).to.equal('some value');
                });

                it('is generated dynamically based on the name of the field', () => {
                    const subject = Question.about('greeting', _actor => 'Hello world!').length.toString();

                    expect(subject).to.equal('<<greeting>>.length');
                });

                it('is generated dynamically based on the name of the method', () => {
                    const subject = Question.about('greeting', _actor => 'Hello world!').toLocaleUpperCase().toString();

                    expect(subject).to.equal('<<greeting>>.toLocaleUpperCase()');
                });

                it('is generated dynamically based on the name of the method and its arguments', () => {
                    const start = (value: number) =>
                        Question.about('start index', _actor => value);

                    const end = (value: number) =>
                        Question.about('end index', _actor => value);

                    const slice: QuestionAdapter<string> = Question.about('name', (actor: Actor) => actor.name)
                        .slice(start(0), end(0))
                        .toLocaleLowerCase([ 'en-GB', 'en-US' ]);

                    const result = slice.toString();

                    expect(result).to.equal(`<<name>>.slice(<<start index>>, <<end index>>).toLocaleLowerCase([ 'en-GB', 'en-US' ])`);
                });

                it('can be used in string template literals', () => {
                    const QuestionAdapter = Question.about('greeting', _actor => 'Hello world!').length;

                    const result = `QuestionAdapter: ${ QuestionAdapter }`;

                    expect(result).to.equal('QuestionAdapter: <<greeting>>.length');
                });

                it('can be concatenated with other strings', () => {
                    const QuestionAdapter = Question.about('greeting', _actor => 'Hello world!').length;

                    const result = `QuestionAdapter: ` + QuestionAdapter;

                    expect(result).to.equal('QuestionAdapter: <<greeting>>.length');
                });
            });

            describe('describedBy(actor)', () => {

                it('returns a human-readable description of the QuestionAdapter', async () => {
                    const adapter = Question.about('greeting', _actor => 'Hello world!');

                    const description   = await adapter.describedBy(actor);
                    const answer        = await adapter.answeredBy(actor);
                    const toString      = adapter.toString();

                    expect(toString).to.equal('greeting');
                    expect(description).to.equal('greeting');
                    expect(answer).to.equal('Hello world!');
                });

                it('can return a human-readable description of the value QuestionAdapter', async () => {
                    const adapter = Question.about('greeting', _actor => 'Hello world!').describedAs(Question.formattedValue());

                    const description   = await adapter.describedBy(actor);
                    const answer        = await adapter.answeredBy(actor);
                    const toString      = adapter.toString();

                    expect(toString).to.equal('greeting');
                    expect(description).to.equal('"Hello world!"');
                    expect(answer).to.equal('Hello world!');
                });
            });
        });

        describe('creates a MetaQuestionAdapter, which', () => {

            describe('when used as a Question', () => {

                const questionMetaAdapter = Question.about(
                    'introduction',
                    (actor: Actor) => `I'm ${ actor.name }`,
                    (city: City) =>
                        Question.about(
                            `introduction from ${ city.name }`,
                            (actor: Actor) => `I'm ${ actor.name } from ${ city.name }`
                        )
                );

                it(`can be answered in the context of another question`, async () => {
                    const result: string = await actor.answer(
                        questionMetaAdapter.of({ name: 'London' })
                    );

                    expect(result).to.equal(`I'm Stella from London`);
                });

                it('has a human-readable description', () => {
                    expect(questionMetaAdapter.of({ name: 'London', toString: () => 'London' }).toString())
                        .to.equal(`introduction of London`)
                });
            });
        });
    });
});

interface City {
    name: string;
    toString(): string;
}
