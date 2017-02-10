import { Actor } from '../screenplay/actor';
import { StageManager } from './stage_manager';

/// [cast]
export interface Cast {
    actor(name: string): Actor;
}
/// [cast]

export class Stage {

    private cast: Cast;
    private actorInTheSpotlight: Actor;

    constructor(public manager: StageManager) {
    }

    enter(cast: Cast) {
        this.cast = cast;

        return this;
    }

    theActorCalled(actorName: string): Actor {
        if (! this.actorsAreReady()) {
            throw new Error('The cast has not entered the stage yet.');
        }

        this.actorInTheSpotlight = this.cast.actor(actorName);

        return this.actorInTheSpotlight;
    }

    theShowHasStarted(): boolean {
        return !! this.actorInTheSpotlight;
    }

    theActorInTheSpotlight(): Actor {
        if (! this.theShowHasStarted()) {
            throw new Error('There\'s no actor in the spotlight yet.');
        }

        return this.actorInTheSpotlight;
    }

    actorsAreReady(): boolean {
        return !! this.cast;
    }
}
