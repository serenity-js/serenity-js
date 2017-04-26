import { AnswersQuestions, Interaction, Question } from '..';
import { Assertion } from '../expectations';

export class See<S> implements Interaction {
    static if = <T>(question: Question<T>, assertion: Assertion<T>) => new See<T>(question, assertion);

    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return this.assert(actor.toSee(this.question));
    }

    constructor(private question: Question<S>, private assert: Assertion<S>) {
    }

    toString = () => `{0} checks ${this.question}`;
}
