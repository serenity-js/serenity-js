import type {
    Ability,
    Actor,
    Cast,
    ClassDescription,
    Duration,
    Serenity,
    StageCrewMember,
    StageCrewMemberBuilder
} from '@serenity-js/core';
import type { ExtraBrowserContextOptions } from '@serenity-js/playwright';
import type { AxiosRequestConfigDefaults } from '@serenity-js/rest';
import { type AxiosInstance } from 'axios';

/**
 * Serenity/JS-specific [Playwright Test fixtures](https://playwright.dev/docs/test-fixtures)
 * injected into your [test scenarios](https://serenity-js.org/api/playwright-test/function/it/).
 *
 * ### Configuring Serenity/JS using a test file
 *
 * ```typescript
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { describe, it, test } from '@serenity-js/playwright-test'
 * import { Photographer, TakePhotosOfFailures } from '@serenity-js/web'
 *
 * describe(`Recording items`, () => {
 *
 *     test.use({
 *         defaultActorName: 'Serena',
 *         crew: [
 *             Photographer.whoWill(TakePhotosOfFailures),
 *         ],
 *
 *         // Register a custom cast of Serenity/JS actors to replace the default one
 *         actors: async ({ browser, contextOptions, extraContextOptions, baseURL }, use) => {
 *              const cast = Cast.where(actor =>
 *                  actor.whoCan(
 *                      BrowseTheWebWithPlaywright.using(browser, contextOptions, extraContextOptions),
 *                      TakeNotes.usingAnEmptyNotepad(),
 *                      CallAnApi.at(baseURL),
 *                  )
 *              )
 *
 *              await use(cast)
 *         },
 *     })
 *
 *     describe(`Todo List App`, () => {
 *
 *         it(`should allow me to add a todo item`, async ({ actor }) => {
 *             await actor.attemptsTo(
 *                 startWithAnEmptyList(),
 *
 *                 recordItem('Buy some milk'),
 *
 *                 Ensure.that(itemNames(), equals([
 *                     'Buy some milk',
 *                 ])),
 *             )
 *         })
 *     })
 * })
 * ```
 *
 * ### Configuring Serenity/JS using Playwright configuration file
 *
 * ```typescript
 * // playwright.config.ts
 * import { defineConfig } from '@playwright/test'
 * import type { Cast, TakeNotes } from '@serenity-js/core'
 * import type { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test'
 * import type { CallAnApi } from '@serenity-js/rest'
 *
 * export default defineConfig<SerenityFixtures & MyCustomOptions, SerenityWorkerFixtures> = {
 *
 *     // Register Serenity/JS reporter for Playwright Test
 *     // to enable integration with Serenity/JS stage crew members
 *     // and have them instantiated in the Playwright reporter process
 *     reporter: [
 *         [ '@serenity-js/playwright-test', {
 *             // Stage crew members instantiated in the test reporter process
 *             crew: [
 *                 '@serenity-js/serenity-bdd',
 *                 '@serenity-js/console-reporter',
 *                 [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
 *             ]
 *         }]
 *     ],
 *
 *     use: {
 *
 *         // Register Serenity/JS stage crew members
 *         // and have them instantiated in Playwright Test worker processes
 *         crew: [
 *             [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ]
 *         ],
 *
 *         // Name to be given to an actor injected via `actor` fixture
 *         defaultActorName: 'Alice',
 *
 *         // Any other Playwright options
 *         baseURL: 'https://todo-app.serenity-js.org/',
 *         video: 'on-first-retry',
 *         trace: 'on-first-retry',
 *     },
 * })
 * ```
 *
 * ## Learn more
 * - [Using Serenity/JS with Playwright Test](https://serenity-js.org/handbook/test-runners/playwright-test/)
 * - [`PlaywrightTestConfig`](https://serenity-js.org/api/playwright-test/#PlaywrightTestConfig)
 * - [`Cast`](https://serenity-js.org/api/core/class/Cast/)
 * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
 */
export interface SerenityFixtures {

    /**
     * Configures the name given to the default Serenity/JS [`actor`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actor)
     * injected into a [test scenario](https://serenity-js.org/api/playwright-test/function/it/).
     *
     * #### Learn more
     * - Declaring a Serenity/JS [test scenario](https://serenity-js.org/api/playwright-test/function/it/)
     * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
     */
    defaultActorName: string;

    /**
     * Configures the [stage crew members](https://serenity-js.org/api/core/class/SerenityConfig/#crew)
     * to be instantiated in Playwright Test worker processes.
     *
     * :::info Did you know?
     * By default, Serenity/JS registers a [`Photographer`](https://serenity-js.org/api/web/class/Photographer/).whoWill([`TakePhotosOfFailures`](https://serenity-js.org/api/web/class/TakePhotosOfFailures/)),
     * so that any test failures are automatically accompanied by a screenshot.
     *
     * If you prefer a different behaviour, you can configure the `crew` with an empty array to disable taking screenshots altogether (`crew: []`),
     * or with a [`Photographer`](https://serenity-js.org/api/web/class/Photographer/) who uses a different [`PhotoTakingStrategy`](https://serenity-js.org/api/web/class/PhotoTakingStrategy/), like to [`TakePhotosOfInteractions`](https://serenity-js.org/api/web/class/TakePhotosOfInteractions/).
     * :::
     *
     * #### Example
     *
     * ```typescript
     * // playwright.config.ts
     * import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test'
     * import { defineConfig } from '@playwright/test'
     *
     * export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
     *     use: {
     *         crew: [
     *             [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ]
     *         ],
     *     },
     * });
     * ```
     *
     * #### Learn more
     * - [`SerenityConfig.crew`](https://serenity-js.org/api/core/class/SerenityConfig/#crew)
     */
    crew: Array<ClassDescription | StageCrewMember | StageCrewMemberBuilder>;

    /**
     * Sets the [`cueTimeout`](https://serenity-js.org/api/core/class/SerenityConfig/#cueTimeout) to a given [duration](https://serenity-js.org/api/core/class/Duration/) or a numeric value in milliseconds.
     * Defaults to **5 seconds**.
     *
     * #### Learn more
     * - [`SerenityConfig.cueTimeout`](https://serenity-js.org/api/core/class/SerenityConfig/#cueTimeout)
     * - [`Discardable`](https://serenity-js.org/api/core/interface/Discardable/)
     * - [`Ability`](https://serenity-js.org/api/core/class/Ability/)
     */
    cueTimeout: number | Duration;

    /**
     * The maximum default amount of time allowed for interactions such as [`Wait.until`](https://serenity-js.org/api/core/class/Wait/#until)
     * to complete.
     *
     * Defaults to **5 seconds**, can be overridden per interaction.
     *
     * #### Learn more
     * - [`Wait.until`](https://serenity-js.org/api/core/class/Wait/#until)
     */
    interactionTimeout: number | Duration;

    /**
     * Convenience properties to be used with the [ability](https://serenity-js.org/api/core/class/Ability/)
     * to [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/),
     * in addition to Playwright [BrowserContextOptions](https://playwright.dev/docs/api/class-testoptions#test-options-context-options):
     *
     * - [`defaultNavigationTimeout`](https://serenity-js.org/api/playwright/interface/ExtraBrowserContextOptions/#defaultNavigationTimeout)
     * - [`defaultNavigationWaitUntil`](https://serenity-js.org/api/playwright/interface/ExtraBrowserContextOptions/#defaultNavigationWaitUntil)
     * - [`defaultTimeout`](https://serenity-js.org/api/playwright/interface/ExtraBrowserContextOptions/#defaultTimeout)
     *
     * #### Using `extraContextOptions` with the default cast of Serenity/JS actors
     *
     * ```typescript
     * // playwright.config.ts
     * import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test'
     * import { defineConfig } from '@playwright/test'
     *
     * export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
     *     use: {
     *         extraContextOptions: {
     *             defaultNavigationTimeout: 30_000,
     *         }
     *
     *         // Since `actors` property is not defined,
     *         // `extraContextOptions` will be passed to the default cast of Serenity/JS actors
     *         // and injected into the ability to `BrowseTheWebWithPlaywright`
     *         // that each actor receives.
     *     },
     * })
     * ```
     *
     * #### Using `extraContextOptions` with a custom cast of Serenity/JS actors
     *
     * ```typescript
     * // playwright.config.ts
     * import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test'
     * import { defineConfig } from '@playwright/test'
     *
     * export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
     *     use: {
     *         extraContextOptions: {
     *             defaultNavigationTimeout: 30_000,
     *         }
     *
     *         // Custom cast of actors receives the default `contextOptions` and
     *         // the `extraContextOptions` with the additional Serenity/JS properties.
     *         actors: async ({ browser, contextOptions, extraContextOptions }, use) => {
     *             const cast = Cast.where(actor => actor.whoCan(
     *                 BrowseTheWebWithPlaywright.using(browser, contextOptions, extraContextOptions),
     *                 TakeNotes.usingAnEmptyNotepad(),
     *             ))
     *
     *             await use(cast)
     *         },
     *     },
     * })
     * ```
     *
     * #### Learn more
     * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
     * - [Playwright Browser Context options](https://playwright.dev/docs/api/class-testoptions#test-options-context-options)
     * - [Playwright Test fixtures](https://playwright.dev/docs/test-fixtures)
     */
    extraContextOptions: Partial<ExtraBrowserContextOptions>;

    /**
     * Extra abilities given to the actors on top of the default ones provided by the [`actors`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actors) fixture.
     *
     * #### Extra abilities for all actors
     *
     * To give the same set of extra abilities to all the actors, make your `extraAbilities` fixture
     * return an array of [`Ability`](https://serenity-js.org/api/core/class/Ability/) objects.
     *
     * ```typescript
     * import { type Ability } from '@serenity-js/core';
     * import { describe, it, test } from '@serenity-js/playwright-test';
     * import { MyAbility } from './MyAbility';
     *
     * describe(`My feature`, () => {
     *
     *     test.use({
     *         extraAbilities: async ({}, use) => {
     *           const extraAbilities: Ability[] = [
     *             new MyAbility()
     *           ];
     *
     *           await use(extraAbilities);
     *         },
     *     });
     *
     *     it(`...`, async({ actor }) => {
     *       // ...
     *     });
     * });
     * ```
     *
     * #### Extra abilities for selected actors
     *
     * To give extra abilities only to selected actors, make your `extraAbilities` fixture return a `(actorName: string) => Ability[]` function that maps
     * the actor name to an array of [`Ability`](https://serenity-js.org/api/core/class/Ability/) objects.
     *
     * ```typescript
     * import { describe, it, test } from '@serenity-js/playwright-test';
     * import { MyAbility } from './MyAbility';
     *
     * describe(`My feature`, () => {
     *
     *     test.use({
     *         extraAbilities: async ({ }, use) => {
     *             await use((actorName: string) => {
     *                 // Alice gets the extra abilities, but others don't
     *                 return actorName === 'Alice'
     *                     ? [ new MyAbility() ]
     *                     : [];
     *             })
     *         }
     *     });
     *
     *     it(`...`, async({ actor }) => {
     *       // ...
     *     });
     * });
     * ```
     */
    extraAbilities: ((actorName: string) => Ability[]) | Ability[];

    /**
     * A cast of Serenity/JS actors to be used instead of the default cast
     * when instantiating [`actor`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actor)
     * and invoking [`actorCalled`](https://serenity-js.org/api/playwright-test/interface/SerenityWorkerFixtures/#actorCalled).
     *
     * :::info Did you know?
     * Serenity/JS [test APIs](https://serenity-js.org/api/playwright-test/function/it/) offer fixtures that set up the default cast of actors for you,
     * which should be sufficient in most web and HTTP API testing scenarios.
     *
     * Each one of the default actors receives the following [abilities](https://serenity-js.org/api/core/class/Ability/):
     * - [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/), connected to Playwright [`page`](https://playwright.dev/docs/test-fixtures) fixture
     * - [`TakeNotes`](https://serenity-js.org/api/core/class/TakeNotes/#usingAnEmptyNotepad)
     * - [`CallAnApi`](https://serenity-js.org/api/rest/class/CallAnApi/), pointing at the [`baseURL`](https://playwright.dev/docs/test-use-options#basic-options)
     *   and using any `proxy` settings in your Playwright config file.
     *
     * The easiest way to give your actors additional abilities is to use the [`extraAbilities`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#extraAbilities) fixture.
     * :::
     *
     * #### Overriding the default cast of Serenity/JS actors
     *
     * ```typescript
     * import { Ensure, equals } from '@serenity-js/assertions'
     * import { Cast, TakeNotes } from '@serenity-js/core'
     * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
     * import { CallAnApi } from '@serenity-js/rest'
     * import { describe, it, test } from '@serenity-js/playwright-test'
     *
     * interface MyNotes {
     *   username: string;
     * }
     *
     * describe(`Recording items`, () => {
     *
     *     test.use({
     *         extraContextOptions: {
     *             defaultNavigationTimeout: 30_000,
     *         },
     *
     *         actors: async ({ axios, extraAbilities, extraContextOptions, extraHTTPHeaders, page }, use) => {
     *             const cast = Cast.where(actor => {
     *                 const abilities = Array.isArray(extraAbilities)
     *                     ? extraAbilities
     *                     : extraAbilities(actor.name);
     *
     *                 return actor.whoCan(
     *                     BrowseTheWebWithPlaywright.usingPage(page, extraContextOptions),
     *                     TakeNotes.using<MyNotes>(Notepad.with({
     *                       username: 'example.username'
     *                     }),
     *                     CallAnApi.using(axios),
     *                     ...abilities,
     *                 )
     *             })
     *
     *             // Make sure to pass your custom cast to Playwright `use` callback
     *             await use(cast);
     *         },
     *     })
     *
     *     describe(`Todo List App`, () => {
     *
     *         it(`should allow me to add a todo item`, async ({ actor }) => {
     *             await actor.attemptsTo(
     *                 startWithAnEmptyList(),
     *
     *                 recordItem('Buy some milk'),
     *
     *                 Ensure.that(itemNames(), equals([
     *                     'Buy some milk',
     *                 ])),
     *             )
     *         })
     *     })
     * })
     *
     *
     * #### Learn more
     * - Declaring a Serenity/JS [test scenario](https://serenity-js.org/api/playwright-test/function/it/)
     * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
     */
    actors: Cast;

    /**
     * Default [`actor`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actor) injected into a [test scenario](https://serenity-js.org/api/playwright-test/function/it/).
     *
     * Using `actor` fixture is equivalent to invoking [`actorCalled`](https://serenity-js.org/api/playwright-test/interface/SerenityWorkerFixtures/#actorCalled)
     * with [`defaultActorName`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#defaultActorName).
     *
     * #### Learn more
     * - [`actorCalled`](https://serenity-js.org/api/playwright-test/interface/SerenityWorkerFixtures/#actorCalled)
     * - [`defaultActorName`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#defaultActorName)
     * - Declaring a Serenity/JS [test scenario](https://serenity-js.org/api/playwright-test/function/it/)
     */
    actor: Actor;

    /**
     * An instance of the Axios HTTP client, or default Axios request configurations,
     * to be used by the [`CallAnApi`](https://serenity-js.org/api/rest/class/CallAnApi/) ability,
     * provided to the actors via the [`actors`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actors) fixture.
     *
     * By default, Serenity/JS configures Axios to use the following settings from your Playwright configuration file:
     * - [`baseURL`](https://playwright.dev/docs/api/class-testoptions#test-options-base-url)
     * - [`proxy`](https://playwright.dev/docs/api/class-testoptions#test-options-proxy)
     * - [`extraHTTPHeaders`](https://playwright.dev/docs/api/class-testoptions#test-options-extra-http-headers)
     */
    axios: AxiosInstance | AxiosRequestConfigDefaults;
}

/**
 * Serenity/JS-specific worker-scope [Playwright Test fixtures](https://playwright.dev/docs/test-fixtures)
 * injected into your [test scenarios](https://serenity-js.org/api/playwright-test/function/it/).
 *
 * ## Example test scenario
 *
 * ```typescript
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { beforeAll, describe, it } from '@serenity-js/playwright-test'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *
 * describe('GitHub', () => {
 *
 *     beforeAll('Ensure system is ready to test', async ({ actorCalled }) => {
 *         await actorCalled('Stagehand')
 *             .whoCan(CallAnApi.at('https://www.githubstatus.com/api/v2/'))
 *             .attemptsTo(
 *                 Send.a(GetRequest.to('status.json')),
 *                 Ensure.that(
 *                     LastResponse.status(),
 *                     equals(200)
 *                 ),
 *                 Ensure.that(
 *                     LastResponse.body().status.description,
 *                     equals('All Systems Operational')
 *                 ),
 *             );
 *     });
 * });
 * ```
 *
 * ## Learn more
 * - [Using Serenity/JS with Playwright Test](https://serenity-js.org/handbook/test-runners/playwright-test/)
 */
export interface SerenityWorkerFixtures {
    /**
     * Name and version of the operating system that Playwright Test worker process runs on.
     */
    platform: { name: string, version: string };

    /**
     * Retrieves the root object of the Serenity/JS framework.
     */
    serenity: Serenity;

    /**
     * Uses the provided [cast](https://serenity-js.org/api/core/class/Cast/) of
     * [`actors`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actors) to instantiate
     * an [`Actor`](https://serenity-js.org/api/core/class/Actor/) called `name`
     * and inject it into a [test scenario](https://serenity-js.org/api/playwright-test/function/it/).
     *
     * Retrieves an existing actor if one has already been instantiated.
     *
     * #### Learn more
     * - Declaring a Serenity/JS [test scenario](https://serenity-js.org/api/playwright-test/function/it/)
     * - [`SerenityFixtures.actors`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actors)
     *
     * @param name
     */
    actorCalled: (name: string) => Actor;
}

