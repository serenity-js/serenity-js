import { contain, Ensure, includes, isGreaterThan } from '@serenity-js/assertions';

import { describe, it } from '../../src';

describe('Timeline', () => {

    describe('Execution Timing', () => {

        it('shows scenario execution on the timeline', async ({ actor, timelineView }) => {
            await actor.attemptsTo(
                timelineView.open(),

                Ensure.that(timelineView.activeFilters(), contain('All')),
                Ensure.that(timelineView.scenarioCount(), isGreaterThan(0)),
            );
        });

        it('displays duration statistics as KPI cards', async ({ actor, timelineView }) => {
            await actor.attemptsTo(
                timelineView.open(),

                Ensure.that(timelineView.kpiCardAt(0).accessibleLabel(), includes('Slowest')),
                Ensure.that(timelineView.kpiCardAt(1).accessibleLabel(), includes('Fastest')),
                Ensure.that(timelineView.kpiCardAt(2).accessibleLabel(), includes('Average')),
                Ensure.that(timelineView.kpiCardAt(3).accessibleLabel(), includes('Total')),
            );
        });
    });
});
