import { Ensure, equals, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../../src';
import { failingTest } from '../../src/scenarios';

describe('Test Scenarios', () => {

    describe('Reviewing Evidence', () => {

        it('shows screenshots captured during test execution', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                Ensure.that(scenarioDetailView.photoStripCount(), isGreaterThan(0)),
            );
        });

        it('provides a button to copy the source location', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                Ensure.that(scenarioDetailView.hasCopySourceButton(), equals(true)),
                scenarioDetailView.copySourceLocation(),
            );
        });
    });
});
