import { Ensure, equals } from '@serenity-js/assertions';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { afterEach, describe, expect, it } from '@serenity-js/playwright-test';
import { Navigate, Page } from '@serenity-js/web';

describe('Playwright Test integration', () => {

    describe('A screenplay scenario', () => {

        it('receives a page object associated with the default actor', async ({ actor, page }) => {
            await actor.attemptsTo(
                StartLocalServer.onRandomPort(),
                Navigate.to(LocalServer.url()),
            );

            const localServerUrl = await actor.answer(LocalServer.url());
            const expectedLocalServerUrl = localServerUrl + '/';

            expect(await page.url()).toEqual(expectedLocalServerUrl);
        });

        it('allows for interactions with the page object to change the state of the page associated with the actor', async ({ actor, page }) => {

            await actor.attemptsTo(
                StartLocalServer.onRandomPort(),
            );

            const localServerUrl = await actor.answer(LocalServer.url());
            const expectedLocalServerUrl = localServerUrl + '/';

            await page.goto(localServerUrl);

            await actor.attemptsTo(
                Ensure.that(Page.current().url().href, equals(expectedLocalServerUrl)),
            );

            expect(await page.url()).toEqual(expectedLocalServerUrl);
        });

        afterEach(async ({ actor }) => {
            await actor.attemptsTo(
                StopLocalServer.ifRunning(),
            );
        });
    });
});
