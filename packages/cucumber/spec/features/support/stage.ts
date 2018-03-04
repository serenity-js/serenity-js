import { serenity } from '@serenity-js/core';
import { Actor } from '@serenity-js/core/lib/screenplay';
import { Cast, Stage } from '@serenity-js/core/lib/stage';

class Actors implements Cast {
    private readonly actors: { [name: string]: Actor } = {};

    actor(name: string) {
        if (! this.actors[name]) {
            this.actors[name] = Actor.named(name);
        }

        return this.actors[name];
    }
}

export const stage: Stage = serenity.callToStageFor(new Actors());
