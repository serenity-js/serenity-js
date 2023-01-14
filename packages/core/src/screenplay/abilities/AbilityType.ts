import { Ability } from './Ability';

/**
 * An interface describing the static access method that every {@apilink Ability} class
 * needs to provide in order to be accessible from within the {@apilink Interaction|interactions}.
 *
 * #### Retrieving an ability from an interaction
 *
 * ```ts
 * import { Ability, actorCalled, Interaction } from '@serenity-js/core';
 *
 * class MakePhoneCalls extends Ability {
 *   static using(phone: Phone) {
 *     return new MakePhoneCalls(phone);
 *   }
 *
 *   protected constructor(private readonly phone: Phone) {
 *   }
 *
 *   // some method that allows us to interact with the external interface of the system under test
 *   dial(phoneNumber: string): Promise<void> {
 *     // ...
 *   }
 * }
 *
 * const Call = (phoneNumber: string) =>
 *   Interaction.where(`#actor calls ${ phoneNumber }`, async actor => {
 *     await MakePhoneCalls.as(actor).dial(phoneNumber)
 *   });
 *
 * await actorCalled('Connie')
 *   .whoCan(MakePhoneCalls.using(phone))
 *   .attemptsTo(
 *     Call(phoneNumber),
 *   )
 * ```
 *
 * ## Learn more
 * - {@apilink Ability}
 * - {@apilink Actor}
 * - {@apilink Interaction}
 *
 * @group Abilities
 */
export type AbilityType<A extends Ability> =
    (abstract new (... args: any[]) => A);
