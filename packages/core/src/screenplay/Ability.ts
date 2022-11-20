/**
 * Serenity/JS Screenplay Pattern `Ability` enables an {@apilink Actor} to interact with an external interface of the system under test.
 *
 * Technically speaking, an "ability" is a wrapper around a client of a given external interface,
 * such as a {@apilink BrowseTheWeb|Web browser driver}, or a {@apilink CallAnApi|HTTP client}.
 *
 * ## Using custom abilities
 *
 * ### Defining a custom ability to `MakePhoneCalls`
 *
 * ```ts
 * import { Ability, actorCalled, Interaction } from '@serenity-js/core'
 *
 * class MakePhoneCalls implements Ability {
 *
 *   // Abilities typically expose a static method `as` used to retrieve the ability from an actor in an interaction,
 *   // for example:
 *   //   MakesPhoneCalls.as(actor).call(phoneNumber)
 *   static as(actor: UsesAbilities): MakesPhoneCalls {
 *     return actor.abilityTo(MakePhoneCalls)
 *   }
 *
 *   // A static method is typically used to inject a client of a given interface
 *   // and instantiate the ability, for example:
 *   //   actorCalled('Phil').whoCan(MakePhoneCalls.using(phone))
 *   static using(phone: Phone) {
 *     return new MakePhoneCalls(phone);
 *   }
 *
 *   // Abilities can hold state, for example: the client of a given interface,
 *   // additional configuration, or the result of the last interaction with a given interface.
 *   protected constructor(private readonly phone: Phone) {
 *   }
 *
 *   // Abilities expose methods that enable Interactions to call the system under test,
 *   // and Questions to retrieve information about its state.
 *   dial(phoneNumber: string): Promise<void> {
 *     // ...
 *   }
 * }
 * ```
 *
 * ### Defining a custom interaction using the custom ability
 *
 * ```ts
 * // A custom interaction using the actor's ability:
 * const Call = (phoneNumber: string) =>
 *   Interaction.where(`#actor calls ${ phoneNumber }`, async actor => {
 *     await MakePhoneCalls.as(actor).dial(phoneNumber)
 *   })
 * ```
 *
 * ### Using the custom ability and interaction in a test scenario
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 *
 * await actorCalled('Connie')
 *   .whoCan(MakePhoneCalls.using(phone))
 *   .attemptsTo(
 *     Call(phoneNumber)
 *   )
 * ```
 *
 * ## Using auto-initialisable and auto-discardable abilities
 *
 * Abilities that rely on resources that need to be initialised before they can be used,
 * or discarded before the actor is dismissed can implement the {@apilink Initialisable}
 * or {@apilink Discardable} interfaces, respectively.
 *
 * ### Defining a custom ability to `QueryPostgresDB`
 *
 * ```ts
 * import {
 *   Ability, actorCalled, Discardable, Initialisable, Question, UsesAbilities,
 * } from '@serenity-js/core'
 *
 * // Some low-level interface-specific client we want the Actor to use,
 * // for example a PostgreSQL database client:
 * const { Client } = require('pg');
 *
 * // A custom Ability to give an Actor access to the low-level client:
 * class QueryPostgresDB
 *   implements Initialisable, Discardable, Ability
 * {
 *   static as(actor: UsesAbilities) {
 *     return actor.abilityTo(QueryPostgresDB);
 *   }
 *
 *   protected constructor(private readonly client) {
 *   }
 *
 *   // Invoked by Serenity/JS upon the first invocation of `actor.attemptsTo`
 *   initialise(): Promise<void> | void {
 *     return this.client.connect();
 *   }
 *
 *   // Used to ensure that the Ability is not initialised more than once
 *   isInitialised(): boolean {
 *     return this.client._connected;
 *   }
 *
 *   // Discards any resources the Ability uses when the Actor is dismissed,
 *   // so when the Stage receives a SceneFinishes event for scenario-scoped actor,
 *   // or TestRunFinishes for cross-scenario-scoped actors
 *   discard(): Promise<void> | void {
 *     return this.client.end();
 *   }
 *
 *   // Any custom integration APIs the Ability, should make available to the Actor.
 *   // Here, we want the ability to enable the actor to query the database.
 *   query(query: string) {
 *     return this.client.query(query);
 *   }
 *
 *   // ... other custom integration APIs
 * }
 * ```
 *
 * ### Defining a custom question using the custom ability
 *
 * ```ts
 * // A custom Question to allow the Actor query the database
 * const CurrentDBUser = () =>
 *   Question.about('current db user', actor =>
 *     QueryPostgresDB.as(actor)
 *       .query('SELECT current_user')
 *       .then(result => result.rows[0].current_user)
 *   );
 * ```
 *
 * ### Using the custom ability and question in a test scenario
 *
 * ```ts
 * // Example test scenario where the Actor uses the Ability to QueryPostgresDB
 * // to assert on the username the connection has been established with
 *
 * import { describe, it } from 'mocha'
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * describe('Serenity/JS', () => {
 *   it('can initialise and discard abilities automatically', () =>
 *     actorCalled('Debbie')
 *       .whoCan(new QueryPostgresDB(new Client()))
 *       .attemptsTo(
 *         Ensure.that(CurrentDBUser(), equals('jan'))
 *       ))
 * })
 * ```
 *
 * ## Learn more
 * - {@apilink AbilityType}
 * - {@apilink Initialisable}
 * - {@apilink Discardable}
 * - {@apilink BrowseTheWeb}
 * - {@apilink CallAnApi}
 * - {@apilink TakeNotes}
 *
 * @group Abilities
 */
export interface Ability {  // eslint-disable-line @typescript-eslint/no-empty-interface
}
