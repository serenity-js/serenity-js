import { Ensure, equals, includes, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { failingTest } from '../../src/scenarios';

describe('Test Scenarios', () => {

    describe('Finding Scenarios', () => {

        it('shows the total number of scenarios', async ({ actor, scenariosView, expected }) => {
            await actor.attemptsTo(
                scenariosView.open(),

                Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
                Ensure.that(scenariosView.scenarioCount(), equals(expected.scenarios.maxVisibleRows)),
                Ensure.that(scenariosView.resultCountText(), includes('21')),
            );
        });

        it('filters scenarios by outcome', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),

                Ensure.that(scenariosView.scenarioCount(), equals(5)),
            );
        });

        it('locates a failing test by filtering and searching', { tag: '@showcase' }, async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),

                Ensure.that(scenariosView.scenarioCalled(failingTest).isPresent(), equals(true)),
                Ensure.that(scenariosView.scenarioCalled(failingTest).outcome(), equals('FAILURE')),
                Ensure.that(scenariosView.scenarioCalled(failingTest).sourceLocation(), includes('checkout.spec.ts')),
            );
        });

        it('shows the error preview inline in the scenario list', { tag: '@showcase' }, async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.selectFilter('Failed'),
                scenariosView.find('expired card'),

                Ensure.that(scenariosView.scenarioCalled(failingTest).errorPreview(), includes('Payment rejected')),
            );
        });

        it('shows a retried scenario as ultimately passing', { tag: '@showcase' }, async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('edit'),

                Ensure.that(scenariosView.scenarioCalled('should edit an item').outcome(), equals('SUCCESS')),
            );
        });

        it('narrows results by clicking a tag chip on a scenario', { tag: '@showcase' }, async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('item'),

                // 'item' appears in 9 scenarios across Checkout and Todo List features
                Ensure.that(scenariosView.scenarioCount(), equals(9)),

                // Click the 'retried' tag on "should edit an item" to filter to only retried scenarios
                scenariosView.scenarioCalled('should edit an item').clickTag('retried'),

                // Now only the 1 retried scenario containing 'item' is shown
                Ensure.that(scenariosView.scenarioCount(), equals(1)),
                Ensure.that(scenariosView.scenarioCalled('should edit an item').isPresent(), equals(true)),
            );
        });
    });
});
