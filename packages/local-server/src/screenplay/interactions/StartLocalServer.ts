import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { ManageALocalServer } from '../abilities';

export class StartLocalServer extends Interaction {
    static onRandomPort(): Interaction {
        return new StartLocalServer();
    }

    static onOneOfThePreferredPorts(preferredPorts: Answerable<number[]>): Interaction {
        return new StartLocalServer(preferredPorts);
    }

    constructor(private readonly preferredPorts: Answerable<number[]> = []) {
        super();
    }

    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        return actor.answer(this.preferredPorts)
            .then(preferredPorts => ManageALocalServer.as(actor).listen(preferredPorts));
    }

    toString() {
        return `#actor starts the local server`;
    }
}
