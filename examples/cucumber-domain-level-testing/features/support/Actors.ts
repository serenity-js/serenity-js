import { Actor } from '@serenity-js/core';
import { Cast } from '@serenity-js/core/lib/stage';

export class Actors implements Cast {
    actor(name: string) {
        return Actor.named(name);
    }
}
