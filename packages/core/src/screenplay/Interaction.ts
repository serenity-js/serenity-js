import { Activity } from './Activity';
import { Actor, AnswersQuestions, CollectsArtifacts, UsesAbilities } from './actor';

/**
 * @desc
 *  Directly exercises the {@link Actor}'s {@link Ability} to interact
 *  with the System Under Test.
 *
 * @implements {Activity}
 * @see {@link Ability}
 * @see {@link Actor}
 */
export abstract class Interaction implements Activity {
    static where(
        description: string,
        interaction: (actor: UsesAbilities & AnswersQuestions & CollectsArtifacts) => PromiseLike<void> | void,
    ): Interaction {
        return new DynamicallyGeneratedInteraction(description, interaction);
    }

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     * @see {@link UsesAbilities}
     * @see {@link AnswersQuestions}
     */
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

    /**
     * @desc
     *  Makes the provided {@link Actor}
     *  perform this {@link Interaction}.
     *
     * @param {Actor} actor
     * @returns {Promise<void>}
     *
     * @see {@link Actor}
     */
    performAs(actor: Actor): PromiseLike<void> {
        try {
            return Promise.resolve(this.interaction(actor));
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return this.description;
    }
}
