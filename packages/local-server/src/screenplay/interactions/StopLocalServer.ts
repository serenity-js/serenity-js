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
     * Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~UsesAbilities & @serenity-js/core/lib/screenplay/actor~CollectsArtifacts & @serenity-js/core/lib/screenplay/actor~AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay~Actor}
     */
    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return ManageALocalServer.as(actor).mapInstance(server => new Promise((resolve, reject) => {
            server.shutdown((error: Error) => {
                if (!! error) {
                    return reject(error);
                }

                return resolve();
            });
        }));
    }

    /**
     * Description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Interaction}.
     */
    toString() {
        return `#actor stops the local server`;
    }
}
