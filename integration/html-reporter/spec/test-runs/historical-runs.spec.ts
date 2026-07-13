import { Ensure, equals, includes } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Test Runs', () => {

    describe('Historical Runs', () => {

        it('shows the trend chart and run history', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),

                Ensure.that(testRunsView.hasTrendChart(), equals(true)),
                Ensure.that(testRunsView.runCount(), equals(2)),
            );
        });

        it('navigates to filtered scenarios for a specific run', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),
                testRunsView.selectRun(0),

                Ensure.that(Page.current().url().href, includes('#/tests?run=')),
            );
        });
    });
});
