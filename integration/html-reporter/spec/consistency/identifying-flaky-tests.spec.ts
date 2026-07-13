import { contain, Ensure, equals, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { degradedTest, failingTest } from '../../src/scenarios';

describe('Consistency', () => {

    describe('Identifying Flaky Tests', () => {

        it('lists inconsistent tests in the consistency view', async ({ actor, consistencyView }) => {
            await actor.attemptsTo(
                consistencyView.open(),

                Ensure.that(consistencyView.scenarioNames(), contain(degradedTest)),
                Ensure.that(consistencyView.scenarioNames(), contain(failingTest)),
            );
        });

        it('shows the inconsistency rate', async ({ page }) => {
            await page.goto('/index.html#/consistency');
            await page.waitForSelector('.scenario-item');
            await page.locator('body').filter({ hasText: '50%' }).first().waitFor();
        });

        it('allows drilling into a flaky scenario to understand the failure mode', async ({ actor, consistencyView, scenarioDetailView }) => {
            await actor.attemptsTo(
                consistencyView.open(),
                consistencyView.scenarioCalled(degradedTest).viewDetails(),

                Ensure.that(scenarioDetailView.hasError(), equals(true)),
                Ensure.that(scenarioDetailView.photoStripCount(), isGreaterThan(0)),
            );
        });

        it('shows a degraded test is present in the consistency view', async ({ actor, consistencyView }) => {
            await actor.attemptsTo(
                consistencyView.open(),

                Ensure.that(consistencyView.scenarioCalled(degradedTest).isPresent(), equals(true)),
            );
        });
    });
});
