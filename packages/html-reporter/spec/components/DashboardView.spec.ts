import { Ensure, equals, includes } from '@serenity-js/assertions';

import { DashboardView } from '../../src/serenity/DashboardView.serenity.js';
import { minimalData } from './data-factories.js';
import { describe, it } from './fixtures.js';

describe('DashboardView', () => {

    const dashboardData = minimalData({
        summary: {
            title: 'Test Project',
            totalScenarios: 4,
            outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
            startedAt: '2024-06-15T14:30:00.000Z',
            finishedAt: '2024-06-15T14:30:01.000Z',
            duration: 1000,
            testRunner: 'Playwright',
        },
    });

    it('displays the Confidence KPI card', async ({ mount, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: dashboardData,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardAt(0).label(), equals('CONFIDENCE')),
        );
    });

    it('displays the Pass Rate KPI card with correct accessible label', async ({ mount, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: dashboardData,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardAt(1).label(), equals('PASS RATE')),
            Ensure.that(view.kpiCardAt(1).accessibleLabel(), includes('percent')),
        );
    });

    it('displays the Consistency KPI card with correct accessible label', async ({ mount, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: dashboardData,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardAt(2).label(), equals('CONSISTENCY')),
            Ensure.that(view.kpiCardAt(2).accessibleLabel(), includes('percent')),
        );
    });

    it('displays the Completeness KPI card with correct accessible label', async ({ mount, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: dashboardData,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardAt(3).label(), equals('COMPLETENESS')),
            Ensure.that(view.kpiCardAt(3).accessibleLabel(), includes('percent')),
        );
    });
});
