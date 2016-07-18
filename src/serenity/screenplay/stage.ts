import { Actor } from './actor';

export interface Cast {
    actor(name: string): Actor;
}

export class Stage {

    private actorInTheSpotlight: Actor;

    constructor(private cast: Cast) {
    }

    theActorCalled(actorName: string): Actor {
        this.actorInTheSpotlight = this.cast.actor(actorName);

        return this.actorInTheSpotlight;
    }

    theShowHasStarted(): boolean {
        return !! this.actorInTheSpotlight;
    }

    theActorInTheSpotlight(): Actor {
        if (! this.theShowHasStarted()) {
            throw new Error('There\'s no actor on the stage.');
        }

        return this.actorInTheSpotlight;
    }
}
