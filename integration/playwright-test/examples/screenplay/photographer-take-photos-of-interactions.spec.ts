import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { afterEach, describe, it } from '@serenity-js/playwright-test';
import { Navigate } from '@serenity-js/web';

describe('Playwright Test reporting', () => {

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
