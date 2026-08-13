import { Ensure, equals, includes, isGreaterThan, not } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { failingTest, timeoutTest } from '../../src/scenarios';

describe('Test Scenarios', () => {

    describe('Diagnosing Failures', () => {

        it('shows the failing step and error message', { tag: '@showcase' }, async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                Ensure.that(scenarioDetailView.errorBlock().message(), includes('Payment rejected')),
                Ensure.that(scenarioDetailView.activityCalled('submits the payment').outcome(), equals('FAILURE')),
            );
        });

        it('renders relative paths in error messages', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                Ensure.that(scenarioDetailView.sourcePath(), includes('checkout.spec.ts')),
                Ensure.that(scenarioDetailView.sourcePath(), not(includes('/home/runner'))),
                Ensure.that(scenarioDetailView.sourcePath(), not(includes('/Users/'))),
                Ensure.that(scenarioDetailView.errorBlock().message(), includes('checkout.spec.ts')),
                Ensure.that(scenarioDetailView.errorBlock().message(), not(includes('/home/runner'))),
                Ensure.that(scenarioDetailView.errorBlock().message(), not(includes('/Users/'))),
            );
        });

        it('identifies a timeout failure and its cause', { tag: '@showcase' }, async ({ actor, scenariosView, scenarioDetailView }) => {
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
