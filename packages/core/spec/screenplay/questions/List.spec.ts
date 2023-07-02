import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import type { Actor, Answerable} from '../../../src';
import { actorCalled, Expectation, Interaction, List, ListItemNotFoundError, LogicError, Question } from '../../../src';
import { expect } from '../../expect';

describe('List', () => {

    let Fiona: Actor;
    beforeEach(() => {
        Fiona = actorCalled('Fiona');
    });

    afterEach(async () => {
        await Fiona.dismiss()
    });

    describe('when wrapping an Answerable<Array>', () => {

        const collection = [ 'first', 'second', 'third' ];

        const q = <T>(value: T) =>                              // eslint-disable-line unicorn/consistent-function-scoping
            Question.about<T>('some items', actor => value);

        const p = <T>(value: T) =>                              // eslint-disable-line unicorn/consistent-function-scoping
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
            expect(location.line).to.equal(321);
            expect(location.column).to.equal(18);
        });
    });

    describe('when used as a base of a custom collection', () => {

        it('returns all items from the underlying collection when no filters are applied', async () => {
            const items = new Collection([ 1, 2, 3 ]);

            const result = await items.answeredBy(Fiona)

            expect(result).to.deep.equal([ 1, 2, 3 ]);
        });

        it('returns only those items that match the filter', async () => {
            const items = new Collection([ 1, 2, 3, 4, 5 ]);

            const result = await items
                .where(Value, isGreaterThan(2))
                .answeredBy(Fiona)

            expect(result).to.deep.equal([ 3, 4, 5 ]);
        });

        it('returns only those items that match all the filters', async () => {
            const items = new Collection([ 1, 2, 3, 4, 5 ]);

            const list = List.of(items);

            const result = await list
                .where(Value, isGreaterThan(2))
                .where(Value, isLessThan(5))
                .answeredBy(Fiona)

            expect(result).to.deep.equal([ 3, 4 ]);
        });

        it('describes the filters applied', () => {
            const items = new Collection([ 1, 2, 3, 4, 5 ]);

            const result = items
                .where(Value, isGreaterThan(2))
                .where(Value, isLessThan(5))
                .first();

            expect(result.toString()).to.equal(
                'the first of lazily-fetched items where Value does have value greater than 2 and Value does have value less than 5'
            );
        });
    });

    describe('when handling errors', () => {

        class InvalidCollection {}

        given([ {
            description:        'null',
            answerable:         null,                           // eslint-disable-line unicorn/no-null
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
});

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

class Collection<Item_Type>
    extends List<Item_Type>
{
    constructor(items: Item_Type[]) {
        super(Question.about('lazily-fetched items', actor => items));
    }

    toString() {
        return 'my collection items';
    }
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
