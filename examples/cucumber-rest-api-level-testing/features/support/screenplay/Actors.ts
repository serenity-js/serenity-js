import { Actor, Cast } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';

export class Actors implements Cast {
    actor(name: string) {
        return Actor.named(name).whoCan(
            // todo add express restart ability
            CallAnApi.at('http://localhost:3000'),
        );
    }
}
