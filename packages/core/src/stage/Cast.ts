import { Actor } from '../screenplay';

/**
 * Serenity/JS uses the concept of a _**cast of actors**_ to centralise the process of configuring the {@apilink Actor|actors} and assigning their {@apilink Ability|abilities}.
 *
 * When you invoke {@apilink actorCalled} for the first time in a test scenario,
 * Serenity/JS {@apilink Actor|instantiates a new actor}
 * and passes it through the {@apilink Cast.prepare} method.
 * Specifying a **custom cast** gives you an opportunity to configure the actor with the abilities
 * they need before it's returned to the caller,
 * or configure the actors differently **depending on their name**.
 * It also helps you to avoid having to configure abilities individually in every test scenario.
 *
 * :::tip Remember
 * A **cast** is responsible for assigning **abilities** to **actors** in a central location.
 * :::
 *
 * ## Configuring a cast of actors for the entire test suite
 *
 * When working with relatively **simple scenarios** where all the actors should always receive the same set of abilities,
 * you can {@apilink configure} Serenity/JS to use a generic {@apilink Cast.where}:
 *
 * ```typescript
 * import { Cast, configure } from '@serenity-js/core'
 * import { CallAnApi } from '@serenity-js/rest'
 *
 * configure({
 *   actors: Cast.where(actor => actor.whoCan(
 *     CallAnApi.at('http://api.example.org'),
 *     // other abilities
 *   ))
 * })
 * ```
 *
 * If you're using Serenity/JS with one of the [supported test runners](/handbook/test-runners/),
 * you might prefer to use your test runner's native configuration mechanism
 * instead of invoking {@apilink configure} explicitly.
 *
 * :::tip configure vs engage
 * Calling {@apilink configure} resets the entire Serenity/JS configuration
 * and should be done exactly once in your entire test suite.
 * If you want to retain the configuration but reset the cast, use {@apilink engage} instead.
 * :::
 *
 * Learn more about configuring Serenity/JS with:
 * - [Cucumber.js](/handbook/test-runners/cucumber)
 * - [Jasmine](/handbook/test-runners/jasmine)
 * - [Mocha](/handbook/test-runners/mocha)
 * - [Playwright Test](/handbook/test-runners/playwright-test)
 * - [Protractor](/handbook/test-runners/protractor)
 * - [WebdriverIO](/handbook/test-runners/webdriverio)
 *
 * ## Engaging a cast of actors for the specific scenario
 *
 * If you want to retain Serenity/JS configuration, but set a different {@apilink Cast}
 * for the given test scenario you should use {@apilink engage} instead of {@apilink configure}.
 *
 * This approach is useful for example when your entire test suite is dedicated to interacting with the system
 * under test via its REST APIs, and you have a handful of scenarios that need a web browser.
 *
 * ```ts
 * import { describe, beforeEach } from 'mocha'
 * import { engage, Cast } from '@serenity-js/core';
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { Browser, chromium } from 'playwright'
 *
 * describe('My UI feature', () => {
 *   beforeEach(async () => {
 *     const browser = await chromium.launch({ headless: true })
 *     engage(Cast.where(actor => actor.whoCan(BrowseTheWebWithPlaywright.using(browser))))
 *   })
 *
 *   // test scenarios
 * })
 * ```
 *
 * ## Writing custom casts for complex scenarios
 *
 * In **complex scenarios** that involve multiple **actors with different abilities**,
 * you should create a custom implementation of the {@apilink Cast}.
 *
 * Examples of such scenarios include those where actors use separate browser instances, interact with different REST APIs,
 * or start with different data in their {@apilink Notepad|notepads}.
 *
 * ### Defining a custom cast of actors interacting with a Web UI
 *
 * ```ts
 * import { beforeEach } from 'mocha'
 * import { engage, Actor, Cast } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright, PlaywrightOptions } from '@serenity-js/playwright'
 * import { Browser, chromium } from 'playwright'
 *
 * export class UIActors implements Cast {
 *   constructor(
 *     private readonly browser: Browser,
 *     private readonly options?: PlaywrightOptions,
 *   ) {
 *   }
 *
 *   prepare(actor: Actor): Actor {
 *     return actor.whoCan(
 *       BrowseTheWebWithPlaywright.using(this.browser, this.options),
 *     )
 *   }
 * }
 *
 * beforeEach(async () => {
 *   const browser = await chromium.launch({ headless: true })
 *   engage(new UIActors(browser));
 * });
 * ```
 *
 * ### Preparing actors differently based on their name
 *
 * ```ts
 * import { beforeEach } from 'mocha'
 * import { actorCalled, engage, Cast } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { CallAnApi } from '@serenity-js/rest'
 * import { Browser, chromium } from 'playwright'
 *
 * class Actors implements Cast {
 *   constructor(
 *     private readonly browser: Browser,
 *     private readonly options: PlaywrightOptions,
 *   ) {
 *   }
 *
 *   prepare(actor: Actor) {
 *     switch (actor.name) {
 *       case 'James':
 *         return actor.whoCan(BrowseTheWebWithPlaywright.using(this.browser, this.options));
 *       default:
 *         return actor.whoCan(CallAnApi.at(this.options.baseURL));
 *     }
 *   }
 * }
 *
 * beforeEach(async () => {
 *   const browser = await chromium.launch({ headless: true })
 *   engage(new Actors(browser, { baseURL: 'https://example.org' }));
 * });
 *
 * actorCalled('James') // returns an actor using a browser
 * actorCalled('Alice') // returns an actor interacting with an API
 * ```
 *
 * @group Stage
 */
export abstract class Cast {

    /**
     * Creates a generic `Cast` implementation, where new actors receive the abilities
     * configured by the `prepareFunction`.
     *
     * @param prepareFunction
     */
    static where(prepareFunction: (actor: Actor) => Actor): Cast {
        return new class GenericCast extends Cast {
            prepare(actor: Actor): Actor {
                return prepareFunction(actor);
            }
        }
    }

    /**
     * Configures an {@apilink Actor} instantiated when {@apilink Stage.actor} is invoked.
     *
     * @param actor
     *
     * #### Learn more
     * - {@apilink engage}
     */
    abstract prepare(actor: Actor): Actor;
}
