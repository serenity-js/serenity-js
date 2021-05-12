import { Ability } from '../Ability';
import { AbilityType } from '../AbilityType';

/**
 * @desc
 *  Enables the {@link Actor} to use an {@link Ability} to perform some {@link Activity}.
 *
 * @public
 */
export interface UsesAbilities {

    /**
     * @desc
     *  Grants access to the Actor's ability
     *
     * @param {AbilityType<T extends Ability>} doSomething
     * @returns {T}
     */
    abilityTo<T extends Ability>(doSomething: AbilityType<T>): T;
}
