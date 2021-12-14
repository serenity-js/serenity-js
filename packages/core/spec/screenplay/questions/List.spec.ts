import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled, Answerable, Expectation, List, LogicError, Mappable, Question } from '../../../src';
import { expect } from '../../expect';

describe('List', () => {

    const Fiona = actorCalled('Fiona');

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
            collectionDescription:  `<<Promise>>`,
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
                .to.eventually.deep.equal(collection[collection.length - 1])
        );

        given(examples).
        it('returns the nth item from the collection', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).get(1).answeredBy(Fiona))
                .to.eventually.deep.equal(collection[1])
        );

        /** @test {List#toString} */
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
                expect(List.of(answerable).get(1).toString())
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
                expect(List.of(examples[1].answerable).get(index).toString())
                    .to.equal(`the ${ description } of some items`);
            });
        });
    });

    describe('when filtering an Array', () => {

        it('returns all items from the underlying collection when no filters are applied', async () => {
            const items = [ 1, 2, 3 ];

            const list = new List(items);

            const result = await list.answeredBy(Fiona)

            expect(result).to.deep.equal(items);
        });

        it('returns only those items that match the filter', async () => {
            const items = [ 1, 2, 3, 4, 5 ];

            const list = new List(items);

            const result = await list
                .where(Value, isGreaterThan(2))
                .answeredBy(Fiona)

            expect(result).to.deep.equal([ 3, 4, 5 ]);
        });

        it('returns only those items that match all the filters', async () => {
            const items = [ 1, 2, 3, 4, 5 ];

            const list = new List(items);

            const result = await list
                .where(Value, isGreaterThan(2))
                .where(Value, isLessThan(5))
                .answeredBy(Fiona)

            expect(result).to.deep.equal([ 3, 4 ]);
        });

        it('describes the filters applied', () => {
            const items = [ 1, 2, 3, 4, 5 ];

            const list = new List(items);

            const result = list
                .where(Value, isGreaterThan(2))
                .where(Value, isLessThan(5))
                .first();

            expect(result.toString()).to.equal('the first of [ 1, 2, 3, 4, 5 ]');
        });
    });

    describe('when filtering a custom collection', () => {

        it('returns all items from the underlying collection when no filters are applied', async () => {
            const items = new Collection([ 1, 2, 3 ]);

            const list = new List(items);

            const result = await list.answeredBy(Fiona)

            expect(result).to.deep.equal([ 1, 2, 3 ]);
        });

        it('returns only those items that match the filter', async () => {
            const items = new Collection([ 1, 2, 3, 4, 5 ]);

            const list = new List(items);

            const result = await list
                .where(Value, isGreaterThan(2))
                .answeredBy(Fiona)

            expect(result).to.deep.equal([ 3, 4, 5 ]);
        });

        it('returns only those items that match all the filters', async () => {
            const items = new Collection([ 1, 2, 3, 4, 5 ]);

            const list = new List(items);

            const result = await list
                .where(Value, isGreaterThan(2))
                .where(Value, isLessThan(5))
                .answeredBy(Fiona)

            expect(result).to.deep.equal([ 3, 4 ]);
        });

        it('describes the filters applied', () => {
            const items = new Collection([ 1, 2, 3, 4, 5 ]);

            const list = new List(items);

            const result = list
                .where(Value, isGreaterThan(2))
                .where(Value, isLessThan(5))
                .first();

            expect(result.toString()).to.equal('the first of my collection items');
        });
    });

    describe('when handling errors', () => {

        class InvalidCollection {}

        given([ {
            description:        'null',
            answerable:         null,                           // eslint-disable-line unicorn/no-null
            expectedMessage:    '`null` has no `.map()` method',
        }, {
            description:        'undefined',
            answerable:         undefined,
            expectedMessage:    '`undefined` has no `.map()` method',
        }, {
            description:        'object',
            answerable:         new InvalidCollection(),
            expectedMessage:    '`InvalidCollection {}` has no `.map()` method',
        } ]).
        it('complains when given a non-mappable answerable', ({ answerable, expectedMessage }) => {
            const filter = new List(answerable);

            return expect(filter.first().answeredBy(Fiona))
                .to.be.rejectedWith(LogicError, 'A `List` has to wrap a mappable object, such as Array or PageElements. ' + expectedMessage);
        });

        it('complains when asked to retrieved the first item from an empty collection', () => {
            const items  = [ ];
            const list = new List(items);

            return expect(list.first().answeredBy(Fiona))
                .to.be.rejectedWith(LogicError, `Can't retrieve the first item from a list with 0 items: [ ]`);
        });

        it('complains when asked to retrieved the last item from an empty collection', () => {
            const items  = [ ];
            const list = new List(items);

            return expect(list.last().answeredBy(Fiona))
                .to.be.rejectedWith(LogicError, `Can't retrieve the last item from a list with 0 items: [ ]`);
        });

        it('complains when asked to retrieved nth item from an empty collection', () => {
            const items  = [ 'a', 'b' ];
            const list = new List(items);

            return expect(list.get(10).answeredBy(Fiona))
                .to.be.rejectedWith(LogicError, `Can't retrieve the 10th item from a list with 2 items: [ 'a', 'b' ]`);
        });

        it('complains when asked to retrieved item with a negative index', () => {
            const items  = [ 'a', 'b' ];
            const list = new List(items);

            return expect(list.get(-1).answeredBy(Fiona))
                .to.be.rejectedWith(LogicError, `Can't retrieve the -1st item from a list with 2 items: [ 'a', 'b' ]`);
        });

        it('propagates any errors thrown when answering the question', async () => {
            const items = [ 1, 2, 3 ];

            const list = new List(items);

            const result = await expect(
                list
                    .where(ThrowsError, isGreaterThan(1))
                    .answeredBy(Fiona)
            ).to.be.rejectedWith(LogicError, `Couldn't check if question subject does have value greater than 1`)

            expect(result.cause).to.be.instanceOf(Error);
            expect(result.cause.message).to.equal('Some error that prevented the question from being answered');
        });

        it('propagates any errors thrown when applying the expectation', async () => {
            const items = [ 1, 2, 3 ];

            const list = new List(items);

            const result = await expect(
                list
                    .where(Value, throws('Some error in expectation'))
                    .answeredBy(Fiona)
            ).to.be.rejectedWith(LogicError, `Couldn't check if some value does have value greater than 42`)

            expect(result.cause).to.be.instanceOf(Error);
            expect(result.cause.message).to.equal('Some error in expectation');
        });
    });
});

class Value {
    static of<T>(item: T) {
        return Question.about('some value', actor => Promise.resolve(item));
    }
}

class ThrowsError {
    static of = <T>(_item: T) =>
        Question.about('question subject', actor => {
            throw new Error(`Some error that prevented the question from being answered`);
        });
}

class Collection<Item_Type> implements Mappable<Item_Type, Collection<Item_Type>> {
    constructor(private readonly items: Item_Type[]) {
    }

    map<Mapped_Item_Type>(mapping: (item: Item_Type, index?: number, collection?: Collection<Item_Type>) => Mapped_Item_Type): Promise<Array<Awaited<Mapped_Item_Type>>> {
        return Promise.all(this.items.map((item, index) => mapping(item, index, this)));
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

