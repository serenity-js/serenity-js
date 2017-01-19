import { AnswersQuestions, Performable, Question } from '..';
import { step } from '../../recording/step_annotation';

export type AssertionFn<S> = (subject: S) => PromiseLike<void>;

export class See<S> implements Performable {
    static that<S>(subject: Question<S>, verifier: AssertionFn<S>) {
        return new See(subject, verifier);
    }

    @step('{0} looks at #question')
    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return this.assert(actor.toSee(this.question));
    }

    constructor(private question: Question<S>, private assert: AssertionFn<S>) {
    }
}
