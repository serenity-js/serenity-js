import { Cast, Stage, StageManager } from './stage';

export class Serenity {
    constructor(
        public readonly stageManager: StageManager, // todo: could this be private?
    ) {
        // todo: take Clock so that it can be passed to the Stage and therefore the Actors too?
    }

    callToStageFor(actors: Cast): Stage {
        return new Stage(actors, this.stageManager);
    }

    // todo: add "configure"
}
