import { Ensure, equals, includes, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { failingTest, timeoutTest } from '../../src/scenarios';

describe('Test Scenarios', () => {

    describe('Diagnosing Failures', () => {

        it('shows the failing step and error message', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                Ensure.that(scenarioDetailView.errorBlock().message(), includes('Payment rejected')),
                Ensure.that(scenarioDetailView.activityCalled('submits the payment').outcome(), equals('FAILURE')),
            );
        });

        it('identifies a timeout failure and its cause', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('timeout error'),
                scenariosView.scenarioCalled(timeoutTest).viewDetails(),

                Ensure.that(scenarioDetailView.errorBlock().name(), includes('Error')),
                Ensure.that(scenarioDetailView.errorBlock().message(), includes('Timeout')),
            );
        });

        it('shows the activity tree structure for a passing test', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('log in with valid'),
                scenariosView.scenarioCalled('log in with valid').viewDetails(),

                Ensure.that(scenarioDetailView.activityCalled('navigates').outcome(), equals('SUCCESS')),
                Ensure.that(scenarioDetailView.photoStripCount(), isGreaterThan(0)),
            );
        });
    });
});
