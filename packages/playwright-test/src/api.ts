import { Fixtures,PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, test as base, TestType } from '@playwright/test';
import { Actor, Cast, Serenity, serenity as serenityPlaywrightWorkerInstance, StageCrewMember } from '@serenity-js/core';
import { SceneFinishes } from '@serenity-js/core/lib/events';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';

import { PlaywrightWorkerReporter } from './reporter';

export interface SerenityScenarioFixture {
    actorCalled: (name: string) => Actor;
}

export interface SerenityWorkerFixture {
    crew: StageCrewMember[],
    serenity: Serenity;
}

// TODO reduce PlaywrightTestArgs & PlaywrightTestOptions to { [key: string]: any}
// TODO reduce PlaywrightWorkerArgs & PlaywrightWorkerOptions to { browser: Browser}

export interface API<TestConfig extends PlaywrightTestArgs & PlaywrightTestOptions, WorkerConfig extends PlaywrightWorkerArgs & PlaywrightWorkerOptions> {
    it:         TestType<TestConfig & SerenityScenarioFixture, WorkerConfig & SerenityWorkerFixture>;
    test:       TestType<TestConfig & SerenityScenarioFixture, WorkerConfig & SerenityWorkerFixture>;
    describe:   TestType<TestConfig & SerenityScenarioFixture, WorkerConfig & SerenityWorkerFixture>['describe'];
    beforeAll:  TestType<TestConfig & SerenityScenarioFixture, WorkerConfig & SerenityWorkerFixture>['beforeAll'];
    beforeEach: TestType<TestConfig & SerenityScenarioFixture, WorkerConfig & SerenityWorkerFixture>['beforeEach'];
    afterEach:  TestType<TestConfig & SerenityScenarioFixture, WorkerConfig & SerenityWorkerFixture>['afterEach'];
    afterAll:   TestType<TestConfig & SerenityScenarioFixture, WorkerConfig & SerenityWorkerFixture>['afterAll'];
    expect:     TestType<TestConfig & SerenityScenarioFixture, WorkerConfig & SerenityWorkerFixture>['expect'];
}

export function createApi<
    TestConfig extends PlaywrightTestArgs & PlaywrightTestOptions, 
    WorkerConfig extends PlaywrightWorkerArgs & PlaywrightWorkerOptions
>(test: TestType<TestConfig, WorkerConfig>): API<TestConfig, WorkerConfig> {
    const it = test.extend<SerenityScenarioFixture, SerenityWorkerFixture>({

        serenity: [ async ({ browser }, use, workerInfo) => {
    
            serenityPlaywrightWorkerInstance.configure({
                // TODO inject via use({ cueTimeout: ... })
                // cueTimeout: undefined,
                crew: [
                    // TODO merge with other crew members injected via use({ crew: [] })
                    new PlaywrightWorkerReporter(
                        base.info.bind(base)
                    ),
                ],
            })
            
            serenityPlaywrightWorkerInstance.engage(
                // todo: allow for customisations via it.use(actors: ...)
                Cast.whereEveryoneCan(BrowseTheWebWithPlaywright.using(browser)),
            );

            // TODO: emit BrowserDetected
            //  https://github.com/microsoft/playwright/pull/3177/files

            // this.stage.announce(new SceneTagged(
            //     event.sceneId,
            //     new BrowserTag(browserName, browserVersion),
            //     this.stage.currentTime(),
            // ));

            // this.stage.announce(new SceneTagged(
            //     event.sceneId,
            //     new PlatformTag(platformName, platformVersion),
            //     this.stage.currentTime(),
            // ));

            // this.stage.announce(new AsyncOperationCompleted(
            //     new Description(`[${ this.constructor.name }] Detected web browser details`),
            //     id,
            //     this.stage.currentTime(),
            // ));
    
            await use(serenityPlaywrightWorkerInstance);
        }, { scope: 'worker' } ],
    
        actorCalled: async ({ serenity }, use) => {
            const actorCalled = serenity.theActorCalled.bind(serenity);
    
            await use(actorCalled);
    
            serenity.announce(
                new SceneFinishes(serenity.currentSceneId(), serenity.currentTime()),
            );
    
            await serenityPlaywrightWorkerInstance.waitForNextCue();
        },
    } as unknown as Fixtures<SerenityScenarioFixture, SerenityWorkerFixture, TestConfig, WorkerConfig>);

    return {
        it,
        test:       it,
        describe:   it.describe,
        beforeAll:  it.beforeAll,
        beforeEach: it.beforeEach,
        afterEach:  it.afterEach,
        afterAll:   it.afterAll,
        expect:     it.expect,
    }
}

const api = createApi<PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions>(base);

export const it         = api.it;
export const test       = api.test;
export const describe: typeof api['describe'] = api.describe;
export const beforeAll  = api.beforeAll;
export const beforeEach = api.beforeEach;
export const afterEach  = api.afterEach;
export const afterAll   = api.afterAll;
export const expect     = api.expect;
