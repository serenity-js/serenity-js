import type {
    Fixtures,
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions,
    TestInfo,
    TestType,
} from '@playwright/test';
import { test as playwrightBaseTest } from '@playwright/test';
import { AnsiDiffFormatter, Cast, Duration, serenity as serenityInstance, TakeNotes } from '@serenity-js/core';
import { SceneFinishes, SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, PlatformTag } from '@serenity-js/core/lib/model';
import { BrowseTheWebWithPlaywright, SerenitySelectorEngines } from '@serenity-js/playwright';
import { CallAnApi } from '@serenity-js/rest';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import * as os from 'os';
import type { JSONValue } from 'tiny-types';
import { ensure, isFunction, property } from 'tiny-types';

import {
    DomainEventBuffer,
    PlaywrightStepReporter,
    SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE
} from '../reporter';
import type { DescribeFunction } from './DescribeFunction';
import { PerformActivitiesAsPlaywrightSteps } from './PerformActivitiesAsPlaywrightSteps';
import type { SerenityFixtures } from './SerenityFixtures';
import type { SerenityOptions } from './SerenityOptions';

const serenitySelectorEngines = new SerenitySelectorEngines();

export const fixtures: Fixtures<Omit<SerenityOptions, 'actors'> & SerenityFixtures, object, PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions> = {
    actors: [
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        async ({ contextOptions, baseURL, extraHTTPHeaders, page, proxy }, use): Promise<void> => {
            await use(Cast.where(actor => actor.whoCan(
                BrowseTheWebWithPlaywright.usingPage(page, contextOptions),
                TakeNotes.usingAnEmptyNotepad(),
                CallAnApi.using({
                    baseURL: baseURL,
                    headers: extraHTTPHeaders,
                    proxy: proxy && proxy?.server
                        ? asProxyConfig(proxy)
                        : undefined,
                }),
            )));
        },
        { option: true },
    ],

    playwright: async ({ playwright }, use) => {
        await serenitySelectorEngines.ensureRegisteredWith(playwright.selectors);
        await use(playwright);
    },

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
    platform: async ({}, use) => {
        const platform = os.platform();

        // https://nodejs.org/api/process.html#process_process_platform
        const name = platform === 'win32'
            ? 'Windows'
            : (platform === 'darwin' ? 'macOS' : 'Linux');

        await use({ name, version: os.release() });
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

        info.attach('serenity-js-events.json', {
            contentType: SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE,
            body: Buffer.from(JSON.stringify(serialisedEvents), 'utf8'),
        });
    },

    actorCalled: async ({ serenity, actors, browser, browserName, contextOptions }, use) => {

        const sceneId = serenity.currentSceneId();

        serenity.engage(asCast(actors));

        const actorCalled = (name: string) => {
            const actor = serenity.theActorCalled(name);
            return actor.whoCan(new PerformActivitiesAsPlaywrightSteps(actor, serenity, it));
        };

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
};

/**
 * Serenity/JS BDD-style test API created by {@apilink useBase}.
 */
export type TestApi<TestArgs extends Record<string, any>, WorkerArgs extends Record<string, any>> =
    Pick<TestType<TestArgs, WorkerArgs>, 'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll' | 'expect'> &
    {
        /**
         * Creates a Serenity/JS BDD-style test API around the default Playwright [base test](https://playwright.dev/docs/test-fixtures)
         * and using custom test fixtures.
         *
         * ```typescript
         * import { useFixtures } from '@serenity-js/playwright-test'
         * import { Log } from '@serenity-js/core'
         *
         * const { describe, it } = useFixtures<{ message: string }>({
         *   message: 'Hello world!'
         * })
         *
         * describe('Serenity/JS useFixtures', () => {
         *
         *   it('enables injecting custom test fixtures into test scenarios', async ({ actor, message }) => {
         *     await actor.attemptsTo(
         *       Log.the(message),
         *     )
         *   })
         * })
         * ```
         *
         * Shorthand for [`useBase`](/api/playwright-test/function/useBase/)
         */
        useFixtures: <T extends Record<string, any>, W extends Record<string, any> = object>(customFixtures: Fixtures<T, W, TestArgs, WorkerArgs>) => TestApi<TestArgs & T, WorkerArgs & W>,
        it: TestType<TestArgs, WorkerArgs>,
        test: TestType<TestArgs, WorkerArgs>,
        describe: DescribeFunction,
    }

function createTestApi<TestArgs extends Record<string, any>, WorkerArgs extends Record<string, any> = object>(baseTest: TestType<TestArgs, WorkerArgs>): TestApi<TestArgs, WorkerArgs> {
    return {
        useFixtures<T extends Record<string, any>, W extends Record<string, any> = object>(customFixtures: Fixtures<T, W, TestArgs, WorkerArgs>): TestApi<TestArgs & T, WorkerArgs & W> {
            return createTestApi(baseTest.extend(customFixtures));
        },
        beforeAll: baseTest.beforeAll,
        beforeEach: baseTest.beforeEach,
        afterEach: baseTest.afterEach,
        afterAll: baseTest.afterAll,
        describe: baseTest.describe,
        expect: baseTest.expect,
        it: baseTest,
        test: baseTest,
    };
}

const api = createTestApi(playwrightBaseTest).useFixtures(fixtures);

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
 *   it(`should allow me to add a todo item`, async ({ actor }) => {
 *     await actor.attemptsTo(
 *       startWithAnEmptyList(),
 *
 *       recordItem('Buy some milk'),
 *
 *       Ensure.that(itemNames(), equals([
 *         'Buy some milk',
 *       ])),
 *     )
 *   })
 *
 *   it('supports multiple actors using separate browsers', async ({ actorCalled }) => {
 *     await actorCalled('Alice').attemptsTo(
 *       startWithAListContaining(
 *         'Feed the cat'
 *       ),
 *     )
 *
 *     await actorCalled('Bob').attemptsTo(
 *       startWithAListContaining(
 *         'Walk the dog'
 *       ),
 *     )
 *
 *     await actorCalled('Alice').attemptsTo(
 *       Ensure.that(itemNames(), equals([
 *         'Feed the cat'
 *       ])),
 *     )
 *
 *     await actorCalled('Bob').attemptsTo(
 *       Ensure.that(itemNames(), equals([
 *         'Walk the dog'
 *       ])),
 *     )
 *   })
 * })
 * ```
 *
 * ## Learn more
 * - [Grouping test scenarios](/api/playwright-test/function/describe/)
 * - {@apilink SerenityFixtures}
 * - [Playwright Test `test` function](https://playwright.dev/docs/api/class-test#test-call)
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export const it = api.it;

/**
 * Declares a single test scenario. Alias for [`it`](/api/playwright-test/function/it/).
 */
export const test = api.test;

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
 *   test.use({
 *     defaultActorName: 'Serena',
 *     crew: [
 *       Photographer.whoWill(TakePhotosOfFailures),
 *     ],
 *   })
 *
 *   it(`should allow me to add a todo item`, async ({ actor }) => {
 *     await actor.attemptsTo(
 *       startWithAnEmptyList(),
 *
 *       recordItem('Buy some milk'),
 *
 *       Ensure.that(itemNames(), equals([
 *         'Buy some milk',
 *       ])),
 *     )
 *   })
 *
 *   it('should clear text input field when an item is added', async ({ actor }) => {
 *     await actor.attemptsTo(
 *       startWithAnEmptyList(),
 *
 *       recordItem('Buy some milk'),
 *
 *       Ensure.that(Value.of(newTodoInput()), equals('')),
 *     )
 *   })
 * })
 * ```
 *
 * ## Learn more
 * - Declaring a Serenity/JS [test scenario](/api/playwright-test/function/it/)
 * - [Playwright Test `describe` function](https://playwright.dev/docs/api/class-test#test-describe-1)
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export const describe = api.describe;

export const beforeAll = api.beforeAll;

export const beforeEach = api.beforeEach;

export const afterEach = api.afterEach;

export const afterAll = api.afterAll;

export const expect = api.expect;

export const useFixtures = api.useFixtures;

/**
 * Creates a Serenity/JS BDD-style test API around the given Playwright [base test](https://playwright.dev/docs/test-fixtures).
 *
 * ## Using default configuration
 *
 * When your test scenario doesn't require [custom test fixtures](https://playwright.dev/docs/test-fixtures),
 * and you're happy with the default [base test](https://playwright.dev/docs/api/class-test#test-call) offered by Playwright,
 * you can import test API functions such as [`describe`](/api/playwright-test/function/describe/) and [`it`](/api/playwright-test/function/describe/) directly from `@serenity-js/playwright-test`.
 *
 * ```typescript
 * import { describe, it, test } from '@serenity-js/playwright-test'
 * import { Log } from '@serenity-js/core'
 *
 * // override default fixtures if needed
 * test.use({
 *   defaultActorName: 'Alice'
 * })
 *
 * describe('Serenity/JS default test API', () => {
 *
 *   it('enables easy access to actors and standard Playwright fixtures', async ({ actor, browserName }) => {
 *     await actor.attemptsTo(
 *       Log.the(browserName),
 *     )
 *   })
 * })
 * ```
 *
 * In the above example, importing test API functions directly from `@serenity-js/playwright-test` is the equivalent of the following setup:
 *
 * ```typescript
 * import { test as playwrightBaseTest } from '@playwright/test'
 * import { useBase } from '@serenity-js/playwright-test'
 *
 * const { describe, it, test, beforeEach, afterEach } = useBase(playwrightBaseTest)
 * ```
 *
 * ## Using custom fixtures
 *
 * When your test scenario requires [custom test fixtures](https://playwright.dev/docs/test-fixtures),
 * but you're still happy with the default [base test](https://playwright.dev/docs/api/class-test#test-call) offered by Playwright,
 * you can create fixture-aware test API functions such as [`describe`](/api/playwright-test/function/describe/) and [`it`](/api/playwright-test/function/describe/)
 * by calling [`useFixtures`](/api/playwright-test/function/useFixtures/).
 *
 * For example, you can create a test scenario using a static `message` fixture as follows:
 *
 * ```typescript
 * import { useFixtures } from '@serenity-js/playwright-test'
 * import { Log } from '@serenity-js/core'
 *
 * const { describe, it } = useFixtures<{ message: string }>({
 *   message: 'Hello world!'
 * })
 *
 * describe('Serenity/JS useFixtures', () => {
 *
 *   it('enables injecting custom test fixtures into test scenarios', async ({ actor, message }) => {
 *     await actor.attemptsTo(
 *       Log.the(message),
 *     )
 *   })
 * })
 * ```
 *
 * The value of your test fixtures can be either static or dynamic and based on the value of other fixtures.
 *
 * To create a dynamic test fixture use the [function syntax](https://playwright.dev/docs/test-fixtures):
 *
 * ```typescript
 * import { Log } from '@serenity-js/core'
 * import { useFixtures } from '@serenity-js/playwright-test'
 *
 * const { describe, it } = useFixtures<{ message: string }>({
 *   message: async ({ actor }, use) => {
 *     await use(`Hello, ${ actor.name }`);
 *   }
 * })
 *
 * describe('Serenity/JS useFixtures', () => {
 *
 *   it('enables injecting custom test fixtures into test scenarios', async ({ actor, message }) => {
 *     await actor.attemptsTo(
 *       Log.the(message),
 *     )
 *   })
 * })
 * ```
 *
 * In the above example, creating test API functions via `useFixtures` is the equivalent of the following setup:
 *
 * ```typescript
 * import { test as playwrightBaseTest } from '@playwright/test'
 * import { useBase } from '@serenity-js/playwright-test'
 *
 * const { describe, it, test, beforeEach, afterEach } = useBase(playwrightBaseTest)
 *   .useFixtures<{ message: string }>({
 *     message: async ({ actor }, use) => {
 *       await use(`Hello, ${ actor.name }`);
 *     }
 *   })
 * ```
 *
 * ## Using custom base test
 *
 * In cases where you need to use a non-default base test, for example when doing [UI component testing](https://playwright.dev/docs/test-components),
 * you can create Serenity/JS test API functions around your preferred base test.
 *
 * ```tsx
 * import { test as componentTest } from '@playwright/experimental-ct-react'
 * import { Ensure, contain } from '@serenity-js/assertions'
 * import { useBase } from '@serenity-js/playwright-test'
 * import { Enter, PageElement, CssClasses } from '@serenity-js/web'
 *
 * import EmailInput from './EmailInput';
 *
 * const { it, describe } = useBase(componentTest).useFixtures<{ emailAddress: string }>({
 *   emailAddress: ({ actor }, use) => {
 *     use(`${ actor.name }@example.org`)
 *   }
 * })
 *
 * describe('EmailInput', () => {
 *
 *   it('allows valid email addresses', async ({ actor, mount, emailAddress }) => {
 *     const nativeComponent = await mount(<EmailInput/>);
 *
 *     const component = PageElement.from(nativeComponent);
 *
 *     await actor.attemptsTo(
 *       Enter.theValue(emailAddress).into(component),
 *       Ensure.that(CssClasses.of(component), contain('valid')),
 *     )
 *   })
 * })
 * ```
 *
 * @param baseTest
 */
export function useBase<TestArgs extends Record<string, any>, WorkerArgs extends Record<string, any> = object>(
    baseTest: TestType<TestArgs, WorkerArgs>
): TestApi<Omit<SerenityOptions, 'actors'> & SerenityFixtures & TestArgs, WorkerArgs> {
    return createTestApi(baseTest)
        .useFixtures<TestArgs & Omit<SerenityOptions, 'actors'> & SerenityFixtures, WorkerArgs>(fixtures);
}

/**
 * @private
 * @param maybeDuration
 */
function asDuration(maybeDuration: number | Duration): Duration {
    return maybeDuration instanceof Duration
        ? maybeDuration
        : Duration.ofMilliseconds(maybeDuration);
}

/**
 * @private
 * @param maybeCast
 */
function asCast(maybeCast: unknown): Cast {
    return ensure('actors', maybeCast as Cast, property('prepare', isFunction()));
}

/**
 * @private
 * @param proxy
 */
function asProxyConfig(proxy: PlaywrightTestOptions['proxy']): {
    host: string,
    port?: number,
    auth?: { username: string, password: string }
} {

    // Playwright defaults to http when proxy.server does not define the protocol
    // See https://playwright.dev/docs/api/class-testoptions#test-options-proxy
    const hasProtocol = /[\dA-Za-z]+:\/\//.test(proxy.server);
    const proxyUrl = hasProtocol
        ? new URL(proxy.server)
        : new URL(`http://${ proxy.server }`);

    const host = proxyUrl.hostname;
    const port = proxyUrl.port
        ? Number(proxyUrl.port)
        : undefined;
    const auth = proxy.username
        ? { username: proxy.username, password: proxy.password || '' }
        : undefined;

    return { host, port, auth };
}