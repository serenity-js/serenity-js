import { Ability } from '../Ability';
import { AbilityType } from '../AbilityType';

/**
 * Describes an {@apilink Actor} who can use their {@apilink Ability|abilities} to perform an {@apilink Activity}
 * or answer a {@apilink Question}.
 *
 * ## Learn more
 *
 * - {@apilink Ability}
 * - {@apilink Actor}
 *
 * @group Actors
 */
export interface UsesAbilities {

    /**
     * Provides access to the {@apilink Actor|actor's} {@apilink Ability} to do something
     *
     * @param doSomething
     *  The type of ability to look up, e.g. {@apilink BrowseTheWeb} or {@apilink CallAnApi}
     */
    abilityTo<T extends Ability>(doSomething: AbilityType<T>): T;
}
