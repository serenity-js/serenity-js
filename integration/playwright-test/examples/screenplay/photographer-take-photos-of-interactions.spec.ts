import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { afterEach, describe, it, test } from '@serenity-js/playwright-test';
import { Navigate } from '@serenity-js/web';

import { ActorsWithLocalServer } from './actors/ActorsWithLocalServer';

describe('Playwright Test reporting', () => {

    test.use({
        userAgent: async ({ defaultActorName }, use) => {
            await use(defaultActorName)
        },
        actors: async ({ page, extraContextOptions }, use) => {
            await use(new ActorsWithLocalServer(page, extraContextOptions));
        },
    });

    describe('A screenplay scenario', () => {

        it('can include screenshots when the strategy is triggered', async ({ actor }) => {
            await actor.attemptsTo(
                StartLocalServer.onRandomPort(),
                Navigate.to(LocalServer.url()),
            );
        });

        afterEach(async ({ actor }) => {
            await actor.attemptsTo(
                StopLocalServer.ifRunning(),
            );
        });
    });
});
