import { Ensure, includes } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Navigation', () => {

    describe('Deep Linking', () => {

        it('restores search state from a deep link', async ({ page }) => {
            await page.goto('/index.html#/tests?search=%22complete+an+item%22');
            await page.waitForFunction(() => document.body.textContent?.includes('Showing 1 of 21'));
        });

        it('restores category filter from a deep link', async ({ page }) => {
            await page.goto('/index.html#/tests?search=%22Persistence%22');
            await page.waitForFunction(() => document.body.textContent?.includes('Showing 2 of 21'));
        });

        it('navigates to the consistency view via URL', async ({ actor, consistencyView }) => {
            await actor.attemptsTo(
                consistencyView.open(),

                Ensure.that(Page.current().url().href, includes('#/consistency')),
            );
        });

        it('preserves the report URL as shareable evidence', async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(Page.current().url().href, includes('index.html')),
            );
        });

        it('toggles between light and dark themes', async ({ page }) => {
            await page.goto('/index.html#/');
            await page.waitForSelector('button[aria-label="Toggle theme"]');
            const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
            await page.click('button[aria-label="Toggle theme"]');
            await page.waitForFunction(
                (initial) => document.documentElement.getAttribute('data-theme') !== initial,
                initialTheme,
            );
        });

        it('includes the project title in the document title', async ({ page }) => {
            await page.goto('/index.html#/');
            await page.waitForSelector('.kpi-card');
            await page.waitForFunction(() => document.title.includes('Serenity/JS'));
        });
    });
});
