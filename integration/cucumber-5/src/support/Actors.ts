import { Actor, Cast } from '@serenity-js/core';

export class Actors extends Cast {
    prepare(actor: Actor): Actor {
        return actor;   // no-op actors with no special abilities
    }
}
