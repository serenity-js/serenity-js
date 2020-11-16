import { Ability } from './Ability';
import { UsesAbilities } from './actor';

/**
 * @desc
 *  An interface describing the static access method that every {@link Ability} class
 *  needs to provide in order to be accessible from within an {@link Interaction}.
 */
export interface AbilityType<A extends Ability> extends Function {

    /**
     * @desc
     *  Retrieves the Ability in question from the {@link Actor}, provided that the {@link Actor} has it.
     *
     * @example
     * import { Ability, Actor, Interface } from '@serenity-js/core';
     *
     * class MakePhoneCalls implements Ability {
     *     static as(actor: UsesAbilities): MakesPhoneCalls {
     *         return actor.abilityTo(MakePhoneCalls);
     *     }
     *
     *     static using(phone: Phone) {
     *         return new MakePhoneCalls(phone);
     *     }
     *
     *     constructor(private readonly phone: Phone) {}
     *
     *     // some method that allows us to interact with the external interface of the system under test
     *     dial(phoneNumber: string) {
     *       // ...
     *     }
     * }
     *
     * const Connie = Actor.named('Connie').whoCan(MakePhoneCalls.using(phone));
     *
     * const Call = (phoneNumber: string) => Interaction.where(`#actor calls ${ phoneNumber }`, actor =>
     *  MakePhoneCalls.as(actor).dial(phoneNumber);
     * );
     *
     * @param {UsesAbilities} actor
     */
    as(actor: UsesAbilities): A;
}
