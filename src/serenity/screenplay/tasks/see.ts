import { AnswersQuestions, Performable, Question } from '..';
import { Assertion } from '../expectations';

export class See<S> implements Performable {
    static if = <T>(question: Question<T>, assertion: Assertion<T>) => new See<T>(question, assertion);

    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return this.assert(actor.toSee(this.question));
    }

    constructor(private question: Question<S>, private assert: Assertion<S>) {
    }
}
