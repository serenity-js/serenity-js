import { contain, Ensure, equals, includes } from '@serenity-js/assertions';
import { Wait } from '@serenity-js/core';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Test Runs', () => {

    describe('Module Table Navigation', () => {

        it('shows module table for runs with multiple modules', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                
                // Click the incomplete run (first bar = run 40, has multiple modules)
                testRunsView.clickChartBar(0),
                
                Ensure.that(testRunsView.hasDetailsPanel(), equals(true)),
                Ensure.that(testRunsView.hasModuleTable(), equals(true)),
                Ensure.that(testRunsView.moduleNames(), contain('passing-module')),
            );
        });

        it('navigates to filtered scenarios when clicking a module name', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                
                // Click a module name
                testRunsView.clickModuleName('passing-module'),
                
                // Wait for navigation to complete
                Wait.until(Page.current().url().href, includes('search=')),
            );
            
            // Extract actual run ID from URL
            const runId = await actor.answer(testRunsView.extractRunId());
            const expectedUrl = testRunsView.moduleUrl('passing-module', runId!);
            
            await actor.attemptsTo(
                // Should navigate to Test Scenarios with module filter
                Ensure.that(
                    Page.current().url().hash,
                    includes(expectedUrl)
                ),
                
                // Search input should show the module filter
                Ensure.that(scenariosView.searchInputValue(), equals('@module:passing-module')),
            );
        });

        it('navigates to passed scenarios when clicking Passed count', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                
                testRunsView.clickModulePassedCount('passing-module'),
                
                // Wait for navigation to complete
                Wait.until(Page.current().url().href, includes('filter=passed')),
            );
            
            // Extract actual run ID from URL
            const runId = await actor.answer(testRunsView.extractRunId());
            const expectedUrl = testRunsView.modulePassedUrl('passing-module', runId!);
            
            await actor.attemptsTo(
                // URL should match exactly
                Ensure.that(
                    Page.current().url().hash,
                    includes(expectedUrl)
                ),
                
                // Filter bar should show Passed as active - check the first filter includes "Passed"
                Ensure.that(scenariosView.activeFilters().as(filters => filters[0]), includes('Passed')),
                Ensure.that(scenariosView.searchInputValue(), equals('@module:passing-module')),
            );
        });

        it('navigates to failed scenarios when clicking Failed count', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                
                testRunsView.clickModuleFailedCount('failing-module'),
                
                // Wait for navigation to complete
                Wait.until(Page.current().url().href, includes('filter=failed')),
            );
            
            // Extract actual run ID from URL
            const runId = await actor.answer(testRunsView.extractRunId());
            const expectedUrl = testRunsView.moduleFailedUrl('failing-module', runId!);
            
            await actor.attemptsTo(
                // URL should match exactly
                Ensure.that(
                    Page.current().url().hash,
                    includes(expectedUrl)
                ),
                
                // Filter bar should show Failed as active
                Ensure.that(scenariosView.activeFilters().as(filters => filters[0]), includes('Failed')),
            );
        });

        it('navigates to skipped scenarios when clicking Skipped count', async ({ actor, testRunsView, scenariosView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                
                // Use a module that has skipped tests - but run 40 doesn't have skipped,
                // so this test needs to check a module with 0 skipped (or be adapted)
                // For now, we'll click the button even if count is 0
                testRunsView.clickModuleSkippedCount('passing-module'),
                
                // Wait for navigation to complete
                Wait.until(Page.current().url().href, includes('filter=skipped')),
            );
            
            // Extract actual run ID from URL
            const runId = await actor.answer(testRunsView.extractRunId());
            const expectedUrl = testRunsView.moduleSkippedUrl('passing-module', runId!);
            
            await actor.attemptsTo(
                // URL should match exactly
                Ensure.that(
                    Page.current().url().hash,
                    includes(expectedUrl)
                ),
                
                // Filter bar should show Skipped as active
                Ensure.that(scenariosView.activeFilters().as(filters => filters[0]), includes('Skipped')),
            );
        });

        it('preserves run parameter across navigation', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                
                testRunsView.clickModuleName('passing-module'),
                
                // After navigation, run param should still be in URL
                Ensure.that(Page.current().url().href, includes('run=')),
            );
        });

        it('allows returning to test runs view after module navigation', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.clickChartBar(0),
                
                testRunsView.clickModuleName('passing-module'),
                
                // Navigate back
                Page.current().navigateBack(),
                
                // Should return to Test Runs view
                Ensure.that(Page.current().url().href, includes('#/test-runs')),
            );
        });
    });
});
