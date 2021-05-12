import { Actor } from './screenplay/actor';
import { Serenity } from './Serenity';
import { SerenityConfig } from './SerenityConfig';
import { Cast, Clock } from './stage';

const clock = new Clock();

export const serenity = new Serenity(clock);

/**
 * @desc
 *  Configures Serenity/JS. Every call to this function
 *  replaces the previous configuration provided,
 *  so this function should called be exactly once
 *  in your test suite.
 *
 *  This function is an alias for {@link Serenity#configure}.
 *
 * @param {SerenityConfig} config
 * @return {void}
 *
 * @see {@link Serenity#configure}
 */
export function configure(config: SerenityConfig): void {
    serenity.configure(config);
}

/**
 * @desc
 *  Re-configures Serenity/JS with a new {@link Cast} of {@link Actor}s
 *  you'd like to use in any subsequent call to {@link actorCalled}.
 *
 *  This function is an alias for {@link Serenity#engage},
 *  which provides an alternative to calling {@link Actor#whoCan}
 *  directly in your tests and is typically invoked in a "before all"
 *  or "before each" hook of your test runner of choice.
 *
 *  If your implementation of the {@link Cast} interface is stateless,
 *  you can invoke this function once before your entire test suite is executed, see
 *  - [`beforeAll`](https://jasmine.github.io/api/3.6/global.html#beforeAll) in Jasmine,
 *  - [`before`](https://mochajs.org/#hooks) in Mocha,
 *  - [`BeforeAll`](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md#beforeall--afterall) in Cucumber.js
 *
 *  However, if your {@link Cast} holds state that you want reset before each scenario,
 *  it's better to invoke `engage` before each test using:
 *  - [`beforeEach`](https://jasmine.github.io/api/3.6/global.html#beforeEach) in Jasmine
 *  - [`beforeEach`](https://mochajs.org/#hooks) in Mocha,
 *  - [`Before`](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md#hooks) in Cucumber.js
 *
 * @example <caption>Engaging a cast of actors</caption>
 *  import { Actor, Cast } from '@serenity-js/core';
 *
 *  class Actors implements Cast {
 *      prepare(actor: Actor) {
 *          return actor.whoCan(
 *              // ... abilities you'd like the Actor to have
 *          );
 *      }
 *  }
 *
 * engage(new Actors();
 *
 * @example <caption>Usage with Jasmine</caption>
 *  import 'jasmine';
 *
 *  beforeEach(() => engage(new Actors()));
 *
 * @example <caption>Usage with Cucumber</caption>
 *  import { Before } from 'cucumber';
 *
 *  Before(() => engage(new Actors());
 *
 * @param {Cast} actors
 * @returns {void}
 *
 * @see {@link Actor}
 * @see {@link Cast}
 *
 * @see {@link Serenity#engage}
 */
export function engage(actors: Cast): void {
    serenity.engage(actors);
}

/**
 * @desc
 *  Instantiates or retrieves an actor {@link Actor}
 *  called `name` if one has already been instantiated.
 *
 *  This method is an alias for {@link Serenity#theActorCalled}.
 *
 * @example <caption>Usage with Jasmine</caption>
 *   import 'jasmine';
 *   import { actorCalled } from '@serenity-js/core';
 *
 *   describe('Feature', () => {
 *
 *      it('should have some behaviour', () =>
 *          actorCalled('James').attemptsTo(
 *              // ... activities
 *          ));
 *   });
 *
 * @example <caption>Usage with Cucumber</caption>
 *   import { actorCalled } from '@serenity-js/core';
 *   import { Given } from 'cucumber';
 *
 *   Given(/(.*?) is a registered user/, (name: string) =>
 *      actorCalled(name).attemptsTo(
 *              // ... activities
 *          ));
 *
 * @param {string} name
 *  The name of the actor to instantiate or retrieve
 *
 * @returns {Actor}
 *
 * @see {@link engage}
 * @see {@link Actor}
 * @see {@link Cast}
 * @see {@link Serenity#theActorCalled}
 */
export function actorCalled(name: string): Actor {
    return serenity.theActorCalled(name);
}

/**
 * @desc
 *  Retrieves an actor who was last instantiated or retrieved
 *  using {@link actorCalled}.
 *
 *  This function is particularly useful when automating Cucumber scenarios.
 *
 *  This function is an alias for {@link Serenity#theActorInTheSpotlight}.
 *
 * @example <caption>Usage with Cucumber</caption>
 *   import { actorCalled } from '@serenity-js/core';
 *   import { Given, When } from 'cucumber';
 *
 *   Given(/(.*?) is a registered user/, (name: string) =>
 *      actorCalled(name).attemptsTo(
 *              // ... activities
 *          ));
 *
 *   When(/(?:he|she|they) browse their recent orders/, () =>
 *      actorInTheSpotlight().attemptsTo(
 *              // ... activities
 *          ));
 *
 * @returns {Actor}
 *
 * @see {@link engage}
 * @see {@link actorCalled}
 * @see {@link Actor}
 * @see {@link Cast}
 */
export function actorInTheSpotlight(): Actor {
    return serenity.theActorInTheSpotlight();
}
