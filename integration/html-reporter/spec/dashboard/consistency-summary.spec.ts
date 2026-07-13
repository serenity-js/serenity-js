import { contain, Ensure } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { degradedTest, failingTest } from '../../src/scenarios';

describe('Dashboard', () => {

    describe('Consistency Summary', () => {

        it('shows newly failing tests in the consistency card', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.consistencyCardScenarioNames(), contain(failingTest)),
                Ensure.that(dashboardView.consistencyCardScenarioNames(), contain(degradedTest)),
            );
        });

        it('shows recovered tests in the consistency card', async ({ page }) => {
            await page.waitForSelector('.kpi-card, .kpi-value');
            const section = page.locator('.card', { hasText: 'Consistency' });
            await section.filter({ hasText: 'should persist items' }).waitFor();
        });

        it('shows the slowest tests', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.slowestTestNames(), contain('Login should log in with valid credentials')),
            );
        });
    });
});
