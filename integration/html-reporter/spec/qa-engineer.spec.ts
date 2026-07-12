import { contain, Ensure, equals, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../src';
import { degradedTest, failingTest } from '../src/scenarios';

describe('QA Engineer', () => {

    describe('Journey 6: Identify Flaky Tests for Stabilisation', () => {

        it('can find inconsistent tests and assess their flakiness pattern', async ({ actor, consistencyView }) => {
            await actor.attemptsTo(
                consistencyView.open(),

                Ensure.that(consistencyView.scenarioNames(), contain(degradedTest)),
                Ensure.that(consistencyView.scenarioNames(), contain(failingTest)),
            );
        });

        it('can drill into a flaky scenario to understand the failure mode', async ({ actor, consistencyView, scenarioDetailView }) => {
            await actor.attemptsTo(
                consistencyView.open(),
                consistencyView.scenarioCalled(degradedTest).viewDetails(),

                Ensure.that(scenarioDetailView.hasError(), equals(true)),

                // Screenshots are available as visual evidence of the failure
                Ensure.that(scenarioDetailView.photoStripCount(), isGreaterThan(0)),
            );
        });

        it('can cross-reference flaky tests with feature tags', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),

                Ensure.that(tagsView.tagCount(), equals(7)),
            );
        });
    });

    describe('Journey 7: Audit Test Execution Quality', () => {

        it('can review test structure in the activity tree', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('log in with valid'),
                scenariosView.scenarioCalled('log in with valid').viewDetails(),

                Ensure.that(scenarioDetailView.activityCalled('navigates').outcome(), equals('SUCCESS')),

                // Step 5: Verify evidence capture (screenshots)
                Ensure.that(scenarioDetailView.photoStripCount(), isGreaterThan(0)),
            );
        });
    });

    describe('Journey 8: Investigate Slow Tests', () => {

        it('can find the slowest tests from the dashboard', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.slowestTestNames(), contain('Login should log in with valid credentials')),
            );
        });

        it('can review the timeline for parallel execution analysis', async ({ actor, timelineView }) => {
            await actor.attemptsTo(
                timelineView.open(),

                Ensure.that(timelineView.activeFilters(), contain('All')),

                Ensure.that(timelineView.scenarioCount(), isGreaterThan(0)),
            );
        });
    });
});
