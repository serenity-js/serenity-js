import 'mocha';

import { Actor, Question } from '@serenity-js/core';

import { expect } from '@integration/testing-tools';
import { given } from 'mocha-testdata';
import { equals, NoAnswerFound, Pick, startsWith } from '../src';

describe('Pick', () => {

    const Alexandra = Actor.named('Alexandra');

    interface Animal {
        name: string;
        sound: string;
    }

    const animals = [
        {
            name: 'bird',
            sound: 'tweet',
        },
        {
            name: 'dog',
            sound: 'woof',
        },
        {
            name: 'tiger',
            sound: 'roar',
        },
        {
            name: 'dinosaur',
            sound: 'roar',
        },
    ];

    const Sound = {
        of: (animal: Animal) => Question.about<string>(`the sound a ${ animal.name } makes`, actor => animal.sound),
    };

    const Name = {
        of: (animal: Animal) => Question.about<string>(`the name of an animal`, actor => animal.name),
    };

    const AsyncName = {
        of: (animal: Animal) => Question.about<Promise<string>>(`the name of a ${ animal.name }`, actor => Promise.resolve(animal.name)),
    };

    describe('when no filters are applied', () => {

        const picked = Pick.from(q(p(animals)));

        it('knows how many answers there are in the list', () =>
            expect(picked.count().answeredBy(Alexandra)).to.eventually.equal(animals.length));

        it('picks all answers from the list', () =>
            expect(picked.all().answeredBy(Alexandra)).to.eventually.deep.equal(animals));

        it('picks the first answer from the list', () =>
            expect(picked.first().answeredBy(Alexandra)).to.eventually.deep.equal(animals[ 0 ]));

        it('picks the last answer from the list', () =>
            expect(picked.last().answeredBy(Alexandra)).to.eventually.deep.equal(animals[ animals.length - 1 ]));

        it('picks the nth answer from the list', () =>
            expect(picked.get(1).answeredBy(Alexandra)).to.eventually.deep.equal(animals[ 1 ]));
    });

    describe('when a filter is applied', () => {

        const
            picked = Pick.from(q(p(animals))).where(Sound.of, equals('roar')),
            expected = animals.filter(a => a.sound === 'roar');

        it('knows how many answers there are in the list', () =>
            expect(picked.count().answeredBy(Alexandra)).to.eventually.equal(expected.length));

        it('picks all answers from the list', () =>
            expect(picked.all().answeredBy(Alexandra)).to.eventually.deep.equal(expected));

        it('picks the first answer from the list', () =>
            expect(picked.first().answeredBy(Alexandra)).to.eventually.deep.equal(expected[ 0 ]));

        it('picks the last answer from the list', () =>
            expect(picked.last().answeredBy(Alexandra)).to.eventually.deep.equal(expected[ expected.length - 1 ]));

        it('picks the nth answer from the list', () =>
            expect(picked.get(1).answeredBy(Alexandra)).to.eventually.deep.equal(expected[ 1 ]));
    });

    describe('when multiple filters are applied', () => {

        const
            picked = Pick.from(q(p(animals))).where(Sound.of, equals('roar')).where(Name.of, startsWith('tig')),
            expected = [ { name: 'tiger', sound: 'roar' } ];

        it('knows how many answers there are in the list', () =>
            expect(picked.count().answeredBy(Alexandra)).to.eventually.equal(expected.length));

        it('picks all answers from the list', () =>
            expect(picked.all().answeredBy(Alexandra)).to.eventually.deep.equal(expected));

        it('picks the first answer from the list', () =>
            expect(picked.first().answeredBy(Alexandra)).to.eventually.deep.equal(expected[ 0 ]));

        it('picks the last answer from the list', () =>
            expect(picked.last().answeredBy(Alexandra)).to.eventually.deep.equal(expected[ expected.length - 1 ]));

        it('picks the nth answer from the list', () =>
            expect(picked.get(0).answeredBy(Alexandra)).to.eventually.deep.equal(expected[ 0 ]));
    });

    describe('when both sync and async filters are applied', () => {

        const
            picked = Pick.from(q(p(animals))).where(Sound.of, equals('roar')).where(AsyncName.of, startsWith('tig')),
            expected = [ { name: 'tiger', sound: 'roar' } ];

        it('knows how many answers there are in the list', () =>
            expect(picked.count().answeredBy(Alexandra)).to.eventually.equal(expected.length));

        it('picks all answers from the list', () =>
            expect(picked.all().answeredBy(Alexandra)).to.eventually.deep.equal(expected));

        it('picks the first answer from the list', () =>
            expect(picked.first().answeredBy(Alexandra)).to.eventually.deep.equal(expected[ 0 ]));

        it('picks the last answer from the list', () =>
            expect(picked.last().answeredBy(Alexandra)).to.eventually.deep.equal(expected[ expected.length - 1 ]));

        it('picks the nth answer from the list', () =>
            expect(picked.get(0).answeredBy(Alexandra)).to.eventually.deep.equal(expected[ 0 ]));
    });

    describe('provides a sensible description', () => {

        describe('when no filters are applied and Pick', () => {

            const picked = Pick.from(q(p(animals)));

            it('returns the number of answers', () =>
                expect(picked.count().toString()).to.equal('number of the animals'));

            it('picks all the items', () =>
                expect(picked.all().toString()).to.equal('all of the animals'));

            it('picks the first item', () =>
                expect(picked.first().toString()).to.equal('first of the animals'));

            it('picks the last item', () =>
                expect(picked.last().toString()).to.equal('last of the animals'));

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
            it('picks the nth item', ({ description, index }) => {

                const question = Question.about<string[]>('the alphabet letters', actor => 'abcdefghijklmnopqrstuvwxyz'.split(''));

                expect(Pick.from(question).get(index).toString()).to.equal(`${ description } of the alphabet letters`);
            });
        });
    });

    describe('when there are no answers', () => {

        const picked = Pick.from(q([]));

        it('complains when you try to access the first one', () =>
            expect(picked.first().answeredBy(Alexandra)).to.eventually.be.rejectedWith(NoAnswerFound, `There's no first of the animals`));

        it('complains when you try to access the last one', () =>
            expect(picked.last().answeredBy(Alexandra)).to.eventually.be.rejectedWith(NoAnswerFound, `There's no last of the animals`));

        it('complains when you try to access the nth one', () =>
            expect(picked.get(1).answeredBy(Alexandra)).to.eventually.be.rejectedWith(NoAnswerFound, `There's no 2nd of the animals`));

        it('returns a count of 0', () =>
            expect(picked.count().answeredBy(Alexandra)).to.eventually.equal(0));

        it('returns an empty list when asked for all the answers', () =>
            expect(picked.all().answeredBy(Alexandra)).to.eventually.deep.equal([]));
    });

    function p<T>(value: T) {
        return Promise.resolve(value);
    }

    function q<T>(value: T): Question<T> {
        return Question.about(`the animals`, actor => value);
    }
});
