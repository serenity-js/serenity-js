import { Ensure, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';

describe('System Context', () => {

    describe('Environment Details', () => {

        it('shows the test runner', async ({ actor, systemContextView }) => {
            await actor.attemptsTo(
                systemContextView.open(),

                Ensure.that(systemContextView.testRunner(), includes('Playwright')),
            );
        });

        it('shows the Node.js version', async ({ actor, systemContextView }) => {
            await actor.attemptsTo(
                systemContextView.open(),

                Ensure.that(systemContextView.nodeVersion(), includes(process.versions.node)),
            );
        });

        it('shows the CI provider information', async ({ actor, systemContextView }) => {
            await actor.attemptsTo(
                systemContextView.open(),

                Ensure.that(systemContextView.ciProvider(), includes('GitHub Actions')),
                Ensure.that(systemContextView.ciBuildNumber(), includes('42')),
                Ensure.that(systemContextView.ciBranch(), includes('main')),
                Ensure.that(systemContextView.ciCommit(), includes('abc1234')),
            );
        });

        it('shows the commit message', async ({ page }) => {
            await page.goto('/index.html#/system');
            await page.waitForSelector('.context-grid');
            await page.locator('body').filter({ hasText: 'fix: resolve flaky test' }).first().waitFor();
        });
    });
});
