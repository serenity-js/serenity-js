import { Ensure, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';

describe('Dashboard', () => {

    describe('Confidence and KPIs', () => {

        it('shows the overall confidence score', { tag: '@showcase' }, async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Confidence').value(), includes('86')),
                Ensure.that(dashboardView.kpiCardCalled('Confidence').subtitle(), includes('since last run')),
            );
        });

        it('shows the pass rate with the number of passing scenarios', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Pass Rate').value(), includes('77')),
                Ensure.that(dashboardView.kpiCardCalled('Pass Rate').subtitle(), includes('passing')),
            );
        });

        it('shows the failed scenario count', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Failed').value(), includes('5')),
            );
        });

        it('shows the consistency percentage', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Consistency').value(), includes('82')),
            );
        });
    });
});
