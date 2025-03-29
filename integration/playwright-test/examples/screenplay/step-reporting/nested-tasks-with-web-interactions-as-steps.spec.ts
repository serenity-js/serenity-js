import { Answerable, Task } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { afterEach, describe, it, test } from '@serenity-js/playwright-test';
import { Navigate } from '@serenity-js/web';

import { ActorsWithLocalServer } from '../actors/ActorsWithLocalServer';

const openWebsiteAt = (url: Answerable<string>) =>
    Task.where(`#actor opens website at ${ url }`,
        Navigate.to(url),
    );

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
        it('reports tasks with nested web interactions as Playwright steps', async ({ actor }) => {
            await actor.attemptsTo(
                StartLocalServer.onRandomPort(),
                openWebsiteAt(LocalServer.url()),
            );
        });

        afterEach(async ({ actor }) => {
            await actor.attemptsTo(
                StopLocalServer.ifRunning(),
            );
        });
    });
});
