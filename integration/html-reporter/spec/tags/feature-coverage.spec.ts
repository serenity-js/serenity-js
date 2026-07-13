import { Ensure, equals } from '@serenity-js/assertions';

import { describe, it } from '../../src';

describe('Tags', () => {

    describe('Feature Coverage', () => {

        it('shows feature and browser tags', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),

                Ensure.that(tagsView.tagCount(), equals(7)),
            );
        });

        it('displays feature tag names', async ({ page }) => {
            await page.goto('/index.html#/tags');
            await page.waitForSelector('.tag-card');
            await page.locator('body').filter({ hasText: 'Todo List' }).first().waitFor();
        });

        it('navigates to filtered scenarios on tag click', async ({ page }) => {
            await page.goto('/index.html#/tags');
            await page.waitForSelector('.tag-card');
            await page.click('.tag-card');
            await page.waitForFunction(() => window.location.hash.includes('/tests'));
        });
    });
});
