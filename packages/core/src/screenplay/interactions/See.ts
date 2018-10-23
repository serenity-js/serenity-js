import { AnswersQuestions, Interaction, Question } from '..';

export type Assertion<A>         = (actual: A) => void;

export class See<S> implements Interaction {
    static if<T>(question: Question<T>, assertion: Assertion<T>) {
        return new See<T>(question, assertion);
    }

    constructor(
        private question: Question<S>,
        private assert: Assertion<S>,
    ) {
    }

    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.question).then(this.assert);
    }

    toString = () => `#actor checks ${this.question}`;
}
