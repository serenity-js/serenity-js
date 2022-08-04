import { Ability } from '../Ability';
import { UsesAbilities } from './UsesAbilities';

/**
 * Describes an {@link Actor} who can have an {@link Ability} to perform some {@link Activity}.
 *
 * ## Learn more
 *
 * - {@link Ability}
 * - {@link Actor}
 *
 * @group Actors
 */
export interface CanHaveAbilities<Returned_Type = UsesAbilities> {

    /**
     * Assigns an {@link Ability} or several abilities to the {@link Actor}
     */
    whoCan(...abilities: Ability[]): Returned_Type;
}
