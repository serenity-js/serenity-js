import { Ensure, equals, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { failingTest } from '../../src/scenarios';

describe('Test Scenarios', () => {

    describe('Finding Scenarios', () => {

        it('shows all scenarios with their count', async ({ page }) => {
            await page.goto('/index.html#/tests');
            await page.waitForSelector('.scenario-item');
            await page.locator('body').filter({ hasText: 'Showing 20 of 20 test scenarios' }).first().waitFor();
        });

        it('locates a failing test by filtering and searching', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),

                Ensure.that(scenariosView.scenarioCalled(failingTest).isPresent(), equals(true)),
                Ensure.that(scenariosView.scenarioCalled(failingTest).outcome(), equals('FAILURE')),
                Ensure.that(scenariosView.scenarioCalled(failingTest).sourceLocation(), includes('checkout.spec.ts')),
            );
        });

        it('shows the error preview inline in the scenario list', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),

                Ensure.that(scenariosView.scenarioCalled(failingTest).errorPreview(), includes('Payment rejected')),
            );
        });

        it('filters scenarios by outcome', async ({ page }) => {
            await page.goto('/index.html#/tests');
            await page.waitForSelector('.scenario-item');
            await page.click('button:has-text("Passed")');
            await page.waitForFunction(() => document.body.textContent?.includes('Showing 15 of 20'));
        });

        it('shows a retried scenario as passed', async ({ page }) => {
            await page.goto('/index.html#/tests?search=%22edit%22');
            await page.waitForSelector('.scenario-item');
            const editItem = page.locator('.scenario-item', { hasText: 'should edit an item' });
            await editItem.waitFor();
            await editItem.locator('.scenario-outcome-icon.passed').waitFor();
        });

        it('navigates to scenario detail on click', async ({ page }) => {
            await page.goto('/index.html#/tests');
            await page.waitForSelector('.scenario-item');
            await page.click('.scenario-item');
            await page.waitForSelector('.activity-tree, .error-block, .scenario-detail-header');
        });
    });
});
