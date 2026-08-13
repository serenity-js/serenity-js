import { Ensure, equals } from '@serenity-js/assertions';

import { describe, it } from '../../src';

describe('Dashboard', () => {

    describe('Quality Trends', () => {

        it('renders a trend chart showing quality across runs', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.hasTrendChart(), equals(true)),
            );
        });
    });
});
