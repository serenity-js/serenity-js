import { Ensure, equals, includes } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Test Runs', () => {

    describe('Historical Runs', () => {

        it('shows the trend chart and run history', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),

                Ensure.that(testRunsView.hasTrendChart(), equals(true)),
                Ensure.that(testRunsView.runCount(), equals(2)),
            );
        });

        it('navigates to filtered scenarios for a specific run', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.selectRun(0),

                Ensure.that(Page.current().url().href, includes('#/tests?run=')),
            );
        });

        it('shows run details panel when clicking the trend chart', { tag: '@showcase' }, async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.clickChart(),

                Ensure.that(testRunsView.hasDetailsPanel(), equals(true)),
                Ensure.that(testRunsView.detailsPanelText(), includes('PASSED')),
                Ensure.that(testRunsView.detailsPanelText(), includes('FAILED')),
            );
        });

        it('navigates to filtered scenarios via the details panel CTA', { tag: '@showcase' }, async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.clickChart(),

                Ensure.that(testRunsView.hasDetailsPanel(), equals(true)),

                testRunsView.clickDetailsCtaButton(),

                Ensure.that(Page.current().url().href, includes('#/tests?run=')),
            );
        });

        it('preserves run param when applying a filter on the scenarios view', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.selectRun(0),

                // Verify we're on the scenarios view with run param
                Ensure.that(Page.current().url().href, includes('#/tests?run=')),

                // Apply a filter — run param must survive
                scenariosView.selectFilter('Failed'),

                Ensure.that(Page.current().url().href, includes('run=')),
            );
        });
    });
});
