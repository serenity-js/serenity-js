import { Activity } from './Activity';
import { AnswersQuestions, UsesAbilities } from './actor';

export abstract class Interaction implements Activity {
    static where(description: string, interaction: (actor: UsesAbilities & AnswersQuestions) => PromiseLike<void> | void): Interaction {
        return new AnonymousInteraction(description, interaction);
    }

    abstract performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void>;
}

class AnonymousInteraction implements Interaction {
    constructor(private description: string, private interaction: (actor: UsesAbilities & AnswersQuestions) => PromiseLike<void> | void) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        try {
            return Promise.resolve(this.interaction(actor));
        } catch (error) {
            return Promise.reject(error);
        }
    }

    toString() {
        return this.description;
    }
}
