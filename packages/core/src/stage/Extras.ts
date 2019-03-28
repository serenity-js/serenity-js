import { Actor } from '../screenplay';
import { DressingRoom } from './DressingRoom';

/**
 * @desc
 *  Produces no-op actors with no special {@link Ability}
 *
 * @private
 */
export class Extras implements DressingRoom {
    prepare(actor: Actor): Actor {
        return actor;
    }
}
