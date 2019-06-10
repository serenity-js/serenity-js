
/**
 * @desc
 *  An Ability enables the {@link Actor} to interact with an external interface of the system under test.
 *  Technically speaking, it's a wrapper around a client of said interface.
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
 * @access public
 */
export interface Ability {  // tslint:disable-line:no-empty-interface
}
