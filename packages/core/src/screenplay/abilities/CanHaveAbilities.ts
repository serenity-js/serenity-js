import { Ability } from './Ability';
import { UsesAbilities } from './UsesAbilities';

/**
 * Describes an {@apilink Actor} who can have an {@apilink Ability} to perform some {@apilink Activity}.
 *
 * ## Learn more
 *
 * - {@apilink Ability}
 * - {@apilink Actor}
 *
 * @group Actors
 */
export interface CanHaveAbilities<Returned_Type = UsesAbilities> {

    /**
     * Assigns an {@apilink Ability} or several abilities to the {@apilink Actor}
     */
    whoCan(...abilities: Ability[]): Returned_Type;
}
