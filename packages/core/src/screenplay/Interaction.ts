import { ArtifactGenerated } from '../events';
import { serenity } from '../index';
import { Artifact, Name } from '../model';
import { StageManager } from '../stage';
import { Activity } from './Activity';
import { AnswersQuestions, UsesAbilities } from './actor';

export type EmitArtifact = (artifact: Artifact, name?: string) => void;

export abstract class Interaction implements Activity {
    static where(
        description: string,
        interaction: (actor: UsesAbilities & AnswersQuestions, emitArtifact?: EmitArtifact) => PromiseLike<void> | void,
    ): Interaction {
        return new AnonymousInteraction(description, interaction, serenity.stageManager);
    }

    abstract performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void>;
}

class AnonymousInteraction implements Interaction {
    constructor(
        private readonly description: string,
        private readonly interaction: (actor: UsesAbilities & AnswersQuestions, emitArtifact?: EmitArtifact) => PromiseLike<void> | void,
        private readonly stageManager: StageManager) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        try {
            return Promise.resolve(this.interaction(actor, (artifact: Artifact, name?: string) => {
                this.stageManager.notifyOf(new ArtifactGenerated(
                    new Name(name || artifact.constructor.name),
                    artifact,
                ));
            }));
        } catch (error) {
            return Promise.reject(error);
        }
    }

    toString() {
        return this.description;
    }
}
