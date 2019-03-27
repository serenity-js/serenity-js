import { Actor, Serenity, Stage } from '@serenity-js/core';
import { Clock, DressingRoom } from '@serenity-js/core/lib/stage';

class Extras implements DressingRoom {
    prepare(actor: Actor) {
        return actor;
    }
}

export function stage(actors: DressingRoom = new Extras(), clock: Clock = new Clock()): Stage {
    const serenity = new Serenity(clock);

    return serenity.callToStageFor(actors);
}
