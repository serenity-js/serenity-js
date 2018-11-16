import { AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { ManageALocalServer } from '../abilities';

export class StopLocalServer implements Interaction {
    static ifRunning(): Interaction {
        return new StopLocalServer();
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return ManageALocalServer.as(actor).mapInstance(server => new Promise((resolve, reject) => {
            server.close((error: Error) => {
                if (!! error) {
                    return reject(error);
                }

                return resolve();
        });
    }));
    }

    toString() {
        return `#actor stops the local server`;
    }
}
