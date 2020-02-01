import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { ManageALocalServer } from '../abilities';

/**
 * @desc
 *  Starts the local server so that the test can interact with it.
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class StartLocalServer extends Interaction {

    /**
     * Starts the local test server on one of the available ports.
     *
     * @see {@link LocalServer#url}
     */
    static onRandomPort(): Interaction {
        return new StartLocalServer();
    }

    /**
     * Starts the local test server on one of the preferred ports.
     *
     * @param {Answerable<number[]>} preferredPorts
     *
     * @see {@link LocalServer#url}
     * @see {@link @serenity-js/core/lib/screenplay~Answerable}
     */
    static onOneOfThePreferredPorts(preferredPorts: Answerable<number[]>): Interaction {
        return new StartLocalServer(preferredPorts);
    }

    /**
     * @param {Answerable<number[]>} [preferredPorts=[]] preferredPorts
     *
     * @see {@link @serenity-js/core/lib/screenplay~Answerable}
     */
    constructor(private readonly preferredPorts: Answerable<number[]> = []) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & CollectsArtifacts & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~CollectsArtifacts}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.preferredPorts)
            .then(preferredPorts => ManageALocalServer.as(actor).listen(preferredPorts));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor starts the local server`;
    }
}
