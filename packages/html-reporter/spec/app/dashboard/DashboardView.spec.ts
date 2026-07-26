import { contain, Ensure, equals, includes } from '@serenity-js/assertions';

import { DashboardView } from '../../../src/serenity/dashboard/DashboardView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

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
            importPath: './components/dashboard/DashboardView',
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
            importPath: './components/dashboard/DashboardView',
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
            importPath: './components/dashboard/DashboardView',
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
            importPath: './components/dashboard/DashboardView',
            props: { onNavigate: () => {} },
            data: dashboardData,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardAt(3).label(), equals('COMPLETENESS')),
            Ensure.that(view.kpiCardAt(3).accessibleLabel(), includes('percent')),
        );
    });

    it('can find a KPI card by its label', async ({ mount, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/dashboard/DashboardView',
            props: { onNavigate: () => {} },
            data: dashboardData,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardCalled('Pass Rate').value(), includes('75')),
        );
    });

    it('can read the subtitle of a KPI card found by label', async ({ mount, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/dashboard/DashboardView',
            props: { onNavigate: () => {} },
            data: dashboardData,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardCalled('Pass Rate').subtitle(), includes('passing')),
        );
    });

    it('lists scenario names in the consistency card', async ({ mount, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/dashboard/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                newFailures: [
                    { name: 'Failing Test', category: 'Suite', source: { path: 'spec/a.spec.ts', line: 10 } },
                ],
            }),
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.consistencyCardScenarioNames(), contain('Failing Test')),
        );
    });

    it('lists scenario names in the slowest tests card', async ({ mount, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/dashboard/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.slowestTestNames(), contain('Test D')),
        );
    });

    it('reports whether a trend chart is present', async ({ mount, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/dashboard/DashboardView',
            props: { onNavigate: () => {} },
            data: dashboardData,
            chartJs: true,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.hasTrendChart(), equals(true)),
        );
    });

    // Chart canvas click tests use raw Playwright because clicking canvas
    // coordinates requires pixel-level control that interaction objects can't provide.
    it('shows the details panel when a chart bar is clicked', async ({ mount, page, actor }) => {
        const view = await mount({
            component: 'DashboardView',
            importPath: './components/dashboard/DashboardView',
            props: { onNavigate: () => {} },
            data: dashboardData,
            chartJs: true,
            interactionObject: DashboardView,
        });

        // Click on the chart canvas in the center-right area (second bar of 2)
        const canvas = page.locator('canvas');
        const box = await canvas.boundingBox();
        if (box) {
            await canvas.click({ position: { x: box.width * 0.75, y: box.height * 0.5 } });
        }

        await actor.attemptsTo(
            Ensure.that(view.hasDetailsPanel(), equals(true)),
        );
    });

    it('shows the correct history dots for a degraded test when multiple scenarios share the same source location', async ({ mount, actor }) => {
        const sharedSource = { path: 'spec/navigation/deep-linking.spec.ts', line: 32 };

        const multiBrowserData = minimalData({
            scenarios: [
                {
                    name: 'Deep Linking toggles themes', category: 'Navigation', outcome: 'SUCCESS', duration: 500,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: sharedSource,
                    tags: [{ type: 'project', name: 'desktop' }, { type: 'browser', name: 'chromium 126.0' }],
                    activities: [],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#41' },
                        { outcome: 'SUCCESS', run: '#42' },
                    ],
                },
                {
                    name: 'Deep Linking toggles themes', category: 'Navigation', outcome: 'ERROR', duration: 30000,
                    startedAt: '2024-06-15T14:30:01.000Z',
                    source: sharedSource,
                    tags: [{ type: 'project', name: 'mobile' }, { type: 'browser', name: 'chromium 126.0' }],
                    activities: [],
                    error: { name: 'TimeoutError', message: 'Timed out', stack: '' },
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#41' },
                        { outcome: 'ERROR', run: '#42' },
                    ],
                },
            ],
            newFailures: [
                {
                    name: 'Deep Linking toggles themes',
                    category: 'Navigation',
                    source: sharedSource,
                    tags: [{ type: 'project', name: 'mobile' }, { type: 'browser', name: 'chromium 126.0' }],
                },
            ],
        });

        const view = await mount({
            component: 'DashboardView',
            importPath: './components/dashboard/DashboardView',
            props: { onNavigate: () => {} },
            data: multiBrowserData,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.consistencyCardScenarioNames(), contain('Deep Linking toggles themes')),
            // The last history dot must reflect the ERROR outcome of the mobile variant,
            // not the SUCCESS outcome of the desktop variant
            Ensure.that(view.consistencyItemHistoryOutcomes('Deep Linking toggles themes'), equals(['SUCCESS', 'ERROR'])),
        );
    });

    it('shows the correct history dots for a degraded test when multiple scenarios share the same file but have no line numbers', async ({ mount, actor }) => {
        // This test reproduces the bug where scenarios in the same file without line numbers
        // would match the wrong scenario's history because the key-based lookup (path:line)
        // would match the first scenario in the file when line is undefined.
        const sharedPath = 'spec/electron/externally-managed.spec.ts';

        const noLineNumberData = minimalData({
            scenarios: [
                {
                    name: 'Electron reading content allows the actor to read text',
                    category: 'Electron',
                    outcome: 'SUCCESS',
                    duration: 100,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: sharedPath },  // No line number
                    tags: [],
                    activities: [],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#41' },
                        { outcome: 'SUCCESS', run: '#42' },
                        { outcome: 'SUCCESS', run: '#43' },
                    ],
                },
                {
                    name: 'Electron clicking on elements allows the actor to click',
                    category: 'Electron',
                    outcome: 'ERROR',
                    duration: 500,
                    startedAt: '2024-06-15T14:30:01.000Z',
                    source: { path: sharedPath },  // Same path, no line number
                    tags: [],
                    activities: [],
                    error: { name: 'Error', message: 'Click failed', stack: '' },
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#41' },
                        { outcome: 'SUCCESS', run: '#42' },
                        { outcome: 'ERROR', run: '#43' },
                    ],
                },
            ],
            newFailures: [
                {
                    name: 'Electron clicking on elements allows the actor to click',
                    category: 'Electron',
                    source: { path: sharedPath },  // No line number, same as in scenarios
                    tags: [],
                },
            ],
        });

        const view = await mount({
            component: 'DashboardView',
            importPath: './components/dashboard/DashboardView',
            props: { onNavigate: () => {} },
            data: noLineNumberData,
            interactionObject: DashboardView,
        });

        await actor.attemptsTo(
            Ensure.that(view.consistencyCardScenarioNames(), contain('Electron clicking on elements allows the actor to click')),
            // The history dots must reflect the ERROR outcome of the clicking test,
            // NOT the all-SUCCESS history of the reading test (which appears first in the scenarios array)
            Ensure.that(
                view.consistencyItemHistoryOutcomes('Electron clicking on elements allows the actor to click'),
                equals(['SUCCESS', 'SUCCESS', 'ERROR']),
            ),
        );
    });
});
