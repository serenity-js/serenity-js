import { Ability } from '../Ability';
import { UsesAbilities } from './UsesAbilities';

/**
 * @desc
 *  Enables the {@link Actor} to have an {@link Ability} or Abilities to perform some {@link Activity}.
 *
 * @public
 */
export interface CanHaveAbilities<Returned_Type = UsesAbilities> {
    /**
     * @param {Ability[]} abilities
     * @returns {Actor}
     */
    whoCan(...abilities: Ability[]): Returned_Type;
}
