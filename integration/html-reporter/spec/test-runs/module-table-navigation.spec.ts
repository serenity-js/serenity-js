import { contain, Ensure, equals, includes, isPresent } from '@serenity-js/assertions';
import { notes, Wait } from '@serenity-js/core';
import { Navigate, Page } from '@serenity-js/web';

import { describe, it } from '../../src';

/**
 * These tests use the multi-module report, where the scenarios in the module table
 * are also the scenarios listed in the Test Scenarios view, so that navigating from the module table
 * shows the scenarios of the selected module.
 */
describe('Test Runs', () => {

    describe('Module Table Navigation', () => {

        it('shows module table for runs with multiple modules', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                Navigate.to('/multi-module/index.html'),
                testRunsView.open(),
                testRunsView.clickChartBar(0),

                Ensure.that(testRunsView.detailsPanel, isPresent()),
                Ensure.that(testRunsView.moduleTable, isPresent()),
                Ensure.that(testRunsView.moduleNames(), contain('playwright-web')),
            );
        });

        it('navigates to filtered scenarios when clicking a module name', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                Navigate.to('/multi-module/index.html'),
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                notes().set('selectedRun', testRunsView.selectedRunId()),

                testRunsView.clickModuleName('playwright-web'),
                Wait.until(scenariosView, isPresent()),

                Ensure.that(
                    Page.current().url().hash,
                    includes(testRunsView.moduleUrl('playwright-web', notes().get('selectedRun')))
                ),
                Ensure.that(scenariosView.searchInputValue(), equals('@module:playwright-web')),
                Ensure.that(scenariosView.scenarioCount(), equals(8)),
            );
        });

        it('navigates to passed scenarios when clicking Passed count', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                Navigate.to('/multi-module/index.html'),
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                notes().set('selectedRun', testRunsView.selectedRunId()),

                testRunsView.clickModulePassedCount('playwright-web'),
                Wait.until(scenariosView, isPresent()),

                Ensure.that(
                    Page.current().url().hash,
                    includes(testRunsView.moduleUrl('playwright-web', notes().get('selectedRun'), 'passed'))
                ),
                Ensure.that(scenariosView.activeFilters(), equals([ 'Passed' ])),
                Ensure.that(scenariosView.searchInputValue(), equals('@module:playwright-web')),
                Ensure.that(scenariosView.scenarioCount(), equals(6)),
            );
        });

        it('navigates to failed scenarios when clicking Failed count', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                Navigate.to('/multi-module/index.html'),
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                notes().set('selectedRun', testRunsView.selectedRunId()),

                testRunsView.clickModuleFailedCount('playwright-web'),
                Wait.until(scenariosView, isPresent()),

                Ensure.that(
                    Page.current().url().hash,
                    includes(testRunsView.moduleUrl('playwright-web', notes().get('selectedRun'), 'failed'))
                ),
                Ensure.that(scenariosView.activeFilters(), equals([ 'Failed' ])),
                Ensure.that(scenariosView.scenarioNames(), contain('Payment should process credit card')),
                Ensure.that(scenariosView.scenarioNames(), contain('Search should return relevant results')),
                Ensure.that(scenariosView.scenarioCount(), equals(2)),
            );
        });

        it('navigates to skipped scenarios when clicking Skipped count', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                Navigate.to('/multi-module/index.html'),
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                notes().set('selectedRun', testRunsView.selectedRunId()),

                // The mocha-contract module has one skipped scenario
                testRunsView.clickModuleSkippedCount('mocha-contract'),
                Wait.until(scenariosView, isPresent()),

                Ensure.that(
                    Page.current().url().hash,
                    includes(testRunsView.moduleUrl('mocha-contract', notes().get('selectedRun'), 'skipped'))
                ),
                Ensure.that(scenariosView.activeFilters(), equals([ 'Skipped' ])),
                Ensure.that(scenariosView.scenarioNames(), equals([ 'Refund response should match schema' ])),
            );
        });

        it('allows returning to test runs view after module navigation', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                Navigate.to('/multi-module/index.html'),
                testRunsView.open(),
                testRunsView.clickChartBar(0),

                testRunsView.clickModuleName('playwright-web'),
                Wait.until(scenariosView, isPresent()),

                Page.current().navigateBack(),
                Wait.until(testRunsView, isPresent()),

                Ensure.that(Page.current().url().hash, equals('#/test-runs')),
            );
        });
    });
});
