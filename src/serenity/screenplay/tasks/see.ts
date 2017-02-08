import { AnswersQuestions, Performable, Question } from '..';
import { step } from '../../recording/step_annotation';
import { Assertion } from '../expectations';

export class See<S> implements Performable {
    static that<T>(question: Question<T>, assertion: Assertion<T>) {
        return new See<T>(question, assertion);
    }

    @step('{0} looks at #question')
    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return this.assert(actor.toSee(this.question));
    }

    constructor(private question: Question<S>, private assert: Assertion<S>) {
    }
}
