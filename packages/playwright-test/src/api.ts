import { PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, test as base, TestInfo, TestType } from '@playwright/test';
import { Actor, Cast, Duration, Serenity, serenity as serenityInstance, StageCrewMember } from '@serenity-js/core';
import { SceneFinishes, SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, PlatformTag } from '@serenity-js/core/lib/model';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import * as os from 'os';
import { JSONValue } from 'tiny-types';

import { DomainEventBuffer, PlaywrightStepReporter, SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE } from './reporter';

/**
 * Serenity/JS-specific [Playwright Test fixtures](https://playwright.dev/docs/test-fixtures).
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
 * - Declaring a test scenario using {@apilink it}
 * - Grouping test scenarios using {@apilink describe}
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export interface SerenityFixtures {

    /**
     * Configures the {@apilink Cast} of {@apilink SerenityConfig.actors|actors} to be used when injecting an {@apilink SerenityFixtures.actor|actor}
     * or invoking {@apilink SerenityFixtures.actorCalled|actorCalled} in a {@apilink it|test scenario}.
     *
     * #### Learn more
     * - Declaring a test scenario using {@apilink it}
     */
    actors: Cast;

    /**
     * Configures the {@apilink SerenityConfig.crew|stage crew}
     */
    crew: StageCrewMember[];

    /**
     * Configures the {@apilink SerenityConfig.cueTimeout|cueTimeout}
     */
    cueTimeout: Duration;

    /**
     * Retrieves the root object of the Serenity/JS framework.
     */
    serenity: Serenity;

    /**
     * Name and version of the operating system the Playwright Test runs on.
     */
    platform: { name: string, version: string };

    /**
     * Uses the provided {@apilink Cast} of {@apilink SerenityFixtures.actors|actors} to instantiate an {@apilink Actor} called `name`
     * and inject it into a {@apilink it|test scenario}.
     * Retrieves an existing actor if one has already been instantiated.
     *
     * #### Learn more
     * - Declaring a test scenario using {@apilink it}
     *
     * @param name
     */
    actorCalled: (name: string) => Actor;

    /**
     * Configures the name given to the default {@apilink SerenityFixtures.actor|actor} injected into the {@apilink it|test scenario}.
     *
     * #### Learn more
     * - Declaring a test scenario using {@apilink it}
     */
    defaultActorName: string;
    /**
     * Default {@apilink SerenityFixtures.actor|actor} injected into a {@apilink it|test scenario}.
     *
     * #### Learn more
     * - {@apilink SerenityFixtures.actorCalled|actorCalled}
     * - Declaring a test scenario using {@apilink it}
     */
    actor: Actor;
}

export type SerenityTestType = TestType<PlaywrightTestArgs & PlaywrightTestOptions & SerenityFixtures, PlaywrightWorkerArgs & PlaywrightWorkerOptions>;

/**
 * Declares a single test scenario.
 *
 * ## Example
 *
 * ```typescript
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { describe, it } from '@serenity-js/playwright-test'
 *
 * describe(`Todo List App`, () => {
 *
 *     it(`should allow me to add a todo item`, async ({ actor }) => {
 *         await actor.attemptsTo(
 *             startWithAnEmptyList(),
 *
 *             recordItem('Buy some milk'),
 *
 *             Ensure.that(itemNames(), equals([
 *                 'Buy some milk',
 *             ])),
 *         )
 *     })
 *
 *     it('supports multiple actors using separate browsers', async ({ actorCalled }) => {
 *         await actorCalled('Alice').attemptsTo(
 *             startWithAListContaining(
 *                 'Feed the cat'
 *             ),
 *         )
 *
 *         await actorCalled('Bob').attemptsTo(
 *             startWithAListContaining(
 *                 'Walk the dog'
 *             ),
 *         )
 *
 *         await actorCalled('Alice').attemptsTo(
 *             Ensure.that(itemNames(), equals([
 *                 'Feed the cat'
 *             ])),
 *         )
 *
 *         await actorCalled('Bob').attemptsTo(
 *             Ensure.that(itemNames(), equals([
 *                 'Walk the dog'
 *             ])),
 *         )
 *     })
 * })
 * ```
 *
 * ## Learn more
 * - Grouping test scenarios using {@apilink describe}
 * - {@apilink SerenityFixtures}
 * - [Playwright Test `test` function](https://playwright.dev/docs/api/class-test#test-call)
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export const it: SerenityTestType = base.extend<SerenityFixtures>({
    cueTimeout: Duration.ofSeconds(5),

    crew: [],

    // eslint-disable-next-line no-empty-pattern
    platform: ({}, use) => {
        const platform = os.platform();

        // https://nodejs.org/api/process.html#process_process_platform
        const name = platform === 'win32'
            ? 'Windows'
            : (platform === 'darwin' ? 'macOS' : 'Linux');

        use({ name, version: os.release() });
    },

    serenity: async ({ crew, cueTimeout, platform }, use, info: TestInfo) => {

        const domainEventBuffer = new DomainEventBuffer();

        serenityInstance.configure({
            cueTimeout: cueTimeout,
            crew: [
                ...crew,
                domainEventBuffer,
                new PlaywrightStepReporter(info),
            ],
        });

        serenityInstance.announce(new SceneTagged(
            serenityInstance.currentSceneId(),
            new PlatformTag(platform.name, platform.version),
            serenityInstance.currentTime(),
        ));

        await use(serenityInstance);

        const serialisedEvents: Array<{ type: string, value: JSONValue }> = [];

        for (const event of domainEventBuffer.flush()) {
            serialisedEvents.push({
                type: event.constructor.name,
                value: event.toJSON(),
            });

            if (event instanceof SceneTagged) {
                test.info().annotations.push({ type: event.tag.type, description: event.tag.name });
            }
        }

        base.info().attach('serenity-js-events.json', {
            contentType: SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE,
            body: Buffer.from(JSON.stringify(serialisedEvents), 'utf8'),
        });
    },

    actors: async ({ browser }, use) => {
        await use(Cast.whereEveryoneCan(BrowseTheWebWithPlaywright.using(browser)));
    },

    defaultActorName: 'Serena',

    actor: async ({ actorCalled, defaultActorName }, use) => {
        await use(actorCalled(defaultActorName));
    },

    actorCalled: async ({ serenity, actors, browser, browserName }, use) => {

        serenity.engage(actors);

        const sceneId = serenity.currentSceneId();

        const actorCalled = serenity.theActorCalled.bind(serenity);

        serenity.announce(new SceneTagged(
            sceneId,
            new BrowserTag(browserName, browser.version()),
            serenity.currentTime(),
        ));

        await use(actorCalled);

        serenity.announce(
            new SceneFinishes(sceneId, serenity.currentTime()),
        );

        await serenityInstance.waitForNextCue();
    },
});

export const test: SerenityTestType = it;

/**
 * Declares a group of test scenarios.
 *
 * ## Example
 *
 * ```typescript
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { describe, it, test } from '@serenity-js/playwright-test'
 * import { Photographer, TakePhotosOfFailures, Value } from '@serenity-js/web'
 *
 * describe(`Todo List App`, () => {
 *
 *     test.use({
 *         defaultActorName: 'Serena',
 *         crew: [
 *             Photographer.whoWill(TakePhotosOfFailures),
 *         ],
 *     })
 *
 *     it(`should allow me to add a todo item`, async ({ actor }) => {
 *         await actor.attemptsTo(
 *             startWithAnEmptyList(),
 *
 *             recordItem('Buy some milk'),
 *
 *             Ensure.that(itemNames(), equals([
 *                 'Buy some milk',
 *             ])),
 *         )
 *     })
 *
 *     it('should clear text input field when an item is added', async ({ actor }) => {
 *         await actor.attemptsTo(
 *             startWithAnEmptyList(),
 *
 *             recordItem('Buy some milk'),
 *
 *             Ensure.that(Value.of(newTodoInput()), equals('')),
 *         )
 *     })
 * })
 * ```
 *
 * ## Learn more
 * - Declaring a test scenario using {@apilink it}
 * - [Playwright Test `describe` function](https://playwright.dev/docs/api/class-test#test-describe-1)
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export const describe: SerenityTestType['describe'] = it.describe;
export const beforeAll: SerenityTestType['beforeAll'] = it.beforeAll;
export const beforeEach: SerenityTestType['beforeEach'] = it.beforeEach;
export const afterEach: SerenityTestType['afterEach'] = it.afterEach;
export const afterAll: SerenityTestType['afterAll'] = it.afterAll;
export const expect: SerenityTestType['expect'] = it.expect;
