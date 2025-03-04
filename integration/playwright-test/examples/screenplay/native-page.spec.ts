import { endsWith, Ensure, equals, isPresent } from '@serenity-js/assertions';
import { Question, Wait } from '@serenity-js/core';
import { asyncMap } from '@serenity-js/core/lib/io';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { afterEach, describe, expect, it, test } from '@serenity-js/playwright-test';
import { BrowseTheWeb, By, Click, Navigate, Page, PageElement } from '@serenity-js/web';

import { ActorsWithLocalServer } from './actors/ActorsWithLocalServer';

describe('Playwright Test integration', () => {

    test.use({
        actors: ({ page, contextOptions }, use) => {
            use(new ActorsWithLocalServer(page, contextOptions));
        },
    });

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

        it(`registers the native page with actor's BrowsingSession`, async ({ actor }) => {
            await actor.attemptsTo(
                StartLocalServer.onRandomPort(),
                Navigate.to(LocalServer.url()),
            );

            const localServerUrl = await actor.answer(LocalServer.url());
            const expectedLocalServerUrl = localServerUrl + '/';

            const openPageUrls: string[] = await actor.answer(allPageUrls());

            expect(openPageUrls).toEqual([
                expectedLocalServerUrl
            ]);
        });

        it(`tracks newly opened pages`, async ({ actor }) => {
            await actor.attemptsTo(
                StartLocalServer.onRandomPort(),
                Navigate.to(LocalServer.url()),
                Click.on(PageElement.located(By.id('open-new-tab-link'))),
                Wait.until(Page.whichUrl(endsWith('/open-new-tab-link')), isPresent()),
            );

            const localServerUrl = await actor.answer(LocalServer.url());
            const expectedLocalServerUrl = localServerUrl + '/';
            const expectedNewTabUrl = localServerUrl + '/open-new-tab-link';

            const openPageUrls: string[] = await actor.answer(allPageUrls());

            expect(openPageUrls).toEqual([
                expectedLocalServerUrl,
                expectedNewTabUrl,
            ]);
        });

        afterEach(async ({ actor }) => {
            await actor.attemptsTo(
                StopLocalServer.ifRunning(),
            );
        });
    });
});

function allPageUrls() {
    return Question.about<string[]>('active page urls', async actor => {
        const pages = await BrowseTheWeb.as(actor).allPages();

        return asyncMap(pages, async page => {
            const url = await page.url();
            return url.href;
        });
    })
}
