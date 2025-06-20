import type {
    Cast,
    ClassDescription,
    Duration,
    Serenity,
    StageCrewMember,
    StageCrewMemberBuilder
} from '@serenity-js/core';
import type { Actor } from '@serenity-js/core';
import type { ExtraBrowserContextOptions } from '@serenity-js/playwright';

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
     * A cast of Serenity/JS actors to be used instead of the default cast
     * when instantiating [`actor`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actor)
     * and invoking [`actorCalled`](https://serenity-js.org/api/playwright-test/interface/SerenityWorkerFixtures/#actorCalled).
     *
     * :::info Did you know?
     * When you use `@serenity-js/playwright-test` [test APIs](https://serenity-js.org/api/playwright-test/function/it/), Serenity/JS already provides a default cast of actors for you.
     * Each one of the default actors receives [abilities](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/) and [`TakeNotes.usingAnEmptyNotepad`](https://serenity-js.org/api/core/class/TakeNotes/#usingAnEmptyNotepad).
     *
     * The default abilities should be sufficient in most web testing scenarios. However, you might want to override this default configuration
     * when you need your actors to [interact with REST APIs](https://serenity-js.org/api/rest/class/CallAnApi/),
     * [manage local servers](https://serenity-js.org/api/local-server/class/ManageALocalServer/),
     * start with a notepad that has some [initial state](https://serenity-js.org/api/core/class/TakeNotes/#using),
     * or receive [custom abilities](https://serenity-js.org/api/core/class/Ability/).
     * :::
     *
     *
     * #### Overriding the default cast of Serenity/JS actors
     *
     * ```typescript
     * import { Cast, TakeNotes } from '@serenity-js/core'
     * import { Ensure, equals } from '@serenity-js/assertions'
     * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
     * import { describe, it, test } from '@serenity-js/playwright-test'
     *
     * describe(`Recording items`, () => {
     *
     *     test.use({
     *         extraContextOptions: {
     *             defaultNavigationTimeout: 30_000,
     *         },
     *
     *         defaultActorName: 'Serena',
     *         actors: async ({ browser, contextOptions, extraContextOptions }, use) => {
     *             const cast = Cast.where(actor =>
     *                 actor.whoCan(
     *                     BrowseTheWebWithPlaywright.using(browser, contextOptions, extraContextOptions),
     *                     TakeNotes.usingAnEmptyNotepad(),
     *                 )
     *             )
     *
     *             // Make sure to pass your custom cast to Playwright `use` callback
     *             await use(cast)
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
     * Uses the provided [cast](https://serenity-js.org/api/core/class/Cast/) of [`actors`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actors) to instantiate an [`Actor`](https://serenity-js.org/api/core/class/Actor/) called `name`
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

