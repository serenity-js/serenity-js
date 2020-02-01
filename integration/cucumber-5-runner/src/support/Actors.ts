import { Actor, Cast } from '@serenity-js/core';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor;   // no-op actors with no special abilities
    }
}
