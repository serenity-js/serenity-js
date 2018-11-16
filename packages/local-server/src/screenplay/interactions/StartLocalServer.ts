import { AnswersQuestions, CollectsArtifacts, Interaction, KnowableUnknown, UsesAbilities } from '@serenity-js/core';
import { ManageALocalServer } from '../abilities';

export class StartLocalServer implements Interaction {
    static onRandomPort(): Interaction {
        return new StartLocalServer();
    }

    static onOneOfThePreferredPorts(preferredPorts: KnowableUnknown<number[]>): Interaction {
        return new StartLocalServer(preferredPorts);
    }

    constructor(private readonly preferredPorts: KnowableUnknown<number[]> = []) {
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.preferredPorts)
            .then(preferredPorts => ManageALocalServer.as(actor).listen(preferredPorts));
    }

    toString() {
        return `#actor starts the local server`;
    }
}
