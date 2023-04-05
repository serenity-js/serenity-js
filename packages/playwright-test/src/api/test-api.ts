import { test as base, TestInfo } from '@playwright/test';
import { AnsiDiffFormatter, Cast, Duration, serenity as serenityInstance, TakeNotes } from '@serenity-js/core';
import { SceneFinishes, SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, PlatformTag } from '@serenity-js/core/lib/model';
import { BrowseTheWebWithPlaywright, PlaywrightPage } from '@serenity-js/playwright';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import * as os from 'os';
import { ensure, isFunction, JSONValue, property } from 'tiny-types';

import { DomainEventBuffer, PlaywrightStepReporter, SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE } from '../reporter';
import { SerenityFixtures } from './SerenityFixtures';
import { SerenityOptions } from './SerenityOptions';
import { SerenityTestType } from './SerenityTestType';

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
 * - {@apilink describe|Grouping test scenarios}
 * - {@apilink SerenityFixtures}
 * - [Playwright Test `test` function](https://playwright.dev/docs/api/class-test#test-call)
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export const it: SerenityTestType = base.extend<Omit<SerenityOptions, 'actors'> & SerenityFixtures>({

    actors: [
        ({ browser, contextOptions }, use) =>
            use(Cast.where(actor => actor.whoCan(
                BrowseTheWebWithPlaywright.using(browser, contextOptions),
                TakeNotes.usingAnEmptyNotepad(),
            ))),
        { option: true },
    ],

    defaultActorName: [
        'Serena',
        { option: true },
    ],

    cueTimeout: [
        Duration.ofSeconds(5),
        { option: true },
    ],

    interactionTimeout: [
        Duration.ofSeconds(5),
        { option: true },
    ],

    crew: [
        [
            Photographer.whoWill(TakePhotosOfFailures)
        ],
        { option: true },
    ],

    // eslint-disable-next-line no-empty-pattern
    platform: ({}, use) => {
        const platform = os.platform();

        // https://nodejs.org/api/process.html#process_process_platform
        const name = platform === 'win32'
            ? 'Windows'
            : (platform === 'darwin' ? 'macOS' : 'Linux');

        use({ name, version: os.release() });
    },

    serenity: async ({ crew, cueTimeout, interactionTimeout, platform }, use, info: TestInfo) => {

        const domainEventBuffer = new DomainEventBuffer();

        serenityInstance.configure({
            diffFormatter: new AnsiDiffFormatter(),
            cueTimeout: asDuration(cueTimeout),
            interactionTimeout: asDuration(interactionTimeout),
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

    actorCalled: async ({ serenity, actors, browser, browserName, contextOptions }, use) => {

        const sceneId = serenity.currentSceneId();

        serenity.engage(asCast(actors));

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

    actor: async ({ actorCalled, defaultActorName }, use) => {
        await use(actorCalled(defaultActorName));
    },

    page: async ({ actor }, use) => {
        const page = (await BrowseTheWebWithPlaywright.as(actor).currentPage()) as unknown as PlaywrightPage;
        const nativePage = await page.nativePage();

        await use(nativePage);
    },
});

function asDuration(maybeDuration: number | Duration): Duration {
    return maybeDuration instanceof Duration
        ? maybeDuration
        : Duration.ofMilliseconds(maybeDuration);
}

function asCast(maybeCast: unknown): Cast {
    return ensure('actors', maybeCast as Cast, property('prepare', isFunction()));
}

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
 * - Declaring a Serenity/JS {@apilink it|test scenario}
 * - [Playwright Test `describe` function](https://playwright.dev/docs/api/class-test#test-describe-1)
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export const describe: SerenityTestType['describe'] = it.describe;
export const beforeAll: SerenityTestType['beforeAll'] = it.beforeAll;
export const beforeEach: SerenityTestType['beforeEach'] = it.beforeEach;
export const afterEach: SerenityTestType['afterEach'] = it.afterEach;
export const afterAll: SerenityTestType['afterAll'] = it.afterAll;
export const expect: SerenityTestType['expect'] = it.expect;
