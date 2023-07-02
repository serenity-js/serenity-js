import { AbilityType } from './AbilityType';
import { UsesAbilities } from './UsesAbilities';

/**
 * **Abilities** enable {@apilink Actor|actors}
 * to perform {@apilink Interaction|interactions} with the system under test
 * and answer {@apilink Question|questions} about its state.
 *
 * From the technical perspective, **abilities** act as **wrappers** around any **integration libraries** required
 * to communicate with the external interfaces of system under test,
 * such as {@apilink BrowseTheWeb|web browser drivers} or a {@apilink CallAnApi|HTTP client}.
 * They also enable [portability](/handbook/design/portable-test-code)
 * of your test code across such integration libraries.
 *
 * Abilities are the core building block of the [Screenplay Pattern](/handbook/design/screenplay-pattern),
 * along with {@apilink Actor|Actors}, {@apilink Interaction|Interactions}, {@apilink Question|Questions}, and {@apilink Task|Tasks}.
 *
 * ![Screenplay Pattern](/images/design/serenity-js-screenplay-pattern.png)
 *
 * Learn more about:
 * - {@apilink Actor|Actors}
 * - {@apilink Cast|Configuring actors using Casts}
 * - {@apilink Interaction|Interactions}
 * - {@apilink Question|Questions}
 * - [Web testing](/handbook/web-testing/)
 * - [API testing](/handbook/api-testing/)
 * - [Mobile testing](/handbook/mobile-testing/)
 *
 * ## Giving actors the abilities to interact
 *
 * Serenity/JS actors are capable of interacting with **any interface** of the system under test,
 * be it a [web UI](/handbook/web-testing/), a [mobile app](/handbook/mobile-testing/), a [web service](/handbook/api-testing/),
 * or {@apilink Ability|anything else} that a Node.js program can talk to.
 * This flexibility is enabled by a mechanism called _**abilities**_
 * and achieved without introducing any unnecessary dependencies to your code base thanks to the [modular architecture](/handbook/about/architecture) of Serenity/JS.
 *
 * :::tip Remember
 * **Actors** have **abilities** that enable them to **perform interactions** and **answer questions**.
 * :::
 *
 * From the technical perspective, an **ability** is an [adapter](https://en.wikipedia.org/wiki/Adapter_pattern)
 * around an interface-specific integration library, such as a web browser driver, an HTTP client, a database client, and so on.
 * You give an actor an ability, and it's the ability's responsibility to provide a consistent API around the integration library and deal with any of its quirks.
 * Abilities **encapsulate integration libraries** and handle their {@apilink Initialisable|configuration and initialisation},
 * the process of {@apilink Discardable|freeing up any resources} they hold,
 * as well as managing any state associated with the library.
 *
 * ### Portable interactions with web interfaces
 *
 * To make your Serenity/JS actors interact with web interfaces,
 * you call the [`Actor.whoCan`](/api/core/class/Actor#whoCan) method and give them an implementation of the ability to [`BrowseTheWeb`](/api/web/class/BrowseTheWeb),
 * specific to your web integration tool of choice.
 *
 * Note how {@apilink BrowseTheWebWithPlaywright}, {@apilink BrowseTheWebWithWebdriverIO}, and {@apilink BrowseTheWebWithProtractor}
 * all **extend** the base ability to {@apilink BrowseTheWeb}.
 *
 * #### Playwright Test
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'   // Serenity/JS integration module
 * import { chromium } from 'playwright'
 *
 * const browser = await chromium.launch({ headless: true })              // integration library
 *
 * actorCalled('Trevor')                                                  // generic actor
 *   .whoCan(BrowseTheWebWithPlaywright.using(browser))                   // tool-specific ability
 * ```
 *
 * #### WebdriverIO
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio' // Serenity/JS integration module
 *
 * actorCalled('Trevor')                                                  // generic actor
 *   .whoCan(BrowseTheWebWithWebdriverIO.using(browser))                  // tool-specific ability
 * ```
 *
 * #### Protractor
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithProtractor } from '@serenity-js/protractor'   // Serenity/JS integration module
 * import { protractor } from 'protractor'                                // integration library
 *
 * actorCalled('Trevor')                                                  // generic actor
 *   .whoCan(BrowseTheWebWithProtractor.using(protractor.browser))        // tool-specific ability
 * ```
 *
 * ### Retrieving an ability
 *
 * Use {@apilink Ability.as} to retrieve an ability in a custom {@apilink Interaction} or {@apilink Question} implementation.
 *
 * Here, `Ability` can be the integration library-specific class, for example {@apilink BrowseTheWebWithPlaywright},
 * or its library-agnostic parent class, like {@apilink BrowseTheWeb}.
 *
 * To make your code portable across the various integration libraries, retrieve the ability
 * using the library-agnostic parent class:
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWeb } from '@serenity-js/web' // Serenity/JS web module
 *
 * const actor    = actorCalled('Trevor')
 * const ability  = await BrowseTheWeb.as(actor)   // retrieve implementation of BrowseTheWeb
 * ```
 *
 * As you can already see, providing **encapsulation** and a **cleaner API** around the integration libraries are not the only reasons why you'd want to use the abilities.
 *
 * Another reason is that the Serenity/JS implementation of the Screenplay Pattern lets you **completely decouple the actor from the integration libraries**
 * and make the abilities of the same type **interchangeable**.
 * For example, [Serenity/JS web modules](/handbook/web-testing/serenity-js-web-modules) offer an abstraction that lets you switch between web integration libraries
 * as vastly different as Selenium, WebdriverIO, or Playwright without having to change _anything whatsoever_ in your test scenarios.
 *
 * What this means is that your test code can become [portable and reusable across projects and teams](/handbook/design/portable-test-code),
 * even if they don't use the same low-level integration tools. It also helps you to **avoid vendor lock-in**, as you can wrap any third-party integration library
 * into an ability and swap it out for another implementation if you need to.
 *
 * However, Serenity/JS **doesn't prevent you** from using the integration libraries directly.
 * When you need to, you can use a library-specific ability like {@apilink BrowseTheWebWithPlaywright}
 * to trade portability for access to library-specific low-level methods:
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright, PlaywrightPage } from '@serenity-js/playwright'
 *
 * const actor          = actorCalled('Trevor')
 * const ability        = await BrowseTheWebWithPlaywright.as(actor)
 * const page           = (await ability.currentPage()) as PlaywrightPage;
 * const playwrightPage = await page.nativePage();
 * // use any Playwright-specific APIs on playwrightPage
 * ```
 *
 * :::warning Using integration library-specific APIs reduces portability
 * While Serenity/JS provides you with escape hatches and ways to access the low-level APIs of your integration libraries,
 * doing so can reduce the portability of your code. Only do it when you have a good reason to trade portability for low-level access.
 * :::
 *
 *
 * ## Associating actors with data
 *
 * One more reason to use abilities is that abilities can also help you to **associate actors with data** they need to perform their activities.
 * For example, a commonly used ability is one to [`TakeNotes`](/api/core/class/TakeNotes), which allows your actors to start the test scenario
 * equipped with some data set, or record information about what they see in the test scenario so that they can act upon it later:
 *
 * ```typescript
 * import { actorCalled, Notepad, TakeNotes } from '@serenity-js/core'
 *
 * interface MyNotes {
 *   firstName: string;
 *   lastName: string;
 *   emailAddress: string;
 * }
 *
 * await actorCalled('Trevor')
 *   .whoCan(
 *     TakeNotes.using(Notepad.with<MyNotes>({
 *       firstName: 'Trevor',
 *       lastName: 'Traveller',
 *       emailAddress: 'Trevor.Traveller@example.org',
 *     }))
 *   )
 * ```
 *
 * ## Actors with multiple abilities
 *
 * Of course, an actor can have **any number of abilities** they need to play their role.
 * For example, it is quite common for an actor to be able to [`BrowseTheWeb`](/api/web/class/BrowseTheWeb), [`TakeNotes`](/api/core/class/TakeNotes), and [`CallAnApi`](/api/rest/class/CallAnApi):
 *
 * ```typescript
 * import { actorCalled, Notepad, TakeNotes } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { CallAnApi } from '@serenity-js/rest'
 * import { chromium } from 'playwright'
 *
 * const browser = await chromium.launch({ headless: true })
 * const baseURL = 'https://example.org'
 *
 * interface MyNotes {
 *   firstName: string;
 *   lastName: string;
 *   emailAddress: string;
 * }
 *
 * await actorCalled('Trevor')
 *   .whoCan(
 *       BrowseTheWebWithPlaywright.using(browser, { baseURL }),
 *       CallAnApi.at(`${ baseURL }/api`),
 *       TakeNotes.using(Notepad.with<MyNotes>({
 *           firstName: 'Trevor',
 *           lastName: 'Traveller',
 *           emailAddress: 'Trevor.Traveller@example.org',
 *       }))
 *   )
 * ```
 *
 * ## Writing custom abilities
 *
 * If your system under test provides a type of interface that Serenity/JS doesn't support yet,
 * you might want to implement a custom {@apilink Ability}, as well as {@apilink Interaction|interactions}
 * and {@apilink Question|questions} to interact with it.
 *
 * The best way to start with that is for you to review the examples in the {@apilink Ability|Screenplay Pattern API docs},
 * as well as the [Serenity/JS code base on GitHub](https://github.com/serenity-js/serenity-js/tree/main/packages).
 * Also note that all the [Serenity/JS modules](/handbook/about/architecture)
 * have their automated tests written in such a way to not only provide an **extremely high test coverage** for the framework itself,
 * but to be **accessible** and act as a **reference implementation for you** to create your own integrations.
 *
 * If you believe that the custom integration you've developed could benefit the wider Serenity/JS community,
 * please consider open-sourcing it yourself, or [contributing it](/contributing) to the main framework.
 *
 * [![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
 *
 * ### Defining a custom ability to `MakePhoneCalls`
 *
 * ```ts
 * import { Ability, actorCalled, Interaction } from '@serenity-js/core'
 *
 * class MakePhoneCalls extends Ability {
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
 *   extends Ability
 *   implements Initialisable, Discardable
 * {
 *   constructor(private readonly client) {
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
 * @group Screenplay Pattern
 */
export abstract class Ability {

    /**
     * Used to access an {@apilink Actor|actor's} {@apilink Ability|ability} of the given type
     * from within the {@apilink Interaction} and {@apilink Question} classes.
     *
     * #### Retrieving an ability in an interaction definition
     *
     * ```ts
     * import { Actor, Interaction } from '@serenity-js/core'
     * import { BrowseTheWeb, Page } from '@serenity-js/web'
     *
     * export const ClearLocalStorage = () =>
     *   Interaction.where(`#actor clears local storage`, async (actor: Actor) => {
     *     const browseTheWeb: BrowseTheWeb = BrowseTheWeb.as(actor)    // retrieve an ability
     *     const page: Page = await browseTheWeb.currentPage()
     *     await page.executeScript(() => window.localStorage.clear())
     *   })
     * ```
     *
     * #### Retrieving an ability in a question definition
     *
     * ```ts
     * import { Actor, Question } from '@serenity-js/core'
     * import { BrowseTheWeb, Page } from '@serenity-js/web'
     * import { CallAnApi } from '@serenity-js/rest'
     *
     * const LocalStorage = {
     *   numberOfItems: () =>
     *     Question.about<number>(`number of items in local storage`, async (actor: Actor) => {
     *       const browseTheWeb: BrowseTheWeb = BrowseTheWeb.as(actor)    // retrieve an ability
     *       const page: Page = await browseTheWeb.currentPage()
     *       return page.executeScript(() => window.localStorage.length)
     *     })
     * }
     * ```
     *
     * @param actor
     */
    static as<A extends Ability>(
        this: AbilityType<A>,
        actor: UsesAbilities
    ): A {
        return actor.abilityTo(this) as A;
    }
}
