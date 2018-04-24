import 'mocha';
import { given } from 'mocha-testdata';
import * as sinon from 'sinon';

import { Actor, Check, Interaction, Question } from '../../src/screenplay';
import expect = require('../expect');

describe('Check', () => {

    const Nick = Actor.named('Nick');

    const Call = (fn: () => void) => Interaction.where(`#actor triggers a function`, actor => {
        return Promise.resolve(fn());
    });

    const QuestionReturning = <T>(v: T) => Question.about<T>(`testing`, actor => v);

    const expectYays = (spy: sinon.SinonSpy) => expect(spy).to.have.been.calledWith('Yay!').callCount(3);
    const expectNoes = (spy: sinon.SinonSpy) => expect(spy).to.have.been.calledWith('Oh noes!').callCount(2);

    const examples: Array<{ 0: boolean | Question<boolean> | Question<PromiseLike<boolean>>, 1: any }> = [
        [ true, expectYays ],
        [ false, expectNoes ],
        [ QuestionReturning(true), expectYays ],
        [ QuestionReturning(false), expectNoes ],
        [ QuestionReturning(Promise.resolve(true)), expectYays ],
        [ QuestionReturning(Promise.resolve(false)), expectNoes ],
    ];

    given(examples).it(`triggers activities in the appropriate branch depending on the condition`, (condition, expectation) => {

        const spy = sinon.spy();

        return expect(Nick.attemptsTo(
            Check.whether(condition)
                .andIfSo(
                    Call(() => spy(`Yay!`)),
                    Call(() => spy(`Yay!`)),
                    Call(() => spy(`Yay!`)),
                )
                .otherwise(
                    Call(() => spy(`Oh noes!`)),
                    Call(() => spy(`Oh noes!`)),
                ),
        )).to.be.eventually.fulfilled.then(() => expectation(spy));
    });
});
