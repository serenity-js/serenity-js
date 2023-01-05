import { Ensure, isTrue } from '@serenity-js/assertions';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { afterEach, describe, it } from '@serenity-js/playwright-test';
import { Navigate } from '@serenity-js/web';

describe('Playwright Test reporting', () => {

    describe('A screenplay scenario', () => {

        it('includes a screenshot when an interaction fails, by default', async ({ actor }) => {
            await actor.attemptsTo(
                StartLocalServer.onRandomPort(),
                Navigate.to(LocalServer.url()),
                Ensure.that(false, isTrue()),
            );
        });

        afterEach(async ({ actor }) => {
            await actor.attemptsTo(
                StopLocalServer.ifRunning(),
            );
        });
    });
});
