import { Ensure, equals, includes, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../../src';

const dynamicTestA = 'should have no accessibility violations at /index.html';
const dynamicTestB = 'should have no accessibility violations at /index.html?page=about';
const dynamicTestC = 'should have no accessibility violations at /index.html?page=contact';

describe('Test Scenarios', () => {

    describe('Dynamically Generated Tests', () => {

        it('navigates to the correct detail view for each for-loop-generated scenario', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('accessibility violations'),

                Ensure.that(scenariosView.scenarioCount(), equals(3)),
            );

            // Click into the first dynamic scenario and verify the correct detail is shown
            await actor.attemptsTo(
                scenariosView.scenarioCalled(dynamicTestA).viewDetails(),
                Ensure.that(scenarioDetailView.scenarioName(), includes(dynamicTestA)),
            );
        });

        it('navigates to a different for-loop-generated scenario than the first', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('accessibility violations'),

                scenariosView.scenarioCalled(dynamicTestB).viewDetails(),
                Ensure.that(scenarioDetailView.scenarioName(), includes(dynamicTestB)),
            );
        });

        it('navigates to the third for-loop-generated scenario', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('accessibility violations'),

                scenariosView.scenarioCalled(dynamicTestC).viewDetails(),
                Ensure.that(scenarioDetailView.scenarioName(), includes(dynamicTestC)),
            );
        });

        it('tracks execution history separately for each for-loop-generated scenario', async ({ actor, scenariosView, scenarioDetailView }) => {
            // Dynamic tests sharing the same source line should each have their own
            // execution history across runs, not share a single merged history
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('accessibility violations'),

                // Navigate to the first dynamic test and verify it has history
                scenariosView.scenarioCalled(dynamicTestA).viewDetails(),
                Ensure.that(scenarioDetailView.scenarioName(), includes(dynamicTestA)),
                Ensure.that(scenarioDetailView.executionHistoryDotCount(), isGreaterThan(1)),
            );
        });
    });
});
