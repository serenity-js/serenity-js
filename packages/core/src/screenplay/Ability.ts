
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
 *  import { Ability, Actor, Initialisable, Discardable, Interaction } from '@serenity-js/core';
 *  import { Client } from 'pg';
 *
 *  class UsePostgreSQLDatabase implements Initialisable, Discardable, Ability {
 *      static using(client: Client) {
 *          return new UsePostgreSQLDatabase(client);
 *      }
 *
 *      static as(actor: UsePostgreSQLDatabase): MakesPhoneCalls {
 *          return actor.abilityTo(UsePostgreSQLDatabase);
 *      }
 *
 *      constructor(private readonly client: Client) {}
 *
 *      // Connect to the database automatically the first time
 *      // actor.attemptsTo() is called.
 *      // See Initialisable for details
 *      async initialise(): Promise<void> {
 *          await this.client.connect();
 *      }
 *
 *      // Disconnect when the actor is dismissed.
 *      // See Discardable for details
 *      async discard(): Promise<void> {
 *          await this.client.end();
 *      }
 *
 *      // some method that allows us to interact with the external interface of the system under test
 *      query(queryText: string, ...params: string[]) {
 *          return this.client(queryText, params);
 *      }
 *  }
 *
 *  const ResultsFor = (queryText: string, params: string[]) =>
 *      Question.about(`results for ${ queryText } with params: ${ params }`,
 *          actor => UsePostgreSQLDatabase.as(actor).query(queryText, params));
 *
 * @see {@link Initialisable}
 * @see {@link Discardable}
 *
 * @access public
 */
export interface Ability {  // tslint:disable-line:no-empty-interface
}
