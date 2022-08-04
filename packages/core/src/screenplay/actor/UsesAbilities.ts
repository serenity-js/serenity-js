import { Ability } from '../Ability';
import { AbilityType } from '../AbilityType';

/**
 * Describes an {@link Actor} who can use their {@link Ability|abilities} to perform an {@link Activity}
 * or answer a {@link Question}.
 *
 * ## Learn more
 *
 * - {@link Ability}
 * - {@link Actor}
 *
 * @group Actors
 */
export interface UsesAbilities {

    /**
     * Provides access to the {@link Actor|actor's} {@link Ability} to do something
     *
     * @param doSomething
     *  The type of ability to look up, e.g. {@link BrowseTheWeb} or {@link CallAnApi}
     */
    abilityTo<T extends Ability>(doSomething: AbilityType<T>): T;
}
