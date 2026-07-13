import { Ensure, equals, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { failingTest } from '../../src/scenarios';

describe('Test Scenarios', () => {

    describe('Finding Scenarios', () => {

        it('shows the total number of scenarios', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),

                Ensure.that(scenariosView.scenarioCount(), equals(15)),
            );
        });

        it('filters scenarios by outcome', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),

                Ensure.that(scenariosView.scenarioCount(), equals(5)),
            );
        });

        it('locates a failing test by filtering and searching', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),

                Ensure.that(scenariosView.scenarioCalled(failingTest).isPresent(), equals(true)),
                Ensure.that(scenariosView.scenarioCalled(failingTest).outcome(), equals('FAILURE')),
                Ensure.that(scenariosView.scenarioCalled(failingTest).sourceLocation(), includes('checkout.spec.ts')),
            );
        });

        it('shows the error preview inline in the scenario list', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),

                Ensure.that(scenariosView.scenarioCalled(failingTest).errorPreview(), includes('Payment rejected')),
            );
        });

        it('shows a retried scenario as ultimately passing', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('edit'),

                Ensure.that(scenariosView.scenarioCalled('should edit an item').outcome(), equals('SUCCESS')),
            );
        });
    });
});
