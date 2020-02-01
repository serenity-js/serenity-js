import { Actor } from './screenplay/actor';
import { Serenity } from './Serenity';
import { SerenityConfig } from './SerenityConfig';
import { Cast, Clock } from './stage';

const clock = new Clock();

export const serenity = new Serenity(clock);

/**
 * @desc
 *  Configure Serenity/JS
 *
 * @param {SerenityConfig} config
 * @return {void}
 */
export function configure(config: SerenityConfig) {
    return serenity.configure(config);
}

export function engage(actors: Cast) {
    return serenity.engage(actors);
}

export function actorCalled(name: string): Actor {
    return serenity.theActorCalled(name);
}

export function actorInTheSpotlight(): Actor {
    return serenity.theActorInTheSpotlight();
}
