/* eslint-disable unicorn/consistent-function-scoping,unicorn/no-null */
import 'mocha';

import { given } from 'mocha-testdata';

import { actorCalled } from '../../src';
import { Mappable } from '../../src/io';
import { Actor, Question, replace, toNumber, trim } from '../../src/screenplay';
import { expect } from '../expect';

/** @test {Question} */
describe('Question', () => {

    describe('provides a convenient way to define a custom question that', () => {

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

        /** @test {Question.about} */
        /** @test {Question#toString} */
        it('has a description', () => {
            const Name = () =>
                Question.about('a name', (actor: Actor) => actor.name);

            expect(Name().toString()).to.equal('a name');
        });
    });

    /** @test {Question.about} */
    /** @test {Question#describedAs} */
    it('allows for a custom description to override the default one', () => {
        const Name = () =>
            Question.about('a name', (actor: Actor) => actor.name);

        expect(Name().describedAs('first name').toString())
            .to.equal('first name');
    });

    describe('when mapping the answer', () => {

        /** @test {Question.about} */
        /** @test {Question#map} */
        it('works with a static value', () => {

            const SomeResult = () =>
                Question.about('result of some calculation', (actor: Actor) => ' 6.67%\n');

            const endResult = SomeResult()
                .map(trim())
                .map(replace('%', ''))
                .map(toNumber())
                .answeredBy(actorCalled('Jacques'))

            return expect(endResult).to.eventually.equal(6.67);
        });

        /** @test {Question.about} */
        /** @test {Question#map} */
        it('works with a promise', () => {

            const SomeResult = () =>
                Question.about('result of some calculation', (actor: Actor) => Promise.resolve(' 6.67%\n'));

            const endResult = SomeResult()
                .map(trim())
                .map(replace('%', ''))
                .map(toNumber())
                .answeredBy(actorCalled('Jacques'))

            return expect(endResult).to.eventually.equal(6.67);
        });

        /** @test {Question.about} */
        /** @test {Question#map} */
        it('works with a static list of values', () => {
            const SomeResults = () =>
                Question.about<string[]>('results of some calculation', (actor: Actor) => [
                    ' 6.67%\n',
                    ' 3.34%\n',
                ]);

            const endResult = SomeResults()
                .map(trim())
                .map(replace('%', ''))
                .map(toNumber())
                .answeredBy(actorCalled('Jacques'))

            return expect(endResult).to.eventually.deep.equal([6.67, 3.34]);
        });

        /** @test {Question.about} */
        /** @test {Question#map} */
        it('works with a promised list', () => {
            const SomeResults = () =>
                Question.about<Promise<string[]>>('results of some calculation', (actor: Actor) => Promise.resolve([
                    ' 6.67%\n',
                    ' 3.34%\n',
                ]));

            const endResult = SomeResults()
                .map(trim())
                .map(replace('%', ''))
                .map(toNumber())
                .answeredBy(actorCalled('Jacques'))

            return expect(endResult).to.eventually.deep.equal([6.67, 3.34]);
        });

        /** @test {Question.about} */
        /** @test {Question#map} */
        it('works with a mappable collection (Array, ElementArrayFinder, etc.)', () => {
            const SomeResults = () =>
                Question.about<Mappable<string>>('results of some calculation', (actor: Actor) => [
                    ' 6.67%\n',
                    ' 3.34%\n',
                ]);

            const endResult = SomeResults()
                .map(trim())
                .map(replace('%', ''))
                .map(toNumber())
                .answeredBy(actorCalled('Jacques'))

            return expect(endResult).to.eventually.deep.equal([6.67, 3.34]);
        });
    });

    given([
        { isAQuestion: false, value: null                                           },
        { isAQuestion: false, value: false                                          },
        { isAQuestion: false, value: void 0                                         },
        { isAQuestion: false, value: ''                                             },
        { isAQuestion: false, value: {}                                             },
        { isAQuestion: false, value: 42                                             },
        { isAQuestion: false, value: () => void 0                                   },
        { isAQuestion: true,  value: Question.about('something', actor => void 0)   },
    ]).
    it('recognises if something is a question', ({ value, isAQuestion }) => {
        expect(Question.isAQuestion(value)).to.equal(isAQuestion);
    });
});
