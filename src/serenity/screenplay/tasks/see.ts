import { AnswersQuestions, Performable, Question } from '..';
import { step } from '../../../screenplay';

export type Expectation<S> = (subject: S) => PromiseLike<void>;

export class See<S> implements Performable {
    static that<S>(subject: Question<S>, verifier: Expectation<S>) {
        return new See(subject, verifier);
    }

    @step('{0} looks at #question')
    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return this.expect(actor.toSee(this.question));
    }

    constructor(private question: Question<S>, private expect: Expectation<S>) {
    }
}
