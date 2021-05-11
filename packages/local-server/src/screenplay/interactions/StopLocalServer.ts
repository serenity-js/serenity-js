import { AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';

import { ManageALocalServer } from '../abilities';

/**
 * @desc
 *  Stops the local server. Should be used in `afterEach` block to make sure that the server
 *  is correctly shut down even when the test fails.
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class StopLocalServer extends Interaction {

    /**
     * Stops the server if it's running. If the server hasn't been started, this interaction does nothing.
     */
    static ifRunning(): Interaction {
        return new StopLocalServer();
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
        return ManageALocalServer.as(actor).mapInstance(server => new Promise((resolve, reject) => {
            if (! server.address()) {
                return resolve();
            }

            server.shutdown((error: Error) =>
                error
                    ? reject(error)
                    : resolve()
            );
        }));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor stops the local server`;
    }
}
