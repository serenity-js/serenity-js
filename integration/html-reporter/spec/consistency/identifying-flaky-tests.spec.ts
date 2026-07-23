import { contain, Ensure, equals, includes, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { degradedTest, failingTest, flakyTest } from '../../src/scenarios';

describe('Consistency', () => {

    describe('Identifying Flaky Tests', () => {

        it('lists tests with inconsistent outcomes across runs', { tag: '@showcase' }, async ({ actor, consistencyView }) => {
            await actor.attemptsTo(
                consistencyView.open(),

                Ensure.that(consistencyView.scenarioNames(), contain(degradedTest)),
                Ensure.that(consistencyView.scenarioNames(), contain(failingTest)),
            );
        });

        it('allows drilling into a flaky scenario to see the failure details', { tag: '@showcase' }, async ({ actor, consistencyView, scenarioDetailView }) => {
            await actor.attemptsTo(
                consistencyView.open(),
                consistencyView.scenarioCalled(degradedTest).viewDetails(),

                Ensure.that(scenarioDetailView.hasError(), equals(true)),
                Ensure.that(scenarioDetailView.photoStripCount(), isGreaterThan(0)),
            );
        });

        it('shows that a flaky test passed on retry', { tag: '@showcase' }, async ({ actor, consistencyView, scenarioDetailView }) => {
            await actor.attemptsTo(
                consistencyView.open(),

                Ensure.that(consistencyView.scenarioNames(), contain(flakyTest)),

                consistencyView.scenarioCalled(flakyTest).viewDetails(),

                Ensure.that(scenarioDetailView.retryTabCount(), equals(2)),
                Ensure.that(scenarioDetailView.firstRetryTabLabel(), includes('failed')),
                Ensure.that(scenarioDetailView.lastRetryTabLabel(), includes('passed')),
            );
        });
    });
});
