import type { Actor, Cast, Serenity } from '@serenity-js/core';

/**
 * Serenity/JS-specific [Playwright Test fixtures](https://playwright.dev/docs/test-fixtures)
 * injected into your [test scenarios](https://serenity-js.org/api/playwright-test/function/it/).
 *
 * ## Example test scenario
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
 * ## Learn more
 * - Declaring a Serenity/JS [test scenario](https://serenity-js.org/api/playwright-test/function/it/)
 * - [Grouping test scenarios](https://serenity-js.org/api/playwright-test/function/describe/)
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export interface SerenityFixtures {

    /**
     * Retrieves the root object of the Serenity/JS framework.
     */
    serenity: Serenity;

    /**
     * Name and version of the operating system that Playwright Test worker process runs on.
     */
    platform: { name: string, version: string };

    /**
     * A cast of Serenity/JS actors to be used instead of the default cast
     * when instantiating [`actor`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actor)
     * and invoking [`actorCalled`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actorCalled).
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
     *         defaultActorName: 'Serena',
     *         actors: ({ browser, contextOptions }, use) => {
     *             const cast = Cast.where(actor =>
     *                 actor.whoCan(
     *                     BrowseTheWebWithPlaywright.using(browser, contextOptions),
     *                     TakeNotes.usingAnEmptyNotepad(),
     *                 )
     *             )
     *
     *             // Make sure to pass your custom cast to Playwright `use` callback
     *             use(cast)
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
     */
    actors: Cast;

    /**
     * Uses the provided [cast](https://serenity-js.org/api/core/class/Cast/) of [`actors`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actors) to instantiate an [`Actor`](https://serenity-js.org/api/core/class/Actor/) called `name`
     * and inject it into a [test scenario](https://serenity-js.org/api/playwright-test/function/it/).
     *
     * Retrieves an existing actor if one has already been instantiated.
     *
     * #### Learn more
     * - Declaring a Serenity/JS [test scenario](https://serenity-js.org/api/playwright-test/function/it/)
     * - [`SerenityOptions.actors`](https://serenity-js.org/api/playwright-test/interface/SerenityOptions/#actors)
     * - [`SerenityFixtures.actors`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actors)
     *
     * @param name
     */
    actorCalled: (name: string) => Actor;

    /**
     * Default [`actor`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actor) injected into a [test scenario](https://serenity-js.org/api/playwright-test/function/it/).
     *
     * Using `actor` fixture is equivalent to invoking [`actorCalled`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actorCalled) with [`defaultActorName`](https://serenity-js.org/api/playwright-test/interface/SerenityOptions/#defaultActorName).
     *
     * #### Learn more
     * - [`actorCalled`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/#actorCalled)
     * - [`SerenityOptions.defaultActorName`](https://serenity-js.org/api/playwright-test/interface/SerenityOptions/#defaultActorName)
     * - Declaring a Serenity/JS [test scenario](https://serenity-js.org/api/playwright-test/function/it/)
     */
    actor: Actor;
}
