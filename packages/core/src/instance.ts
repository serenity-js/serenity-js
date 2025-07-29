import type { SerenityConfig } from './config';
import type { Actor} from './screenplay';
import { Clock } from './screenplay';
import { Serenity } from './Serenity';
import type { Cast } from './stage';

const clock = new Clock();

/**
 * Serenity object is the root object of the Serenity/JS framework.
 *
 * @group Serenity
 */
export const serenity = new Serenity(clock);

/**
 * Configures Serenity/JS. Every call to this function replaces the previous configuration provided,
 * so this function should be called exactly once in your test suite.
 *
 * This function is an alias for [`Serenity.configure`](https://serenity-js.org/api/core/class/Serenity/#configure).
 *
 * :::tip configure vs engage
  * If you want to retain the configuration but reset the [cast of actors](https://serenity-js.org/api/core/class/Cast/), use [`engage`](https://serenity-js.org/api/core/function/engage/) instead.
 * :::
 *
 * @param config
 *
 * @group Serenity
 */
export function configure(config: SerenityConfig): void {
    serenity.configure(config);
}

/**
 * Re-configures Serenity/JS with a new [cast](https://serenity-js.org/api/core/class/Cast/) of [actors](https://serenity-js.org/api/core/class/Actor/)
 * you want to use in any subsequent calls to [`actorCalled`](https://serenity-js.org/api/core/function/actorCalled/).
 *
 * This function is an alias for [`Serenity.engage`](https://serenity-js.org/api/core/class/Serenity/#engage),
 * which provides an alternative to calling [`Actor.whoCan`](https://serenity-js.org/api/core/class/Actor/#whoCan) directly in your tests
 * and is typically invoked in a "before all" or "before each" hook of your test runner of choice.
 *
 * :::tip configure vs engage
 * Calling [`engage`](https://serenity-js.org/api/core/function/engage/) replaces the currently configured [cast of actors](https://serenity-js.org/api/core/class/Cast/),
 * but doesn't affect any other configuration.
 * If you want to reset the Serenity/JS configuration completely, use [`configure`](https://serenity-js.org/api/core/function/configure/) instead.
 * :::
 *
 * If your implementation of the [cast](https://serenity-js.org/api/core/class/Cast/) interface is stateless,
 * you can invoke this function just once before your entire test suite is executed, see
 * - [`beforeAll`](https://jasmine.github.io/api/3.6/global.html#beforeAll) in Jasmine,
 * - [`before`](https://mochajs.org/#hooks) in Mocha,
 * - [`BeforeAll`](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md#beforeall--afterall) in Cucumber.js
 *
 * However, if your [cast](https://serenity-js.org/api/core/class/Cast/) holds state that you want to reset before each scenario,
 * it's better to invoke `engage` before each test using:
 * - [`beforeEach`](https://jasmine.github.io/api/3.6/global.html#beforeEach) in Jasmine
 * - [`beforeEach`](https://mochajs.org/#hooks) in Mocha,
 * - [`Before`](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md#hooks) in Cucumber.js
 *
 * ## Engaging a cast of actors
 *
 * ```ts
 * import { Actor, Cast } from '@serenity-js/core';
 *
 * class Actors implements Cast {
 *   prepare(actor: Actor) {
 *     return actor.whoCan(
 *       // ... abilities you'd like the Actor to have
 *     );
 *   }
 * }
 *
 * engage(new Actors());
 * ```
 *
 * ### Using with Mocha test runner
 *
 * ```ts
 * import { beforeEach } from 'mocha'
 *
 * beforeEach(() => engage(new Actors()))
 * ```
 *
 * ### Using with Jasmine test runner
 *
 * ```typescript
 * import 'jasmine'
 *
 * describe('My feature', () => {
 *   beforeEach(() => engage(new Actors()))
 * })
 * ```
 *
 * ### Using with Cucumber.js test runner
 *
 * Engage `Actors` [before](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md)
 * each test scenario:
 *
 * ```typescript
 * import { Before } from '@cucumber/cucumber'
 *
 * Before(() => engage(new Actors()))
 * ```
 *
 * Engage `Actors` before scenarios with [specific tags](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/hooks.md#tagged-hooks):
 *
 * ```typescript
 * import { Before } from '@cucumber/cucumber'
 *
 * Before('@web', () => engage(new Actors()))
 * ```
 *
 * ### Using with Playwright Test runner
 *
 * [Serenity/JS Playwright Test module](https://serenity-js.org/api/playwright-test) will configure the cast on your behalf,
 * so you don't need to call [`engage`](https://serenity-js.org/api/core/function/engage/).
 *
 * ```ts
 * import { describe, it, test } from '@serenity-js/playwright-test'
 *
 * describe('My feature', () => {
 *
 *   this.use({
 *     actors: new Actors()
 *   })
 *
 *   // test scenarios
 *
 * })
 * ```
 *
 * ## Learn more
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 * - [`Cast`](https://serenity-js.org/api/core/class/Cast/)
 * - [`Serenity.engage`](https://serenity-js.org/api/core/class/Serenity/#engage)
 *
 * @param actors
 *
 * @group Serenity
 */
export function engage(actors: Cast): void {
    serenity.engage(actors);
}

/**
 * Instantiates or retrieves an [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 * called `name` if one has already been instantiated.
 *
 * This method is an alias for [`Serenity.theActorCalled`](https://serenity-js.org/api/core/class/Serenity/#theActorCalled).
 *
 * ## Usage with Cucumber
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { Given } from '@cucumber/cucumber';
 *
 * Given(/(.*?) is a registered user/, async (name: string) => {
 *   await actorCalled(name).attemptsTo(
 *     // ... activities
 *   )
 * })
 * ```
 *
 * ## Usage with Jasmine
 *
 * ```typescript
 * import 'jasmine';
 * import { actorCalled } from '@serenity-js/core';
 *
 * describe('Feature', () => {
 *
 *     it('should have some behaviour', async () {
 *         await actorCalled('James').attemptsTo(
 *             // ... activities
 *         )
 *     })
 * })
 * ```
 *
 * ## Usage with Mocha
 *
 * ```typescript
 * import { describe, it } from 'mocha';
 * import { actorCalled } from '@serenity-js/core';
 *
 * describe('Feature', () => {
 *
 *     it('should have some behaviour', async () => {
 *         await actorCalled('James').attemptsTo(
 *             // ... activities
 *         )
 *     })
 * })
 * ```
 *
 * ## Usage with Playwright Test
 *
 * When using [Serenity/JS with Playwright Test](https://serenity-js.org/api/playwright-test/), you should use either
 * the default [`actor`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actorCalled) fixture
 * or the injected [`actorCalled`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actorCalled) function
 * instead of importing it from `@serenity-js/core`.
 *
 * ```typescript
 * import { describe, it } from '@serenity-js/playwright-test';
 *
 * describe('Feature', () => {
 *
 *     it('should have some behaviour', async ({ actorCalled }) => {
 *         await actorCalled('James').attemptsTo(
 *             // ... activities
 *         )
 *     })
 * })
 * ```
 *
 * ## Learn more
 *
 * - [`engage`](https://serenity-js.org/api/core/function/engage/)
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 * - [`Cast`](https://serenity-js.org/api/core/class/Cast/)
 * - [`Serenity.theActorCalled`](https://serenity-js.org/api/core/class/Serenity/#theActorCalled)
 *
 * @param name
 *  The name of the actor to instantiate or retrieve
 *
 * @group Actors
 */
export function actorCalled(name: string): Actor {
    return serenity.theActorCalled(name);
}

/**
 * Retrieves an actor who was last instantiated or retrieved
 * using [`actorCalled`](https://serenity-js.org/api/core/function/actorCalled/).
 *
 * This function is particularly useful when automating Cucumber scenarios.
 *
 * This function is an alias for [`Serenity.theActorInTheSpotlight`](https://serenity-js.org/api/core/class/Serenity/#theActorInTheSpotlight).
 *
 * ## Usage with Cucumber
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core';
 * import { Given, When } from '@cucumber/cucumber';
 *
 * Given(/(.*?) is a registered user/, (name: string) =>
 *   actorCalled(name).attemptsTo(
 *     // ... activities
 *   ))
 *
 * When(/(?:he|she|they) browse their recent orders/, () =>
 *   actorInTheSpotlight().attemptsTo(
 *     // ... activities
 *   ))
 * ```
 *
 * ## Learn more
 *
 * - [`engage`](https://serenity-js.org/api/core/function/engage/)
 * - [`actorCalled`](https://serenity-js.org/api/core/function/actorCalled/)
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 * - [`Cast`](https://serenity-js.org/api/core/class/Cast/)
 *
 * @group Actors
 */
export function actorInTheSpotlight(): Actor {
    return serenity.theActorInTheSpotlight();
}
