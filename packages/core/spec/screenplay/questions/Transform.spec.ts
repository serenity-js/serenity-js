/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { given } from 'mocha-testdata';
import * as sinon from 'sinon';

import { Actor, Answerable, Question, Transform } from '../../../src/screenplay';
import { Stage } from '../../../src/stage';
import { expect } from '../../expect';

/** @test {TransformAnswer} */
describe('TransformAnswer', () => {

    const stage = sinon.createStubInstance(Stage);

    const expectedAnswer = {
        headers: { header: 'value' },
        body: 'some content',
    };

    type EA = typeof expectedAnswer;

    const actor = new Actor('Bumblebee', stage as unknown as Stage);

    given([
        expectedAnswer,
        p(expectedAnswer),
        q(expectedAnswer),
        q(p(expectedAnswer)),
    ]).
    it('transforms an answer to Answerable<T> to another type', (answerable: Answerable<EA>) =>
        expect(
            Transform.the(answerable, complexObject => complexObject.headers.header).answeredBy(actor),
        ).to.eventually.equal(expectedAnswer.headers.header)
    );

    it('transforms answers to Array<Answerable<T>> to another type', () =>
        expect(
            Transform.the(
                [ q(p(expectedAnswer)), q(expectedAnswer), expectedAnswer],
                (ea1: EA, ea2: EA, ea3: EA) => ea1.headers.header + ea2.body + Object.keys(ea3).length,
            ).answeredBy(actor),
        ).to.eventually.equal(expectedAnswer.headers.header + expectedAnswer.body + Object.keys(expectedAnswer).length)
    );

    it('transforms answers to questions of different types to another type', () =>
        expect(
            Transform.the(
                [ q('the answer to life the universe and everything'), q(p(42)) ],
                (a1: string, a2: number) => `${ a1 } is ${ a2 }`,
            ).answeredBy(actor),
        ).to.eventually.equal(`the answer to life the universe and everything is 42`)
    );

    it('provides a sensible default description', () => {
        expect(Transform.the(expectedAnswer, _ => _).toString()).to.equal('a transformed answer');
    });

    it('allows for the default description to be changed', () => {
        expect(Transform.the(expectedAnswer, _ => _).as('a better description').toString()).to.equal('a better description');
    });

    function q<T>(value: T): Question<T> {
        return Question.about(`something`, someActor => value);
    }

    function p<T>(value: T) {
        return Promise.resolve(value);
    }
});
