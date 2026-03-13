import type { Actor } from '../screenplay/index.js';
import type { Cast } from './Cast.js';

/**
 * Produces no-op actors with no special [`Ability`](https://serenity-js.org/api/core/class/Ability/)
 */
export class Extras implements Cast {
    prepare(actor: Actor): Actor {
        return actor;
    }
}
