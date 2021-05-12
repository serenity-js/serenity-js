/**
 * @desc
 *  An Ability enables the {@link Actor} to interact with an external interface of the system under test.
 *  Technically speaking, it's a wrapper around a client of said interface.
 *
 * @example
 *  import { Ability, Actor, Interaction } from '@serenity-js/core';
 *
 *  class MakePhoneCalls implements Ability {
 *      static as(actor: UsesAbilities): MakesPhoneCalls {
 *          return actor.abilityTo(MakePhoneCalls);
 *      }
 *
 *      static using(phone: Phone) {
 *          return new MakePhoneCalls(phone);
 *      }
 *
 *      constructor(private readonly phone: Phone) {}
 *
 *      // some method that allows us to interact with the external interface of the system under test
 *      dial(phoneNumber: string) {
 *        // ...
 *      }
 *  }
 *
 *  const Connie = Actor.named('Connie').whoCan(MakePhoneCalls.using(phone));
 *
 *  const Call = (phoneNumber: string) => Interaction.where(`#actor calls ${ phoneNumber }`, actor =>
 *      MakePhoneCalls.as(actor).dial(phoneNumber);
 *  );
 *
 * @example <caption>Ability that's automatically initialised and discarded</caption>
 *  import {
 *      Ability, actorCalled, Discardable, Initialisable,
 *      Question, UsesAbilities
 *  } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  // A low-level client we want the Actor to use, i.e. a database client:
 *  const { Client } = require('pg');
 *
 *  // A custom Ability to give an Actor access to the low-level client:
 *  class QueryPostgresDB implements Initialisable, Discardable, Ability {
 *     static as(actor: UsesAbilities) {
 *         return actor.abilityTo(QueryPostgresDB);
 *     }
 *
 *     constructor(private readonly client) {
 *     }
 *
 *     // invoked by Serenity/JS when actor.attemptsTo is first invoked
 *     initialise(): Promise<void> | void {
 *         return this.client.connect();
 *     }
 *
 *     // Helps to ensure that the Ability is not initialised more than once
 *     isInitialised(): boolean {
 *         return this.client._connected;
 *     }
 *
 *     // Discards any resources the Ability uses when the Actor is dismissed
 *     discard(): Promise<void> | void {
 *         return this.client.end();
 *     }
 *
 *     // Any custom integration APIs the custom Ability
 *     // should make available to the Actor.
 *     query(query: string) {
 *         return this.client.query(query);
 *     }
 *
 *     // ... other custom integration APIs
 *  }
 *
 *  // A custom Question to allow the Actor query the system
 *  const CurrentDBUser = () =>
 *      Question.about('current db user', actor =>
 *          QueryPostgresDB.as(actor)
 *              .query('SELECT current_user')
 *              .then(result => result.rows[0].current_user)
 *      );
 *
 *  // Example test scenario where the Actor uses an Ability to QueryPostgresDB
 *  // to assert on the username the connection has been established with
 *  describe('Serenity/JS', () => {
 *     it('can initialise and discard abilities automatically', () =>
 *         actorCalled('Debbie')
 *             .whoCan(new QueryPostgresDB(new Client()))
 *             .attemptsTo(
 *                 Ensure.that(CurrentDBUser(), equals('jan'))
 *             ));
 *  });
 *
 * @see {@link Initialisable}
 * @see {@link Discardable}
 *
 * @access public
 */
export interface Ability {  // eslint-disable-line @typescript-eslint/no-empty-interface
}
