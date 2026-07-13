import { Ensure, equals, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { degradedTest, failingTest } from '../../src/scenarios';

describe('Test Scenarios', () => {

    describe('Execution History', () => {

        it('shows execution history dots to assess flakiness', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                Ensure.that(scenarioDetailView.executionHistoryDotCount(), isGreaterThan(1)),
            );
        });

        it('allows switching between retry attempts', async ({ actor, consistencyView, scenarioDetailView }) => {
            await actor.attemptsTo(
                consistencyView.open(),
                consistencyView.scenarioCalled(degradedTest).viewDetails(),

                Ensure.that(scenarioDetailView.hasError(), equals(true)),
            );
        });
    });
});
