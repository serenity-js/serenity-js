import { AnswersQuestions, UsesAbilities } from './actor';

export abstract class Question<T> {
    static about<R>(description: string, body: (actor: AnswersQuestions & UsesAbilities) => R): Question<R> {
        return new AnonymousQuestion<R>(description, body);
    }

    /**
     * @desc
     *  Checks if the value is a {@link Question}
     *
     * @param maybeQuestion
     * @returns {boolean}
     */
    static isAQuestion<T>(maybeQuestion: any): maybeQuestion is Question<T> {
        return !! (maybeQuestion as any).answeredBy;
    }

    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;
}

/**
 * @package
 */
class AnonymousQuestion<T> implements Question<T> {
    constructor(private description: string, private body: (actor: AnswersQuestions & UsesAbilities) => T) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities) {
        return this.body(actor);
    }

    toString() {
        return this.description;
    }
}
