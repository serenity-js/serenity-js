import { Actor, Serenity, Stage } from '@serenity-js/core';
import { Cast, Clock } from '@serenity-js/core/lib/stage';

class Extras implements Cast {
    prepare(actor: Actor) {
        return actor;
    }
}

export function stage(actors: Cast = new Extras(), clock: Clock = new Clock()): Stage {
    const serenity = new Serenity(clock);

    return serenity.callToStageFor(actors);
}
