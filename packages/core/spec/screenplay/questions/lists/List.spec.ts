/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled, Answerable, AnswersQuestions, Expectation, List, Question, UsesAbilities } from '../../../../src';
import { formatted } from '../../../../src/io';
import { expect } from '../../../expect';
import { isIdenticalTo } from '../../../isIdenticalTo';

/** @test {List} */
describe('List', () => {

    const Lisa = actorCalled('Lisa');

    const q = <T>(value: T) =>
        Question.about<T>('some string collection', actor => value);

    const p = <T>(value: T) =>
        Promise.resolve(value);

    const isGreaterThan = (expected: number) =>
        Expectation.thatActualShould('have value greater than', expected)
            .soThat((actualValue: number, expectedValue: number) => actualValue > expectedValue);

    /** @test {List#of} */
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
            expect(List.of(answerable).answeredBy(Lisa))
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

        /** @test {List#toString} */
        describe('provides a sensible description when it', () => {

            given(examples).
            it('returns the number of items', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).count().toString())
                    .to.equal(`the number of ${ collectionDescription }`)
            );

            given(examples).
            it('returns the underlying collection', ({ answerable, collectionDescription }: { answerable: Answerable<string[]>, collectionDescription: string }) =>
                expect(List.of(answerable).toString())
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

        /** @test {List#where} */
        describe('and using filters', () => {
            interface Person {
                name: string;
                age: number;
                pets: number;
            }

            const
                alice   = { name: 'Alice',  age: 27, pets: 3 },
                bob     = { name: 'Bob',    age: 42, pets: 1 },
                cindy   = { name: 'Cindy',  age: 55, pets: 3 };

            const people = [ alice, bob, cindy ];

            class Name extends Question<Promise<string>> {
                static of(person: Answerable<Person>): Question<Promise<string>> {
                    return new Name(person);
                }

                constructor(private readonly person: Answerable<Person>) {
                    super(formatted `the name of ${ person }`);
                }

                answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
                    return actor.answer(this.person)
                        .then(person => person.name);
                }
            }

            const PropertyCalled = <K extends keyof Person>(name: K) => ({
                of: (person: Answerable<Person>) =>
                    Question.about(formatted `${ name } of ${ person }`, actor => {
                        return actor.answer(person).then(answer => answer[name]);
                    }),
                toString() {
                    return `property "${ name }"`;
                }
            });

            /** @test {List#of} */
            it('lets you narrow down the list of items to those that match the filter', async () => {
                const found = await List.of(people)
                    .where(Name, isIdenticalTo('Bob'))
                    .first()
                    .answeredBy(Lisa);

                expect(found).to.deep.equal(bob);
            });

            /** @test {List#of} */
            it('lets you narrow down the list of items to those that match the filter', async () => {
                const found = await List.of(people)
                    .where(Name, isIdenticalTo('Bob'))
                    .first()
                    .answeredBy(Lisa);

                expect(found).to.deep.equal(bob);
            });

            /** @test {List#of} */
            it('lets you narrow down the list of items to those that match several filters', async () => {
                const found = await List.of(people)
                    .where(PropertyCalled('pets'), isIdenticalTo(3))
                    .where(PropertyCalled('age'), isGreaterThan(30))
                    .first()
                    .answeredBy(Lisa);

                expect(found).to.deep.equal(cindy);
            });

            /** @test {List#of} */
            it('describes the filters applied', () => {
                const People = () =>
                    Question.about('people', actor => people);

                const items = List.of(People())
                    .where(PropertyCalled('pets'), isIdenticalTo(3))
                    .where(PropertyCalled('age'), isGreaterThan(30))
                    .first();

                expect(items.toString())
                    .to.equal('the first of people where property "pets" does have value identical to 3 and property "age" does have value greater than 30')
            });
        });
    });
});
