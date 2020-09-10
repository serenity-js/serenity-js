import 'mocha';
import { actorCalled } from '../../src';
import { Actor, Question } from '../../src/screenplay';

import { expect } from '../expect';

describe('Question', () => {

    describe('provides a convenient way to define a custom question that', () => {

        it('returns a static value', () => {
            const Name = () =>
                Question.about('a name', (actor: Actor) => actor.name);

            const answer = Name().answeredBy(actorCalled('Jacques'));

            expect(answer).to.equal('Jacques');
        });

        it('returns a Promise of a value', () => {
            const Name = () =>
                Question.about('a name', (actor: Actor) => Promise.resolve(actor.name));

            const answer = Name().answeredBy(actorCalled('Jill'));

            return expect(answer).to.eventually.equal('Jill');
        });

        it('has a description', () => {
            const Name = () =>
                Question.about('a name', (actor: Actor) => actor.name);

            expect(Name().toString()).to.equal('a name');
        });
    });

    it('allows for a custom description to override the default one', () => {
        const Name = () =>
            Question.about('a name', (actor: Actor) => actor.name);

        expect(Name().describedAs('first name').toString())
            .to.equal('first name');
    });

    it('allows for a custom description to override the default one without affecting the original question', () => {
        const Name      = Question.about('a name', (actor: Actor) => actor.name);
        const FirstName = Name.describedAs('first name');

        expect(Name.toString()).to.equal('a name');
        expect(FirstName.toString()).to.equal('first name');
    });
});
