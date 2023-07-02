import type { Actor } from '../screenplay';
import type { Cast } from './Cast';

/**
 * Produces no-op actors with no special {@apilink Ability}
 */
export class Extras implements Cast {
    prepare(actor: Actor): Actor {
        return actor;
    }
}
