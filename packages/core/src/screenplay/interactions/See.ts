import { AnswersQuestions, Interaction, Question } from '..';

export type Assertion<A> = (actual: A) => void;

/**
 * @deprecated
 *  Use the <a href="/modules/assertions"><code>@serenity-js/assertions</code> module</a> instead
 */
export class See<S> extends Interaction {
    static if<T>(question: Question<T>, assertion: Assertion<T>): Interaction {
        return new See<T>(question, assertion);
    }

    constructor(
        private question: Question<S>,
        private assert: Assertion<S>,
    ) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Interaction}.
     *
     * @param {AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link AnswersQuestions}
     */
    performAs(actor: AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.question).then(this.assert);
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor checks ${this.question}`;
    }
}
