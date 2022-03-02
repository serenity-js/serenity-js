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
     *  Provides access to the {@link Actor}'s {@link Ability} to do something
     *
     * @type {function<T extends Ability>(doSomething: AbilityType<T>): T}
     * @public
     */
    abilityTo: <T extends Ability>(doSomething: AbilityType<T>) => T;
}
