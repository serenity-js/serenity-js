import { AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';

import { ManageALocalServer } from '../abilities';

/**
 * Stops the local server. Should be used in `afterEach` block to make sure that the server
 * is correctly shut down even when the test fails.
 *
 * @group Activities
 */
export class StopLocalServer extends Interaction {

    /**
     * Stops the server if it's running. If the server hasn't been started, this interaction does nothing.
     */
    static ifRunning(): Interaction {
        return new StopLocalServer(`#actor stops the local server`);
    }

    /**
     * @inheritDoc
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
}
