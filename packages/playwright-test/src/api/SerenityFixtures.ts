import { Actor, Cast, Serenity } from '@serenity-js/core';

/**
 * Serenity/JS-specific [Playwright Test fixtures](https://playwright.dev/docs/test-fixtures)
 * injected into your {@apilink it|test scenarios}.
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
 * - Declaring a Serenity/JS {@apilink it|test scenario}
 * - {@apilink describe|Grouping test scenarios}
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
     * when instantiating {@apilink SerenityFixtures.actor|actor}
     * and invoking {@apilink SerenityFixtures.actorCalled|actorCalled}.
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
     * Uses the provided {@apilink Cast} of {@apilink SerenityFixtures.actors|actors} to instantiate an {@apilink Actor} called `name`
     * and inject it into a {@apilink it|test scenario}.
     *
     * Retrieves an existing actor if one has already been instantiated.
     *
     * #### Learn more
     * - Declaring a Serenity/JS {@apilink it|test scenario}
     * - {@apilink SerenityOptions.actors}
     * - {@apilink SerenityFixtures.actors}
     *
     * @param name
     */
    actorCalled: (name: string) => Actor;

    /**
     * Default {@apilink SerenityFixtures.actor|actor} injected into a {@apilink it|test scenario}.
     *
     * Using `actor` fixture is equivalent to invoking {@apilink SerenityFixtures.actorCalled|actorCalled} with {@apilink SerenityOptions.defaultActorName|defaultActorName}.
     *
     * #### Learn more
     * - {@apilink SerenityFixtures.actorCalled|actorCalled}
     * - {@apilink SerenityOptions.defaultActorName}
     * - Declaring a Serenity/JS {@apilink it|test scenario}
     */
    actor: Actor;
}
