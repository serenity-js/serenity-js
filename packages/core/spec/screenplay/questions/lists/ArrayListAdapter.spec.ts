/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null,unicorn/no-useless-undefined */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled, Answerable, Question } from '../../../../src';
import { formatted } from '../../../../src/io';
import { ArrayListAdapter } from '../../../../src/screenplay/questions/lists';
import { expect } from '../../../expect';

/** @test {ArrayListAdapter} */
describe('ArrayListAdapter', () => {

    const Ariana = actorCalled('Ariana');

    const q = <T>(description: string, value: T) =>
        Question.about<T>(description, actor => value);

    const p = <T>(value: T) =>
        Promise.resolve(value);

    const array = [ 'first', 'second', 'third' ];

    const invalidExamples = [
        ...answerables('null', null),
        ...answerables('undefined', undefined),
        ...answerables('number', 0),
        ...answerables('string', 'string'),
        ...answerables('boolean', true),
        ...answerables('object', { }),
    ];

    function answerables<T>(type: string, value: T): Array<{ description: string, collectionDescription: string, answerable: Answerable<T> }> {
        return [{
            description:            type,
            answerable:             value,
        }, {
            description:            `Question<${ type }>`,
            answerable:             q(type, value),
        }, {
            description:            `Promise<${ type }>`,
            answerable:             p(value),
        }, {
            description:            `Question<Promise<${ type }>>`,
            answerable:             q(type, p(value)),
        } ].map(entry => ({
            ...entry,
            collectionDescription:  formatted`${ entry.answerable }`,
        }))
    }

    given(answerables('array', array)).
    it('provides a sensible description', ({ answerable }) =>
        expect(new ArrayListAdapter(answerable).toString())
            .to.equal(formatted`${ answerable }`)
    );

    /** @test {ArrayListAdapter#count} */
    describe('count()', () => {

        given(invalidExamples).
        it('complains when instantiated with a non-array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).count(Ariana))
                .to.be.rejectedWith(Error, 'ArrayListAdapter constructor parameter should be an array')
        );

        given(answerables('array', array)).
        it('returns the number of items in the underlying array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).count(Ariana))
                .to.eventually.equal(array.length)
        );
    });

    /** @test {ArrayListAdapter#items} */
    describe('items()', () => {

        given(invalidExamples).
        it('complains when instantiated with a non-array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).items(Ariana))
                .to.be.rejectedWith(Error, 'ArrayListAdapter constructor parameter should be an array')
        );

        given(answerables('array', array)).
        it('returns the underlying array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).items(Ariana))
                .to.eventually.deep.equal(array)
        );
    });

    /** @test {ArrayListAdapter#first} */
    describe('first()', () => {

        given(invalidExamples).
        it('complains when instantiated with a non-array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).first(Ariana))
                .to.be.rejectedWith(Error, 'ArrayListAdapter constructor parameter should be an array')
        );

        given(answerables('array', array)).
        it('returns the first item from the underlying array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).first(Ariana))
                .to.eventually.deep.equal(array[0])
        );

        describe(`complains if the item doesn't exist`, () => {
            it(`(array)`, () =>
                expect(new ArrayListAdapter([]).first(Ariana))
                    .to.be.rejectedWith(Error, `[ ] is empty`)
            );

            it(`(Question<array>)`, () =>
                expect(new ArrayListAdapter(q('some collection', [])).first(Ariana))
                    .to.be.rejectedWith(Error, `some collection [ ] is empty`)
            );

            it(`(Promise<array>)`, () =>
                expect(new ArrayListAdapter(p([])).first(Ariana))
                    .to.be.rejectedWith(Error, `a Promise [ ] is empty`)
            );

            it(`(Question<Promise<array>>)`, () =>
                expect(new ArrayListAdapter(q('some collection', p([]))).first(Ariana))
                    .to.be.rejectedWith(Error, `some collection [ ] is empty`)
            );
        });
    });

    /** @test {ArrayListAdapter#last} */
    describe('last()', () => {

        given(invalidExamples).
        it('complains when instantiated with a non-array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).last(Ariana))
                .to.be.rejectedWith(Error, 'ArrayListAdapter constructor parameter should be an array')
        );

        given(answerables('array', array)).
        it('returns the first item from the underlying array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).last(Ariana))
                .to.eventually.deep.equal(array[array.length - 1])
        );

        describe(`complains if the item doesn't exist`, () => {
            it(`(array)`, () =>
                expect(new ArrayListAdapter([]).last(Ariana))
                    .to.be.rejectedWith(Error, `[ ] is empty`)
            );

            it(`(Question<array>)`, () =>
                expect(new ArrayListAdapter(q('some collection', [])).last(Ariana))
                    .to.be.rejectedWith(Error, `some collection [ ] is empty`)
            );

            it(`(Promise<array>)`, () =>
                expect(new ArrayListAdapter(p([])).last(Ariana))
                    .to.be.rejectedWith(Error, `a Promise [ ] is empty`)
            );

            it(`(Question<Promise<array>>)`, () =>
                expect(new ArrayListAdapter(q('some collection', p([]))).last(Ariana))
                    .to.be.rejectedWith(Error, `some collection [ ] is empty`)
            );
        });
    });

    /** @test {ArrayListAdapter#get} */
    describe('get(index)', () => {

        given(invalidExamples).
        it('complains when instantiated with a non-array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).get(Ariana, 1))
                .to.be.rejectedWith(Error, 'ArrayListAdapter constructor parameter should be an array')
        );

        given(answerables('array', array)).
        it('returns the required item from the underlying array', ({ answerable }) =>
            expect(new ArrayListAdapter(answerable).get(Ariana, 1))
                .to.eventually.deep.equal(array[1])
        );

        describe(`complains if the item doesn't exist at a given index`, () => {
            const example = ['first', 'second'];

            it(`(array)`, () =>
                expect(new ArrayListAdapter(example).get(Ariana, 42))
                    .to.be.rejectedWith(Error, `[ 'first', 'second' ] has no item at index 42`)
            );

            it(`(Question<array>)`, () =>
                expect(new ArrayListAdapter(q('some collection', example)).get(Ariana, 42))
                    .to.be.rejectedWith(Error, `some collection [ 'first', 'second' ] has no item at index 42`)
            );

            it(`(Promise<array>)`, () =>
                expect(new ArrayListAdapter(p(example)).get(Ariana, 42))
                    .to.be.rejectedWith(Error, `a Promise [ 'first', 'second' ] has no item at index 42`)
            );

            it(`(Question<Promise<array>>)`, () =>
                expect(new ArrayListAdapter(q('some collection', p(example))).get(Ariana, 42))
                    .to.be.rejectedWith(Error, `some collection [ 'first', 'second' ] has no item at index 42`)
            );
        });
    });
});
