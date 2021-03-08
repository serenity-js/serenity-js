import 'mocha';
import { given } from 'mocha-testdata';

import { actorCalled, Answerable, List, Question } from '../../../../src';
import { expect } from '../../../expect';

describe('List', () => {

    const Lisa = actorCalled('Lisa');

    const q = <T>(value: T) =>
        Question.about<T>('some string collection', actor => value);

    const p = <T>(value: T) =>
        Promise.resolve(value);

    describe('when wrapping an Array', () => {

        const collection = [ 'first', 'second', 'third' ];

        const examples = [ {
            description:            'string[]',
            answerable:             collection,
            collectionDescription:  `[ 'first', 'second', 'third' ]`,
        }, {
            description:            'Question<string[]>',
            answerable:             q(collection),
            collectionDescription:  `some string collection`,
        }, {
            description:            'Promise<string[]>',
            answerable:             p(collection),
            collectionDescription:  `a Promise`,
        }, {
            description:            'Question<Promise<string[]>>',
            answerable:             q(p(collection)),
            collectionDescription:  `some string collection`,
        }];

        given(examples).
        it('returns the number of items', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).count().answeredBy(Lisa))
                .to.eventually.equal(3)
        );

        given(examples).
        it('returns the underlying collection', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).items().answeredBy(Lisa))
                .to.eventually.deep.equal(collection)
        );

        given(examples).
        it('returns the first item from the collection', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).first().answeredBy(Lisa))
                .to.eventually.deep.equal(collection[0])
        );

        given(examples).
        it('returns the last item from the collection', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).last().answeredBy(Lisa))
                .to.eventually.deep.equal(collection[collection.length - 1])
        );

        given(examples).
        it('returns the nth item from the collection', ({ answerable }: { answerable: Answerable<string[]> }) =>
            expect(List.of(answerable).get(1).answeredBy(Lisa))
                .to.eventually.deep.equal(collection[1])
        );

        describe('provides a sensible description when it', () => {

            given(examples).
            it('returns the number of items', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).count().toString())
                    .to.equal(`the item count of ${ collectionDescription }`)
            );

            given(examples).
            it('returns the underlying collection', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).items().toString())
                    .to.equal(collectionDescription)
            );

            given(examples).
            it('returns the first item from the collection', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).first().toString())
                    .to.equal(`the first of ${ collectionDescription }`)
            );

            given(examples).
            it('returns the last item from the collection', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).last().toString())
                    .to.equal(`the last of ${ collectionDescription }`)
            );

            given(examples).
            it('returns the nth item from the collection', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
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
                    .to.equal(`the ${ description } of some string collection`);
            });
        });

        describe('and using a single filter', () => {
            // todo:
        });

        describe('and using multiple filter', () => {
            // todo:
        });
    });
});
