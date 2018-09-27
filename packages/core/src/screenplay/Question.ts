import { AnswersQuestions, UsesAbilities } from './actor';

export abstract class Question<T> {
    static about<R>(description: string, body: (actor: AnswersQuestions & UsesAbilities) => R): Question<R> {
        return new AnonymousQuestion<R>(description, body);
    }

    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;
}

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
