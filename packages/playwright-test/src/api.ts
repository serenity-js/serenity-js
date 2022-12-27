import { Browser, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, test as base, TestInfo, TestType } from '@playwright/test';
import { Actor, Cast, Duration, Serenity, serenity as serenityInstance, SerenityConfig, StageCrewMember } from '@serenity-js/core';
import { SceneFinishes, SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, PlatformTag } from '@serenity-js/core/lib/model';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import * as os from 'os';
import { JSONValue } from 'tiny-types';

import { DomainEventBuffer, PlaywrightStepReporter, SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE } from './reporter';

export interface SerenityFixtures extends SerenityConfig {
    actors: Cast;
    crew: StageCrewMember[];
    cueTimeout: Duration;
    serenity: Serenity;
    platform: { name: string, version: string };
    actorCalled: (name: string) => Actor;
    defaultActorName: string;
    actor: Actor;
}

export type SerenityTestType = TestType<PlaywrightTestArgs & PlaywrightTestOptions & SerenityFixtures, PlaywrightWorkerArgs & PlaywrightWorkerOptions>;

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

    actors: async ({ browser }: { browser: Browser }, use) => {
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
export const describe: SerenityTestType['describe'] = it.describe;
export const beforeAll: SerenityTestType['beforeAll'] = it.beforeAll;
export const beforeEach: SerenityTestType['beforeEach'] = it.beforeEach;
export const afterEach: SerenityTestType['afterEach'] = it.afterEach;
export const afterAll: SerenityTestType['afterAll'] = it.afterAll;
export const expect: SerenityTestType['expect'] = it.expect;
