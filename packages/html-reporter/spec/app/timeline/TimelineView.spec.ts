import { contain, Ensure, equals, includes } from '@serenity-js/assertions';

import { TimelineView } from '../../../src/serenity/timeline/TimelineView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

describe('TimelineView', () => {

    const timelineData = minimalData({
        scenarios: [
            {
                name: 'Fast test', category: 'Suite', outcome: 'SUCCESS', duration: 100,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/a.spec.ts' },
                tags: [],
                activities: [],
                executionHistory: [],
            },
            {
                name: 'Slow test', category: 'Suite', outcome: 'SUCCESS', duration: 500,
                startedAt: '2024-06-15T14:30:00.100Z',
                source: { path: 'spec/b.spec.ts' },
                tags: [],
                activities: [],
                executionHistory: [],
            },
            {
                name: 'Failed test', category: 'Suite', outcome: 'FAILURE', duration: 200,
                startedAt: '2024-06-15T14:30:00.200Z',
                source: { path: 'spec/c.spec.ts' },
                tags: [],
                activities: [],
                error: { name: 'AssertionError', message: 'Expected true to be false', stack: '' },
                executionHistory: [],
            },
        ],
        summary: {
            title: 'Test Project',
            totalScenarios: 3,
            outcomes: { passed: 2, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
            startedAt: '2024-06-15T14:30:00.000Z',
            finishedAt: '2024-06-15T14:30:01.000Z',
            duration: 800,
            testRunner: 'Playwright',
        },
    });

    it('displays KPI cards with timing information', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TimelineView',
            importPath: './components/timeline/TimelineView',
            props: { onNavigate: () => {} },
            data: timelineData,
            interactionObject: TimelineView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardAt(0).label(), equals('SLOWEST')),
            Ensure.that(view.kpiCardAt(1).label(), equals('FASTEST')),
            Ensure.that(view.kpiCardAt(2).label(), equals('AVERAGE')),
            Ensure.that(view.kpiCardAt(3).label(), equals('TOTAL')),
        );
    });

    it('shows All filter as active by default', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TimelineView',
            importPath: './components/timeline/TimelineView',
            props: { onNavigate: () => {} },
            data: timelineData,
            interactionObject: TimelineView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.activeFilters(), contain('All')),
        );
    });

    it('displays filter chips for outcome categories', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TimelineView',
            importPath: './components/timeline/TimelineView',
            props: { onNavigate: () => {} },
            data: timelineData,
            interactionObject: TimelineView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.filterLabels(), equals(['All', 'Passed', 'Failed', 'Skipped'])),
        );
    });

    it('shows the Total KPI card with scenario count', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TimelineView',
            importPath: './components/timeline/TimelineView',
            props: { onNavigate: () => {} },
            data: timelineData,
            interactionObject: TimelineView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardAt(3).subtitle(), includes('3 scenarios')),
        );
    });

    it('reports the number of scenarios in the timeline', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TimelineView',
            importPath: './components/timeline/TimelineView',
            props: { onNavigate: () => {} },
            data: timelineData,
            interactionObject: TimelineView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(3)),
        );
    });
});
