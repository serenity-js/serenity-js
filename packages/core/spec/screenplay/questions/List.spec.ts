import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import type { JSONObject } from 'tiny-types';

import type { Actor, Answerable, AnswersQuestions, ChainableMetaQuestion, UsesAbilities } from '../../../src';
import {
    actorCalled,
    d,
    Expectation,
    Interaction,
    List,
    ListItemNotFoundError,
    LogicError,
    MetaList,
    Question
} from '../../../src';
import { expect } from '../../expect';

describe('List', () => {

    let Fiona: Actor;

    beforeEach(() => {
        Fiona = actorCalled('Fiona');
    });

    afterEach(async () => {
        await Fiona.dismiss()
    });

    describe('when wrapping a collection represented by an Answerable<Array>', () => {

        const collection = [ 'first', 'second', 'third' ];

        const q = <T>(value: T) =>
            Question.about<T>('some items', actor => value);

        const p = <T>(value: T) =>
            Promise.resolve(value);

        const examples = [ {
            description:            'string[]',
            answerable:             collection,
            collectionDescription:  `[ 'first', 'second', 'third' ]`,
        }, {
            description:            'Question<string[]>',
            answerable:             q(collection),
            collectionDescription:  `some items`,
        }, {
            description:            'Promise<string[]>',
            answerable:             p(collection),
            collectionDescription:  `Promise`,
        }, {
            description:            'Question<Promise<string[]>>',
            answerable:             q(p(collection)),
            collectionDescription:  `some items`,
        }];

        given(examples).
        it('returns the number of items', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).count().answeredBy(Fiona))
                .to.eventually.equal(3)
        );

        given(examples).
        it('returns the underlying collection', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).answeredBy(Fiona))
                .to.eventually.deep.equal(collection)
        );

        given(examples).
        it('returns the first item from the collection', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).first().answeredBy(Fiona))
                .to.eventually.deep.equal(collection[0])
        );

        given(examples).
        it('returns the last item from the collection', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).last().answeredBy(Fiona))
                .to.eventually.deep.equal(collection.at(-1))
        );

        given(examples).
        it('returns the nth item from the collection', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).nth(1).answeredBy(Fiona))
                .to.eventually.deep.equal(collection[1])
        );

        describe('provides a sensible description when it', () => {

            given(examples).
            it('returns the number of items of', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).count().toString())
                    .to.equal(`the number of ${ collectionDescription }`)
            );

            given(examples).
            it('returns the underlying collection of', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).toString())
                    .to.equal(collectionDescription)
            );

            given(examples).
            it('returns the first item from the collection of', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).first().toString())
                    .to.equal(`the first of ${ collectionDescription }`)
            );

            given(examples).
            it('returns the last item from the collection of', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).last().toString())
                    .to.equal(`the last of ${ collectionDescription }`)
            );

            given(examples).
            it('returns the nth item from the collection of', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).nth(1).toString())
                    .to.equal(`the 2nd of ${ collectionDescription }`)
            );

            given([
                { description: '1st',    index: 0 },
                { description: '2nd',    index: 1 },
                { description: '3rd',    index: 2 },
                { description: '4th',    index: 3 },
                { description: '5th',    index: 4 },
                { description: '10th',   index: 9 },
                { description: '11th',   index: 10 },
                { description: '20th',   index: 19 },
                { description: '42nd',   index: 41 },
                { description: '115th',  index: 114 },
                { description: '1522nd', index: 1521 },
            ]).
            it('returns the nth item', ({ description, index }) => {
                expect(List.of(examples[1].answerable).nth(index).toString())
                    .to.equal(`the ${ description } of some items`);
            });
        });
    });

    describe('when filtering', () => {

        it('returns all items from the underlying collection when no filters are applied', async () => {
            const items = [ 1, 2, 3 ];

            const list = List.of(items);

            const result = await list.answeredBy(Fiona)

            expect(result).to.deep.equal(items);
        });

        it('returns only those items that match the filter', async () => {
            const items = [ 1, 2, 3, 4, 5 ];

            const list = List.of(items);

            const result = await list
                .where(Value, isGreaterThan(2))
                .answeredBy(Fiona)

            expect(result).to.deep.equal([ 3, 4, 5 ]);
        });

        it('returns only those items that match all the filters', async () => {
            const items = [ 1, 2, 3, 4, 5 ];

            const list = List.of(items);

            const result = await list
                .where(Value, isGreaterThan(2))
                .where(Value, isLessThan(5))
                .answeredBy(Fiona)

            expect(result).to.deep.equal([ 3, 4 ]);
        });

        it('describes the filters applied', () => {
            const items = [ 1, 2, 3, 4, 5 ];

            const list = List.of(items);

            const result = list
                .where(Value, isGreaterThan(2))
                .where(Value, isLessThan(5))
                .first();

            expect(result.toString()).to.equal(
                'the first of [ 1, 2, 3, 4, 5 ] where Value does have value greater than 2 and Value does have value less than 5'
            );
        });
    });

    describe('when mapping items of a collection', () => {
        const accounts: Account[] = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Arbnor' },
            { id: 3, name: 'Bob' },
        ];

        it('supports MetaQuestions', async () => {
            const list = List.of(accounts);

            const result = await list
                .eachMappedTo(AccountName)
                .answeredBy(Fiona)

            expect(result).to.deep.equal(['Alice', 'Arbnor', 'Bob']);
        });

        it('supports Question.formattedValue()', async () => {
            const list = List.of(accounts);

            const result = await list
                .eachMappedTo(Question.formattedValue({ maxLength: 20 }))
                .answeredBy(Fiona)

            expect(result).to.deep.equal([
                `{ id: 1, name: "Alice" }`,
                `{ id: 2, name: "Arb... }`,
                `{ id: 3, name: "Bob" }`,
            ]);
        });

        it('describes MetaQuestion used to map the items', () => {
            const list = List.of(accounts);

            const result = list
                .eachMappedTo(AccountName)

            expect(result.toString()).to.equal(`[ {"id":1,"name":"Alice"}, {"id":2,"name":"Arbnor"}, {"id":3,"name":"Bob"} ] mapped to AccountName`);
        });

        it('allows for the default description to be overridden', () => {
            const list = List.of(accounts);

            const result = list
                .eachMappedTo(AccountName)
                .describedAs('all account names')
                .toString()

            expect(result).to.equal(`all account names`);
        });

        it('supports combining filters and MetaQuestions', async () => {
            const list = List.of(accounts);

            const result = await list
                .where(AccountName, startsWith('A'))
                .eachMappedTo(AccountName)
                .answeredBy(Fiona);

            expect(result).to.deep.equal(['Alice', 'Arbnor']);
        });

        it('describes both the filters and the MetaQuestion used to map the items', () => {
            const list = List.of(accounts);

            const result = list
                .where(AccountName, startsWith('A'))
                .eachMappedTo(AccountName)
                .first()
                .toString();

            expect(result).to.equal(
                `the first of [ {"id":1,"name":"Alice"}, {"id":2,"name":"Arbnor"}, {"id":3,"name":"Bob"} ] where AccountName does start with 'A' mapped to AccountName`
            );
        });
    });

    describe('when iterating over the collection', () => {

        it('executes the provided callback for every item', async () => {

            const accounts: Account[] = [
                { id: 1, name: 'Alice', enabled: false },
                { id: 2, name: 'Bob',   enabled: false },
                { id: 3, name: 'Cindy', enabled: false },
            ];

            await Fiona.attemptsTo(
                List.of(accounts)
                    .forEach(async ({ item, actor }) => {
                        await actor.attemptsTo(Toggle.the(item));
                    })
            );

            expect(accounts).to.deep.equal([
                { id: 1, name: 'Alice', enabled: true },
                { id: 2, name: 'Bob',   enabled: true },
                { id: 3, name: 'Cindy', enabled: true },
            ]);
        });

        it('supports nested loops', async () => {

            const accounts: Account[][] = [
                [ { id: 1, name: 'Alice', enabled: false } ],
                [ { id: 2, name: 'Bob',   enabled: false }, { id: 3, name: 'Cindy', enabled: false } ],
            ];

            await Fiona.attemptsTo(
                List.of(accounts).forEach(({ item, actor }) =>
                    actor.attemptsTo(
                        List.of(item).forEach(({ item, actor }) =>
                            actor.attemptsTo(Toggle.the(item))
                        )
                    )
                )
            );

            expect(accounts).to.deep.equal([
                [ { id: 1, name: 'Alice', enabled: true } ],
                [ { id: 2, name: 'Bob',   enabled: true }, { id: 3, name: 'Cindy', enabled: true } ]
            ]);
        });

        it('provides access to the current index and the collection items themselves', async () => {

            const entries = [
                { expectedIndex: 0, name: 'A' },
                { expectedIndex: 1, name: 'B' },
                { expectedIndex: 2, name: 'C' },
            ];

            await Fiona.attemptsTo(
                List.of(entries)
                    .forEach(({ item, actor }, index, items) => {
                        expect(index).to.equal(item.expectedIndex);
                        expect(items).to.deep.equal(entries);
                    })
            );
        });

        it('provides a sensible description of the task being performed', () => {
            const description = List.of([ 1, 2, 3 ])
                .forEach(({ item, actor }) => {
                    // do nothing
                })
                .toString();

            expect(description).to.equal('#actor iterates over [ 1, 2, 3 ]');
        });

        it('correctly detects its invocation location', () => {
            const activity = List.of([ 1, 2, 3 ])
                .forEach(({ item, actor }) => { /* do nothing */ });
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('List.spec.ts');
            expect(location.line).to.equal(347);
            expect(location.column).to.equal(18);
        });
    });

    describe('when handling errors', () => {

        class InvalidCollection {}

        given([ {
            description:        'null',
            answerable:         null,
            expectedMessage:    'null given',
        }, {
            description:        'undefined',
            answerable:         undefined,
            expectedMessage:    'undefined given',
        }, {
            description:        'object',
            answerable:         new InvalidCollection(),
            expectedMessage:    'InvalidCollection {} given',
        } ]).
        it('complains when given a non-Array answerable', ({ answerable, expectedMessage }) => {
            const filter = List.of(answerable);

            return expect(filter.first().answeredBy(Fiona))
                .to.be.rejectedWith(LogicError, 'A List has to wrap an Array-compatible object. ' + expectedMessage);
        });

        it('complains when asked to retrieved the first item from an empty collection', () => {
            const items  = [ ];
            const list = List.of(items);

            return expect(list.first().answeredBy(Fiona))
                .to.be.rejectedWith(ListItemNotFoundError, `Can't retrieve the first item from a list with 0 items: [ ]`);
        });

        it('complains when asked to retrieve the last item from an empty collection', () => {
            const items  = [ ];
            const list = List.of(items);

            return expect(list.last().answeredBy(Fiona))
                .to.be.rejectedWith(ListItemNotFoundError, `Can't retrieve the last item from a list with 0 items: [ ]`);
        });

        it('complains when asked to retrieve nth item from an empty collection', () => {
            const items  = [ 'a', 'b' ];
            const list = List.of(items);

            return expect(list.nth(10).answeredBy(Fiona))
                .to.be.rejectedWith(ListItemNotFoundError, `Can't retrieve the 10th item from a list with 2 items: [ 'a', 'b' ]`);
        });

        it('complains when asked to retrieve item with a negative index', () => {
            const items  = [ 'a', 'b' ];
            const list = List.of(items);

            return expect(list.nth(-1).answeredBy(Fiona))
                .to.be.rejectedWith(ListItemNotFoundError, `Can't retrieve the -1st item from a list with 2 items: [ 'a', 'b' ]`);
        });

        it('propagates any errors thrown when answering the question', async () => {
            const items = [ 1, 2, 3 ];

            const list = List.of(items);

            const result = await expect(
                list
                    .where(BrokenQuestion, isGreaterThan(1))
                    .answeredBy(Fiona)
            ).to.be.rejectedWith(LogicError, `Couldn't check if BrokenQuestion of an item of [ 1, 2, 3 ] does have value greater than 1`)

            expect(result.cause).to.be.instanceOf(Error);
            expect(result.cause.message).to.equal('Some error that prevented the question from being answered');
        });

        it('propagates any errors thrown when applying the expectation', async () => {
            const items = [ 1, 2, 3 ];

            const list = List.of(items);

            const result = await expect(
                list
                    .where(Value, throws('Some error in expectation'))
                    .answeredBy(Fiona)
            ).to.be.rejectedWith(LogicError, `Couldn't check if Value of an item of [ 1, 2, 3 ] does have value greater than 42`)

            expect(result.cause).to.be.instanceOf(Error);
            expect(result.cause.message).to.equal('Some error in expectation');
        });
    });

    describe('when wrapping a collection represented by a chainable meta-question', () => {

        const example: JSONObject = {
            first: {
                second: {
                    third: ['a', 'b', 'c'],
                    fourth: ['c', 'd', 'e']
                },
            },
            empty: [],
        }

        it('produces a MetaList', async () => {

            const list = List.of(new ObjectKeys(example));

            expect(Question.isAMetaQuestion(list)).to.equal(true);
            expect(list).to.be.instanceOf(MetaList);

            const keys = await Fiona.answer(list);

            expect(keys).to.deep.equal([ 'first', 'empty' ]);
        });

        it('allows for further chaining', async () => {

            const list = List.of(new ObjectKeys(example))
                .of('first')
                .of('second');

            const keys = await Fiona.answer(list);

            expect(keys).to.deep.equal([ 'third', 'fourth' ]);
        });

        it('allows for filtering', async () => {

            const list = List.of(new ObjectKeys(example))
                .of('first')
                .of('second')
                .where(Value, startsWith('f'));

            const keys = await Fiona.answer(list);

            expect(keys).to.deep.equal([ 'fourth' ]);
        });

        it('allows for mapping', async () => {

            const list = List.of(new ObjectKeys(example))
                .of('first')
                .of('second')
                .of('fourth')
                .eachMappedTo(NumericValue);

            const keys = await Fiona.answer(list);

            expect(keys).to.deep.equal([ 0, 1, 2 ]);
        });

        it('returns the number of items in the collection', async () => {
            const list = List.of(new ObjectKeys(example))
                .of('first')
                .of('second')
                .of('third');

            const key = await Fiona.answer(list.count());

            expect(key).to.equal(3);
        });

        it('returns the first item from the collection', async () => {
            const list = List.of(new ObjectKeys(example))
                .of('first')
                .of('second')
                .of('third');

            const key = await Fiona.answer(list.first());

            expect(key).to.equal('0');
        });

        it('returns the last item from the collection', async () => {
            const list = List.of(new ObjectKeys(example))
                .of('first')
                .of('second')
                .of('third');

            const key = await Fiona.answer(list.last());

            expect(key).to.equal('2');
        });

        it('returns nth item from the collection', async () => {
            const list = List.of(new ObjectKeys(example))
                .of('first')
                .of('second')
                .of('third');

            const key = await Fiona.answer(list.nth(2));

            expect(key).to.equal('2');
        });

        describe('when using lazily-evaluated filters', () => {

            describe('evaluates context links established via of() before it', () => {

                it('applies the filters', async () => {

                    const list = List.of(new ObjectKeys(example))
                        .where(Value, startsWith('t'))
                        .of('first')
                        .where(Value, endsWith('d'))
                        .of('second')
                    ;

                    const keys = await Fiona.answer(list);

                    expect(keys).to.deep.equal([ 'third' ]);
                });

                it('applies the mapping', async () => {

                    const list = List.of(new ObjectKeys(example))
                        .of('first')
                        .of('second')
                        .where(Value, startsWith('1'))
                        .eachMappedTo(NumericValue)
                        .of('fourth');

                    const keys = await Fiona.answer(list);

                    expect(keys).to.deep.equal([ 1 ]);
                });

                it('returns the number of items in the collection', async () => {
                    const list = List.of(new ObjectKeys(example))
                        .of('first')
                        .of('second')
                        .count()
                        .of('third');

                    const key = await Fiona.answer(list);

                    expect(key).to.equal(3);
                });

                it('returns the first item from the collection', async () => {
                    const list = List.of(new ObjectKeys(example))
                        .of('first')
                        .of('second')
                        .first()
                        .of('third');

                    const key = await Fiona.answer(list);

                    expect(key).to.equal('0');
                });

                it('returns the last item from the collection', async () => {
                    const list = List.of(new ObjectKeys(example))
                        .of('first')
                        .of('second')
                        .last()
                        .of('third');

                    const key = await Fiona.answer(list);

                    expect(key).to.equal('2');
                });

                it('returns nth item from the collection', async () => {
                    const list = List.of(new ObjectKeys(example))
                        .of('first')
                        .of('second')
                        .nth(2)
                        .of('third');

                    const key = await Fiona.answer(list);

                    expect(key).to.equal('2');
                });
            });

            describe('when handling errors', () => {

                describe('complains when the collection is empty as it', () => {

                    it('returns the first item from the collection', async () => {
                        const first = List.of(new ObjectKeys(example))
                            .first()
                            .of('empty');

                        await expect(first.answeredBy(Fiona))
                            .to.be.rejectedWith(ListItemNotFoundError, `Can't retrieve the first item from a list with 0 items: [ ]`);
                    });

                    it('returns the last item from the collection', async () => {
                        const last = List.of(new ObjectKeys(example))
                            .last()
                            .of('empty');

                        await expect(last.answeredBy(Fiona))
                            .to.be.rejectedWith(ListItemNotFoundError, `Can't retrieve the last item from a list with 0 items: [ ]`);
                    });

                    it('returns nth item from the collection', async () => {
                        const nth = List.of(new ObjectKeys(example))
                            .nth(2)
                            .of('empty');

                        await expect(nth.answeredBy(Fiona))
                            .to.be.rejectedWith(ListItemNotFoundError, `Can't retrieve the 2nd item from a list with 0 items: [ ]`);
                    });
                });
            });
        });

        describe('when producing descriptions', () => {

            it('produces a sensible description when a custom one is not provided', () => {

                const list = List.of(new ObjectKeys(example))
                    .of('first')
                    .of('second')
                    .where(Value, startsWith('1'));

                expect(list.toString()).to.equal(
                    `{"first":{"second":{"third":["a","b","c"],"fourth":["c","d","e"]}},"empty":[]} of 'first' of 'second' where Value does start with '1'`
                );
            });

            it('allows for setting a custom description when mapping', async () => {

                const list = List.of(new ObjectKeys(example))
                    .of('first')
                    .of('second')
                    .of('fourth')
                    .eachMappedTo(NumericValue)
                    .describedAs('numeric values');

                expect(list.toString()).to.equal('numeric values');
            });

            it('allows for setting a custom description when specifying filters', async () => {

                const list = List.of(new ObjectKeys(example))
                    .of('first')
                    .of('second')
                    .where(Value, startsWith('1'))
                    .describedAs('my collection');

                expect(list.toString()).to.equal('my collection');
            });

            it('allows for setting a custom description, and then combining it further', async () => {

                const list = List.of(new ObjectKeys(example))
                    .of('first')
                    .of('second')
                    .where(Value, startsWith('1'))
                    .describedAs('my collection')
                    .of('third')
                ;

                expect(list.toString()).to.equal(`my collection of 'third'`);
            });
        });
    });
});

class ObjectKeys
    extends Question<Promise<Array<string>>>
    implements ChainableMetaQuestion<string, Question<Promise<Array<string>>>>
{
    private subject?: string;

    constructor(private readonly jsonObject: Answerable<JSONObject>) {
        super(d`${ jsonObject }`);
    }

    of(context: Answerable<string>): Question<Promise<string[]>> & ChainableMetaQuestion<string, Question<Promise<string[]>>> {
        return new ObjectKeys(
            Question.about('JSON object', async actor => {
                const jsonObject: JSONObject = await actor.answer(this.jsonObject);
                const key = await actor.answer(context);

                return jsonObject[key] as JSONObject;
            }),
        )
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<Array<any>> {
        const jsonObject = await actor.answer(this.jsonObject);
        return Object.keys(jsonObject);
    }
}

class NumericValue {
    static of = (value: Answerable<string>) =>
        Question.about('numeric value', async actor => {
            const answer = await actor.answer(value);
            return Number.parseInt(answer, 10);
        })
}

interface Account {
    id: number;
    name: string;
    enabled?: boolean;
}

class AccountName {
    static of = (account: Account) =>
        Question.about('account name', actor => account.name)
}

class Toggle {
    static the = (account: Account) =>
        Interaction.where(`#actor toggles the account`, actor => {
            account.enabled = ! account.enabled;
        });
}

class Value {
    static of<T>(item: T): Question<Promise<T>> {
        return Question.about('some value', actor => Promise.resolve(item));
    }
}

class BrokenQuestion {
    static of = <T>(_item: T) =>
        Question.about('broken question', actor => {
            throw new Error(`Some error that prevented the question from being answered`);
        });
}

function throws(message: string): Expectation<number> {
    return Expectation.thatActualShould<number, number>('have value greater than', 42)
        .soThat((_actualValue, _expectedValue) => {
            throw new Error(message);
        });
}

function isGreaterThan(expected: Answerable<number>): Expectation<number> {
    return Expectation.thatActualShould<number, number>('have value greater than', expected)
        .soThat((actualValue, expectedValue) => actualValue > expectedValue);
}

function isLessThan(expected: Answerable<number>): Expectation<number> {
    return Expectation.thatActualShould<number, number>('have value less than', expected)
        .soThat((actualValue, expectedValue) => actualValue < expectedValue);
}

function startsWith(expected: Answerable<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('start with', expected)
        .soThat((actualValue, expectedValue) => actualValue.startsWith(expectedValue));
}

function endsWith(expected: Answerable<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('ends with', expected)
        .soThat((actualValue, expectedValue) => actualValue.endsWith(expectedValue));
}
