import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

import type {
    Expect,
    Fixtures,
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions,
    TestInfo,
    TestType,
    WorkerInfo,
} from '@playwright/test';
import { mergeTests, test as playwrightBaseTest } from '@playwright/test';
import type { DiffFormatter } from '@serenity-js/core';
import { AnsiDiffFormatter, Cast, Clock, Duration, Serenity, TakeNotes } from '@serenity-js/core';
import { SceneFinishes, SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, PlatformTag } from '@serenity-js/core/lib/model';
import { BrowseTheWebWithPlaywright, SerenitySelectorEngines } from '@serenity-js/playwright';
import { CallAnApi } from '@serenity-js/rest';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { ensure, isFunction, property } from 'tiny-types';

import { PlaywrightSceneId } from '../events';
import { PlaywrightStepReporter, } from '../reporter';
import { PlaywrightTestSceneIdFactory } from '../reporter/PlaywrightTestSceneIdFactory';
import { PerformActivitiesAsPlaywrightSteps } from './PerformActivitiesAsPlaywrightSteps';
import type { SerenityFixtures, SerenityWorkerFixtures } from './serenity-fixtures';
import { WorkerEventStreamWriter } from './WorkerEventStreamWriter';

interface SerenityInternalFixtures {
    configureScenarioInternal: void;
}

interface SerenityInternalWorkerFixtures {
    configureWorkerInternal: void;
    sceneIdFactoryInternal: PlaywrightTestSceneIdFactory;
    diffFormatterInternal: DiffFormatter;
    eventStreamWriterInternal: WorkerEventStreamWriter;
}

export const fixtures: Fixtures<SerenityFixtures & SerenityInternalFixtures, SerenityWorkerFixtures & SerenityInternalWorkerFixtures, PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions> = {

    extraContextOptions: [
        { defaultNavigationWaitUntil: 'load' },
        { option: true }
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
        [ Photographer.whoWill(TakePhotosOfFailures) ],
        { option: true },
    ],

    axios: async ({ baseURL, extraHTTPHeaders, proxy }, use) => {
        await use({
            baseURL: baseURL,
            headers: extraHTTPHeaders,
            proxy: proxy && proxy?.server
                ? asProxyConfig(proxy)
                : undefined,
        })
    },

    actors: [
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        async ({ axios, extraAbilities, extraContextOptions, page }, use): Promise<void> => {
            await use(Cast.where(actor => {

                const abilities = Array.isArray(extraAbilities)
                    ? extraAbilities
                    : extraAbilities(actor.name);

                return actor.whoCan(
                    BrowseTheWebWithPlaywright.usingPage(page, extraContextOptions),
                    TakeNotes.usingAnEmptyNotepad(),
                    CallAnApi.using(axios),
                    ...abilities,
                );
            }));
        },
        { option: true },
    ],

    // eslint-disable-next-line no-empty-pattern,@typescript-eslint/explicit-module-boundary-types
    platform: [ async ({}, use) => {
        const platform = os.platform();

        // https://nodejs.org/api/process.html#process_process_platform
        const name = platform === 'win32'
            ? 'Windows'
            : (platform === 'darwin' ? 'macOS' : 'Linux');

        await use({ name, version: os.release() });
    }, { scope: 'worker' } ],

    diffFormatterInternal: [
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,no-empty-pattern
        async ({}, use) => {
            const diffFormatter = new AnsiDiffFormatter();
            await use(diffFormatter);
        },
        { scope: 'worker', box: true }
    ],

    sceneIdFactoryInternal: [
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,no-empty-pattern
        async ({}, use) => {
            await use(new PlaywrightTestSceneIdFactory());
        },
        { scope: 'worker', box: true },
    ],

    serenity: [
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        async ({ playwright, sceneIdFactoryInternal }, use, workerInfo) => {
            const clock = new Clock();
            const cwd = process.cwd();
            const serenity = new Serenity(clock, cwd, sceneIdFactoryInternal);

            const serenitySelectorEngines = new SerenitySelectorEngines();
            await serenitySelectorEngines.ensureRegisteredWith(playwright.selectors);

            await use(serenity);
        },
        { scope: 'worker', box: true }
    ],

    eventStreamWriterInternal: [
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,no-empty-pattern
        async ({}, use, workerInfo) => {

            const serenityOutputDirectory = path.join(workerInfo.project.outputDir, 'serenity');

            const eventStreamWriter = new WorkerEventStreamWriter(
                serenityOutputDirectory,
                workerInfo,
            );

            await use(eventStreamWriter);
        },
        { scope: 'worker', box: true },
    ],

    configureWorkerInternal: [
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        async ({ diffFormatterInternal, eventStreamWriterInternal, sceneIdFactoryInternal, serenity, browser }, use, info: WorkerInfo) => {

            serenity.configure({
                actors: Cast.where(actor => actor.whoCan(
                    BrowseTheWebWithPlaywright.using(browser),
                    TakeNotes.usingAnEmptyNotepad(),
                    // todo: consider making `axios` a fixture and injecting an ability to CallAnApi
                )),
                crew: [
                    eventStreamWriterInternal,
                ],
                diffFormatter: diffFormatterInternal,
            });

            sceneIdFactoryInternal.setTestId(`worker-${ info.workerIndex }`);
            const workerBeforeAllSceneId = serenity.assignNewSceneId();

            await use(void 0);

            await eventStreamWriterInternal.persistAll(workerBeforeAllSceneId);
        },
        { scope: 'worker', auto: true, box: true },
    ],

    configureScenarioInternal: [
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        async ({ actors, browser, browserName, crew, cueTimeout, diffFormatterInternal, eventStreamWriterInternal, interactionTimeout, platform, sceneIdFactoryInternal, serenity }, use, info: TestInfo) => {

            serenity.configure({
                actors: asCast(actors),
                diffFormatter: diffFormatterInternal,
                cueTimeout: asDuration(cueTimeout),
                interactionTimeout: asDuration(interactionTimeout),
                crew: [
                    ...crew,
                    new PlaywrightStepReporter(info),
                ],
            });

            const playwrightSceneId = PlaywrightSceneId.from(
                info.project.name,
                { id: info.testId, repeatEachIndex: info.repeatEachIndex },
                { retry: info.retry }
            );

            sceneIdFactoryInternal.setTestId(playwrightSceneId.value);
            const sceneId = serenity.assignNewSceneId();

            serenity.announce(
                new SceneTagged(
                    sceneId,
                    new PlatformTag(platform.name, platform.version),
                    serenity.currentTime(),
                ),
                new SceneTagged(
                    sceneId,
                    new BrowserTag(browserName, browser.version()),
                    serenity.currentTime(),
                )
            );

            await use(void 0);

            try {
                serenity.announce(
                    new SceneFinishes(sceneId, serenity.currentTime()),
                );

                await serenity.waitForNextCue();
            }
            finally {
                await eventStreamWriterInternal.persist(playwrightSceneId.value);
            }
        },
        { auto: true, box: true, }
    ],

    extraAbilities: [
        [],
        { option: true },
    ],

    actorCalled: [
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        async ({ serenity }, use) => {

            const actorCalled = (name: string) => {
                const actor = serenity.theActorCalled(name);

                return actor.whoCan(new PerformActivitiesAsPlaywrightSteps(actor, serenity, it));
            };

            await use(actorCalled);
        },
        { scope: 'worker' },
    ],

    actor: async ({ actorCalled, defaultActorName }, use) => {
        await use(actorCalled(defaultActorName));
    },
};

/**
 * Serenity/JS BDD-style test API created by [`useBase`](https://serenity-js.org/api/playwright-test/function/useBase/).
 */
export type TestApi<TestArgs extends object, WorkerArgs extends object> =
    Pick<TestType<TestArgs, WorkerArgs>, 'describe' | 'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll' | 'expect'> &
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
         * Shorthand for [`useBase`](https://serenity-js.org/api/playwright-test/function/useBase/)
         */
        useFixtures: <T extends object, W extends object = object>(
            customFixtures: Fixtures<T, W, TestArgs, WorkerArgs>
        ) => TestApi<TestArgs & T, WorkerArgs & W>,

        it: TestType<TestArgs, WorkerArgs>,
        test: TestType<TestArgs, WorkerArgs>,
    }

function createTestApi<BaseTestFixtures extends object, BaseWorkerFixtures extends object>(baseTest: TestType<BaseTestFixtures, BaseWorkerFixtures>): TestApi<BaseTestFixtures, BaseWorkerFixtures> {
    return {
        useFixtures<T extends Record<string, any>, W extends Record<string, any> = object>(customFixtures: Fixtures<T, W, BaseTestFixtures, BaseWorkerFixtures>): TestApi<BaseTestFixtures & T, BaseWorkerFixtures & W> {
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

const api = createTestApi(playwrightBaseTest).useFixtures<SerenityFixtures, SerenityWorkerFixtures>(fixtures);

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
 * - [Grouping test scenarios](https://serenity-js.org/api/playwright-test/function/describe/)
 * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
 * - [Playwright Test `test` function](https://playwright.dev/docs/api/class-test#test-call)
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export const it = api.it;

/**
 * Declares a single test scenario. Alias for [`it`](https://serenity-js.org/api/playwright-test/function/it/).
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
 * - Declaring a Serenity/JS [test scenario](https://serenity-js.org/api/playwright-test/function/it/)
 * - [Playwright Test `describe` function](https://playwright.dev/docs/api/class-test#test-describe-1)
 * - [Serenity/JS + Playwright Test project template](https://github.com/serenity-js/serenity-js-playwright-test-template/)
 */
export const describe = api.describe;

export const beforeAll = api.beforeAll;

export const beforeEach = api.beforeEach;

export const afterEach = api.afterEach;

export const afterAll = api.afterAll;

export const expect: Expect = api.expect;

export const useFixtures = api.useFixtures;

type MergedT<List> = List extends [ TestType<infer T, any>, ...(infer Rest) ] ? T & MergedT<Rest> : object;
type MergedW<List> = List extends [ TestType<any, infer W>, ...(infer Rest) ] ? W & MergedW<Rest> : object;

/**
 * Creates a Serenity/JS BDD-style test API around the given Playwright [base test](https://playwright.dev/docs/test-fixtures).
 *
 * ## Using default configuration
 *
 * When your test scenario doesn't require [custom test fixtures](https://playwright.dev/docs/test-fixtures),
 * and you're happy with the default [base test](https://playwright.dev/docs/api/class-test#test-call) offered by Playwright,
 * you can import test API functions such as [`describe`](https://serenity-js.org/api/playwright-test/function/describe/) and [`it`](https://serenity-js.org/api/playwright-test/function/describe/) directly from `@serenity-js/playwright-test`.
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
 * you can create fixture-aware test API functions such as [`describe`](https://serenity-js.org/api/playwright-test/function/describe/) and [`it`](https://serenity-js.org/api/playwright-test/function/describe/)
 * by calling [`useFixtures`](https://serenity-js.org/api/playwright-test/function/useFixtures/).
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
 * ## Merging multiple base tests
 *
 * To merge fixtures from multiple files or modules, pass them to `useBase`.
 *
 * ```tsx
 * import { test as componentTest } from '@playwright/experimental-ct-react'
 * import { test as a11yTest } from 'my-a11y-test-utils';
 * import { Ensure, contain } from '@serenity-js/assertions'
 * import { useBase } from '@serenity-js/playwright-test'
 * import { Enter, PageElement, CssClasses } from '@serenity-js/web'
 *
 * import EmailInput from './EmailInput';
 *
 * const { it, describe } = useBase(componentTest, a11yTest).useFixtures<{ emailAddress: string }>({
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
 * @param baseTests
 */
export function useBase<List extends any[]>(...baseTests: List): TestApi<MergedT<List> & SerenityFixtures, MergedW<List> & SerenityWorkerFixtures> {
    return createTestApi<MergedT<List>, MergedW<List>>(mergeTests(...baseTests))
        .useFixtures(fixtures as Fixtures<SerenityFixtures, SerenityWorkerFixtures, MergedT<List>, MergedW<List>>);
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
    protocol: string,
    host: string,
    port?: number,
    auth?: { username: string, password: string }
    bypass?: string;
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
    const bypass = proxy.bypass;

    return {
        protocol: proxyUrl.protocol,
        host,
        port,
        auth,
        bypass,
    };
}
