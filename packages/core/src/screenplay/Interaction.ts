import { Activity } from './Activity';
import { Actor, AnswersQuestions, CollectsArtifacts, UsesAbilities } from './actor';

export abstract class Interaction implements Activity {
    static where(
        description: string,
        interaction: (actor: UsesAbilities & AnswersQuestions & CollectsArtifacts) => PromiseLike<void> | void,
    ): Interaction {
        return new DynamicallyGeneratedInteraction(description, interaction);
    }

    abstract performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void>;
}

/**
 * @package
 */
class DynamicallyGeneratedInteraction extends Interaction {
    constructor(
        private readonly description: string,
        private readonly interaction: (actor: UsesAbilities & AnswersQuestions & CollectsArtifacts) => PromiseLike<void> | void,
    ) {
        super();
    }

    performAs(actor: Actor): PromiseLike<void> {
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
