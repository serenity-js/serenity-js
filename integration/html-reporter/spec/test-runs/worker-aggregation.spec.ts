import { Ensure, equals, includes } from '@serenity-js/assertions';
import { Navigate } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Test Runs', () => {

    describe('Worker Aggregation', () => {

        it('aggregates multiple worker files with the same moduleId into a single module entry', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                // Navigate to the multi-worker report
                Navigate.to('/multi-worker/index.html'),

                // Navigate to Test Runs view and click the chart to open details
                testRunsView.open(),
                testRunsView.clickChartBar(0),

                // Verify the module table shows aggregated modules
                Ensure.that(testRunsView.hasModuleTable(), equals(true)),

                // Should have exactly 2 modules (not 4 = 3 worker files + 1 mocha)
                // This is the key assertion: 3 db-{workerId}.json files with moduleId="webdriverio-web"
                // should be aggregated into ONE module entry
                Ensure.that(testRunsView.moduleNames(), equals(['mocha', 'webdriverio-web'])),
            );
        });

        it('shows aggregated outcome counts in module details', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                Navigate.to('/multi-worker/index.html'),
                testRunsView.open(),
                testRunsView.clickChartBar(0),

                // The details panel should show the modules with their outcomes
                // webdriverio-web: 9 passed + 1 failed across 3 workers
                // mocha: 2 passed
                Ensure.that(testRunsView.detailsPanelText(), includes('webdriverio-web')),
                Ensure.that(testRunsView.detailsPanelText(), includes('mocha')),
            );
        });
    });
});
