import { Actor } from '../screenplay';
import { Cast } from './Cast';

/**
 * @desc
 *  Produces no-op actors with no special {@link Ability}
 *
 * @private
 */
export class Extras implements Cast {
    prepare(actor: Actor): Actor {
        return actor;
    }
}
