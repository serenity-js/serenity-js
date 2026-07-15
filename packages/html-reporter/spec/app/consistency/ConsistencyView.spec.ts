import { contain, Ensure, equals, includes } from '@serenity-js/assertions';

import { ConsistencyView } from '../../../src/serenity/consistency/ConsistencyView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('ConsistencyView scenario access', () => {

    const consistencyData = minimalData({
        inconsistentTests: [
            {
                name: 'Flaky Test A',
                category: 'Suite A',
                source: { path: 'spec/flaky.spec.ts', line: 10 },
                tags: [{ type: 'feature', name: 'Checkout' }],
                inconsistencyRate: 0.5,
                history: ['SUCCESS', 'RETRIED_SUCCESS', 'RETRIED_SUCCESS'],
                labels: ['#1', '#2', '#3'],
            },
            {
                name: 'Degraded Test B',
                category: 'Suite B',
                source: { path: 'spec/broken.spec.ts', line: 5 },
                tags: [{ type: 'feature', name: 'Login' }],
                inconsistencyRate: 0.8,
                history: ['SUCCESS', 'FAILURE'],
                labels: ['#1', '#2'],
            },
        ],
    });

    it('can find a scenario by name and check it is present', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {}, route: '/consistency' },
            data: consistencyData,
            interactionObject: ConsistencyView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCalled('Flaky Test A').isPresent(), equals(true)),
        );
    });

    it('lists visible scenario names', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {}, route: '/consistency' },
            data: consistencyData,
            interactionObject: ConsistencyView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioNames(), contain('Flaky Test A')),
        );
    });
});

describe('ConsistencyView', () => {

    const inconsistentTestData = minimalData({
        inconsistentTests: [
            {
                name: 'Flaky test (never genuinely fails)',
                category: 'Suite A',
                source: { path: 'spec/flaky.spec.ts', line: 10 },
                tags: [{ type: 'feature', name: 'Checkout' }],
                inconsistencyRate: 0.5,
                history: ['SUCCESS', 'RETRIED_SUCCESS', 'RETRIED_SUCCESS'],
                labels: ['#1', '#2', '#3'],
            },
            {
                name: 'Inconsistent test (failed before, passes via retry)',
                category: 'Suite A',
                source: { path: 'spec/unstable.spec.ts', line: 20 },
                tags: [{ type: 'feature', name: 'Login' }],
                inconsistencyRate: 0.6,
                history: ['FAILURE', 'RETRIED_SUCCESS'],
                labels: ['#1', '#2'],
            },
            {
                name: 'Degraded test (was passing, now failing)',
                category: 'Suite B',
                source: { path: 'spec/broken.spec.ts', line: 5 },
                tags: [{ type: 'feature', name: 'Login' }],
                inconsistencyRate: 0.8,
                history: ['SUCCESS', 'FAILURE'],
                labels: ['#1', '#2'],
            },
            {
                name: 'Recovered test (was failing, now passes cleanly)',
                category: 'Suite B',
                source: { path: 'spec/fixed.spec.ts', line: 15 },
                tags: [{ type: 'feature', name: 'Checkout' }],
                inconsistencyRate: 0.3,
                history: ['FAILURE', 'SUCCESS'],
                labels: ['#1', '#2'],
            },
        ],
    });

    it('shows "All" filter as active by default', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
            interactionObject: ConsistencyView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.activeFilters(), contain('All')),
            Ensure.that(view.resultCount.text(), includes('4 test scenarios')),
        );
    });

    it('displays filter chips with correct labels', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
            interactionObject: ConsistencyView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.filterLabels(), equals(['All', 'Flaky', 'Inconsistent', 'Degraded', 'Recovered'])),
        );
    });

    it('flaky filter shows only tests that never genuinely failed', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
            interactionObject: ConsistencyView,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Flaky'),
            Ensure.that(view.resultCount.text(), includes('1 test')),
        );
    });

    it('inconsistent filter excludes flaky-only tests', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
            interactionObject: ConsistencyView,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Inconsistent'),
            Ensure.that(view.resultCount.text(), includes('1 test')),
        );
    });

    it('classifies [SUCCESS, FAILURE] as degraded', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
            interactionObject: ConsistencyView,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Degraded'),
            Ensure.that(view.resultCount.text(), includes('1 test')),
        );
    });

    it('classifies [FAILURE, SUCCESS] as recovered (clean pass)', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
            interactionObject: ConsistencyView,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Recovered'),
            Ensure.that(view.resultCount.text(), includes('1 test')),
        );
    });

    it('classifies [FAILURE, RETRIED_SUCCESS] as inconsistent, not flaky', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {} },
            data: minimalData({
                inconsistentTests: [
                    {
                        name: 'Was failing now retried',
                        category: 'Suite',
                        source: { path: 'spec/test.spec.ts', line: 1 },
                        tags: [],
                        inconsistencyRate: 0.5,
                        history: ['FAILURE', 'RETRIED_SUCCESS'],
                        labels: ['#1', '#2'],
                    },
                ],
            }),
            interactionObject: ConsistencyView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.filterLabels(), contain('Flaky')),
            Ensure.that(view.filterBar.filterLabels(), contain('Inconsistent')),
        );
    });

    it('shows placeholder when no inconsistent tests', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/consistency/ConsistencyView',
            props: { onNavigate: () => {} },
            data: minimalData({ inconsistentTests: [] }),
        });

        await expect(page.locator('body')).toContainText('All Tests Consistent');
    });
});
