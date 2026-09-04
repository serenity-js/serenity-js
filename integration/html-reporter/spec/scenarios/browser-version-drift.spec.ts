import { Ensure, includes } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';
import { Navigate, Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Test Scenarios', () => {

    describe('Browser Version Drift', () => {

        it('finds a scenario when the URL contains a stale browser version', async ({ actor, scenariosView, scenarioDetailView }) => {
            const scenarioName = 'Login should log in with valid credentials';

            // Navigate to the scenario detail via the normal flow
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find(scenarioName),
                scenariosView.scenarioCalled(scenarioName).viewDetails(),

                // Verify we landed on the correct detail page
                Ensure.that(scenarioDetailView.scenarioName(), includes(scenarioName)),

                // Capture the current URL (has the correct browser version)
                notes().set('originalUrl', Page.current().url().href),
            );

            // Replace the browser version with a stale one to simulate
            // a bookmarked URL or a consistency card link from an older run
            const staleUrl = await actor.answer(
                notes().get('originalUrl').as((url: string) =>
                    url.replace(/browser=chromium%20[\d.]+/, 'browser=chromium%20100.0.0.0')
                ),
            );

            // The stale browser version should still resolve to the correct scenario
            await actor.attemptsTo(
                Navigate.to(staleUrl),
                Ensure.that(scenarioDetailView.scenarioName(), includes(scenarioName)),
            );
        });
    });
});
