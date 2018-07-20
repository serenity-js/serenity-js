import { Ability, AbilityType } from '../Ability';

export interface UsesAbilities {
    /**
     * Gives an Actor the Abilities to perform Activities
     *
     * @param {Ability} abilities
     * @returns {UsesAbilities}
     */
    whoCan(...abilities: Ability[]): UsesAbilities;

    /**
     * Grants access to the Actor's ability
     *
     * @param {AbilityType<T extends Ability>} doSomething
     * @returns {T}
     */
    abilityTo<T extends Ability>(doSomething: AbilityType<T>): T;
}
