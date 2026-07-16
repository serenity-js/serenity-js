import { contain, Ensure } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { degradedTest, failingTest } from '../../src/scenarios';

describe('Dashboard', () => {

    describe('Consistency Summary', () => {

        it('shows newly degraded tests that were previously passing', { tag: '@showcase' }, async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.consistencyCardScenarioNames(), contain(failingTest)),
                Ensure.that(dashboardView.consistencyCardScenarioNames(), contain(degradedTest)),
            );
        });

        it('shows recovered tests that are now passing', { tag: '@showcase' }, async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.consistencyCardScenarioNames(), contain('Persistence should persist items')),
            );
        });

        it('shows the slowest tests by execution duration', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.slowestTestNames(), contain('Login should log in with valid credentials')),
            );
        });
    });
});
