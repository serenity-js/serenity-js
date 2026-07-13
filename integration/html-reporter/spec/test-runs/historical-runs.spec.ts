import { Ensure, equals, isPresent } from '@serenity-js/assertions';
import { By, PageElement } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Test Runs', () => {

    describe('Historical Runs', () => {

        it('shows the trend chart and run count', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),

                Ensure.that(PageElement.located(By.css('canvas')).describedAs('trend chart'), isPresent()),
                Ensure.that(testRunsView.runCount(), equals(2)),
            );
        });

        it('navigates to filtered scenarios on run click', async ({ page }) => {
            await page.goto('/index.html#/test-runs');
            await page.waitForSelector('.scenario-item');
            await page.click('.scenario-item');
            await page.waitForFunction(() => window.location.hash.includes('/tests?run='));
        });
    });
});
