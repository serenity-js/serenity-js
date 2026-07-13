import { Ensure, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { failingTest } from '../../src/scenarios';

describe('Test Scenarios', () => {

    describe('Reviewing Evidence', () => {

        it('shows screenshots at the point of failure', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                Ensure.that(scenarioDetailView.photoStripCount(), isGreaterThan(0)),
            );
        });

        it('allows copying the source location for the failing test', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                scenarioDetailView.copySourceLocation(),
            );
        });

        it('displays a video player for recorded test execution', async ({ page }) => {
            await page.goto('/index.html#/tests');
            await page.waitForSelector('.scenario-item');
            await page.locator('.scenario-item', { hasText: 'should display items' }).click();
            await page.waitForSelector('.activity-tree, .scenario-detail-header');

            const video = page.locator('video');
            await video.waitFor();
            const source = await video.getAttribute('src') || await video.locator('source').getAttribute('src');
            if (source) {
                await page.waitForFunction(
                    (s) => s.includes('.webm'),
                    source,
                );
            }
        });
    });
});
