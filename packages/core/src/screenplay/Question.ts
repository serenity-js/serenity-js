import { UsesAbilities } from './actor';

export abstract class Question<T> {
    static about<R>(description: string, body: (actor: UsesAbilities) => R): Question<R> {
        return new AnonymousQuestion<R>(description, body);
    }

    abstract answeredBy(actor: UsesAbilities): T;
}

class AnonymousQuestion<T> implements Question<T> {
    constructor(private description: string, private body: (actor: UsesAbilities) => T) {
    }

    answeredBy(actor: UsesAbilities) {
        return this.body(actor);
    }

    toString() {
        return this.description;
    }
}
