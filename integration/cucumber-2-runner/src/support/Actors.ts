import { Actor, DressingRoom } from '@serenity-js/core';

export class Actors implements DressingRoom {
    prepare(actor: Actor): Actor {
        return actor;   // no-op actors with no special abilities
    }
}
