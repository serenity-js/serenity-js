import { AnswersQuestions, Interaction, Question } from '..';
import { ActivityType, step } from '../../recording';
import { Assertion } from '../expectations';

export class See<S> implements Interaction {
    static if = <T>(question: Question<T>, assertion: Assertion<T>) => new See<T>(question, assertion);

    @step('{0} checks #question', ActivityType.Interaction)
    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return this.assert(actor.toSee(this.question));
    }

    constructor(private question: Question<S>, private assert: Assertion<S>) {
    }
}
