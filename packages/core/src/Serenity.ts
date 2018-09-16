import { Cast, Stage, StageManager } from './stage';

export class Serenity {
    constructor(public readonly stageManager: StageManager) {
    }

    callToStageFor(actors: Cast): Stage {
        return new Stage(actors);
    }

    // todo: add "configure"
}
