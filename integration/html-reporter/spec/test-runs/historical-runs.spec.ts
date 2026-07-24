import { Ensure, equals, includes } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Test Runs', () => {

    describe('Historical Runs', () => {

        it('shows the trend chart and run history', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),

                Ensure.that(testRunsView.hasTrendChart(), equals(true)),
                Ensure.that(testRunsView.runCount(), equals(3)),
            );
        });

        it('shows a warning icon for an incomplete run in the run selector', { tag: '@showcase' }, async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                // Open the Test Runs view and verify the incomplete run is visible
                testRunsView.open(),

                // Click the incomplete run bar (first/leftmost) to open the details panel
                testRunsView.clickChartBar(0),

                // Verify the details panel shows module information
                Ensure.that(testRunsView.hasDetailsPanel(), equals(true)),
                Ensure.that(testRunsView.detailsPanelText(), includes('passing-module')),
                Ensure.that(testRunsView.detailsPanelText(), includes('failing-module')),
                Ensure.that(testRunsView.detailsPanelText(), includes('crashed-module')),
                Ensure.that(testRunsView.detailsPanelText(), includes('incomplete')),

                // Close the panel and navigate to the Scenarios view
                testRunsView.dismissDetailsPanel(),
                scenariosView.open(),

                // Verify the RunSelector shows the warning for the incomplete run
                Ensure.that(scenariosView.runSelectorText(), includes('⚠️')),
                Ensure.that(scenariosView.runSelectorText(), includes('(incomplete)')),
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
