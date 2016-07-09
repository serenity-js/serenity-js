import {UsesAbilities} from './actor';

export interface Ability {
    /**
     * Associates the Ability with an Actor
     *
     * @param vehicle
     */
    usedBy<U extends UsesAbilities, A extends Ability>(actor: U): A;
}
