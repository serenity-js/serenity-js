import { Ensure, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';

describe('Dashboard', () => {

    describe('Confidence and KPIs', () => {

        it('shows the overall confidence score', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Confidence').value(), includes('84')),
            );
        });

        it('shows the pass rate with the number of passing scenarios', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Pass Rate').value(), includes('75')),
                Ensure.that(dashboardView.kpiCardCalled('Pass Rate').subtitle(), includes('passing')),
            );
        });

        it('shows the failed scenario count', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Failed').value(), includes('5')),
            );
        });

        it('shows the consistency percentage', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Consistency').value(), includes('80')),
            );
        });

        it('shows the total scenario count across all runs', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Confidence').accessibleLabel(), includes('Confidence')),
                Ensure.that(dashboardView.kpiCardAt(1).accessibleLabel(), includes('Pass rate')),
            );
        });

        it('shows the CI branch information', async ({ page }) => {
            await page.waitForSelector('.kpi-card, .kpi-value');
            await page.locator('body').filter({ hasText: 'main' }).first().waitFor();
        });

        it('shows the CI commit reference', async ({ page }) => {
            await page.waitForSelector('.kpi-card, .kpi-value');
            await page.locator('body').filter({ hasText: 'abc1234' }).first().waitFor();
        });
    });
});
