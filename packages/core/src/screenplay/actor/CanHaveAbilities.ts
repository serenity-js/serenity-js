import { Ability } from '../Ability';
import { UsesAbilities } from './UsesAbilities';

/**
 * @desc
 *  Enables the {@link Actor} to have an {@link Ability} or abilities to perform some {@link Activity}.
 *
 * @public
 */
export interface CanHaveAbilities<Returned_Type = UsesAbilities> {
    /**
     * @desc
     *  Assigns an {@link Ability} or several abilities to the {@link Actor}
     *
     * @type {function(...abilities: Ability[]): Returned_Type}
     */
    whoCan: (...abilities: Ability[]) => Returned_Type;
}
