import type { PlaywrightTestOptions, PlaywrightWorkerArgs, TestFixture } from '@playwright/test';
import type { Cast, ClassDescription, Duration, StageCrewMember, StageCrewMemberBuilder } from '@serenity-js/core';
import type { PlaywrightOptions } from '@serenity-js/playwright';

/**
 * Configuration object accepted by `@serenity-js/playwright-test`.
 *
 * ## Example
 *
 * ```typescript
 * // playwright.config.ts
 * import type { Cast, TakeNotes } from '@serenity-js/core'
 * import type { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test'
 * import type { CallAnApi } from '@serenity-js/rest'
 *
 * // Define any custom configuration options, if needed
 * interface MyCustomOptions {
 *     apiUrl: string;
 * }
 *
 * const config: PlaywrightTestConfig<MyCustomOptions> = {
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
 *         // Register a custom cast of Serenity/JS actors
 *         // if you don't want to use the default ones
 *         actors: ({ browser, contextOptions, apiUrl }, use) => {
 *              const cast = Cast.where(actor =>
 *                  actor.whoCan(
 *                      BrowseTheWebWithPlaywright.using(browser, contextOptions),
 *                      TakeNotes.usingAnEmptyNotepad(),
 *                      CallAnApi.at(apiUrl),
 *                  )
 *              )
 *
 *              use(cast)
 *         },
 *
 *         // Name to be given to an actor injected via `actor` fixture
 *         defaultActorName: 'Alice',
 *
 *         // Any custom options, as per the MyCustomOptions interface
 *         apiUrl: 'https://api.serenity-js.org/v1'
 *
 *         // Any other Playwright options
 *         baseURL: 'https://todo-app.serenity-js.org/',
 *         video: 'on-first-retry',
 *         trace: 'on-first-retry',
 *     },
 * }
 *
 * export default config
 * ```
 *
 * ## Learn more
 * - [`PlaywrightTestConfig`](https://serenity-js.org/api/playwright-test/#PlaywrightTestConfig)
 * - [`Cast`](https://serenity-js.org/api/core/class/Cast/)
 * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
 */
export interface SerenityOptions {

    /**
     * Configures the [`Cast`](https://serenity-js.org/api/core/class/Cast/) of [`SerenityConfig.actors|actors`](https://serenity-js.org/api/core/class/SerenityConfig/#actors) to be used when injecting an [`actor`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actor)
     * or invoking [`actorCalled`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actorCalled) in a [test scenario](https://serenity-js.org/api/playwright-test/function/it/).
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
     * #### Using a custom crew of Serenity/JS actors
     *
     * ```typescript
     * // playwright.config.ts
     * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test'
     * import { Cast, TakeNotes } from '@serenity-js/core'
     * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
     * import { CallAnApi } from '@serenity-js/rest'
     *
     * // Define any custom configuration options, if needed
     * interface MyCustomOptions {
     *     apiUrl: string;
     * }
     *
     * // Parameterise PlaywrightTestConfig with MyCustomOptions
     * // to enable type checking of any custom properties
     * const config: PlaywrightTestConfig<MyCustomOptions> = {
     *     use: {
     *         contextOptions: {
     *             defaultNavigationTimeout: 30_000,
     *         },
     *
     *         // custom properties
     *         apiUrl: 'https://api.serenity-js.org/v1',
     *
     *         // Custom cast of actors receives `contextOptions`
     *         // with the additional Serenity/JS properties (see `PlaywrightOptions`),
     *         // as well as any other custom properties you define in the destructuring expression,
     *         // such as `apiUrl`.
     *         actors: ({ browser, contextOptions, apiUrl }, use) => {
     *             const cast = Cast.where(actor => actor.whoCan(
     *                 BrowseTheWebWithPlaywright.using(browser, contextOptions),
     *                 TakeNotes.usingAnEmptyNotepad(),
     *                 CallAnApi.at(apiUrl),
     *             ))
     *
     *             // Make sure to pass your custom cast to Playwright `use` callback
     *             use(cast)
     *         },
     *     },
     * };
     * export default config
     * ```
     *
     * #### Learn more
     * - Declaring a Serenity/JS [test scenario](https://serenity-js.org/api/playwright-test/function/it/)
     * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
     */
    actors: TestFixture<Cast, PlaywrightTestOptions & PlaywrightWorkerArgs>

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
     * Configures the [`SerenityConfig.crew|stage crew members`](https://serenity-js.org/api/core/class/SerenityConfig/#crew|stage crew members)
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
     * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test'
     *
     * const config: PlaywrightTestConfig = {
     *     use: {
     *         crew: [
     *             [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ]
     *         ],
     *     },
     * };
     * export default config
     * ```
     *
     * #### Learn more
     * - [`SerenityConfig.crew`](https://serenity-js.org/api/core/class/SerenityConfig/#crew)
     */
    crew: Array<ClassDescription | StageCrewMember | StageCrewMemberBuilder>;

    /**
     * Sets the [`SerenityConfig.cueTimeout|cueTimeout`](https://serenity-js.org/api/core/class/SerenityConfig/#cueTimeout) to a given [duration](https://serenity-js.org/api/core/class/Duration/) or a numeric value in milliseconds.
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
    interactionTimeout?: Duration;

    /**
     * Playwright [BrowserContextOptions](https://playwright.dev/docs/api/class-testoptions#test-options-context-options),
     * augmented with several convenience properties to be used with the [ability](https://serenity-js.org/api/core/class/Ability/)
     * to [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/).
     *
     * Additional convenience properties include:
     * - [`PlaywrightOptions.defaultNavigationTimeout`](https://serenity-js.org/api/playwright/interface/PlaywrightOptions/#defaultNavigationTimeout)
     * - [`PlaywrightOptions.defaultNavigationWaitUntil`](https://serenity-js.org/api/playwright/interface/PlaywrightOptions/#defaultNavigationWaitUntil)
     * - [`PlaywrightOptions.defaultTimeout`](https://serenity-js.org/api/playwright/interface/PlaywrightOptions/#defaultTimeout)
     *
     * #### Using `contextOptions` with the default cast of Serenity/JS actors
     *
     * ```typescript
     * // playwright.config.ts
     * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test'
     *
     * const config: PlaywrightTestConfig = {
     *     use: {
     *         contextOptions: {
     *             defaultNavigationTimeout: 30_000,
     *         }
     *
     *         // Since `actors` property is not defined,
     *         // `contextOptions` will be passed to the default cast of Serenity/JS actors
     *         // and injected into the ability to `BrowseTheWebWithPlaywright`
     *         // that each actor receives.
     *     },
     * };
     * export default config;
     * ```
     *
     * #### Using `contextOptions` with a custom cast of Serenity/JS actors
     *
     * ```typescript
     * // playwright.config.ts
     * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test'
     *
     * const config: PlaywrightTestConfig = {
     *     use: {
     *         contextOptions: {
     *             defaultNavigationTimeout: 30_000,
     *         }
     *
     *         // Custom cast of actors receives `contextOptions` with the
     *         // additional Serenity/JS properties.
     *         actors: ({ browser, contextOptions }, use) => {
     *             const cast = Cast.where(actor => actor.whoCan(
     *                 BrowseTheWebWithPlaywright.using(browser, contextOptions),
     *                 TakeNotes.usingAnEmptyNotepad(),
     *             ))
     *
     *             use(cast)
     *         },
     *     },
     * };
     * export default config;
     * ```
     *
     * #### Learn more
     * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
     * - [Playwright Browser Context options](https://playwright.dev/docs/api/class-testoptions#test-options-context-options)
     * - [Playwright Test fixtures](https://playwright.dev/docs/test-fixtures)
     */
    contextOptions: PlaywrightOptions;
}
