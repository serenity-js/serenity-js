import { contain, Ensure, equals, includes } from '@serenity-js/assertions';

import { ConsistencyView } from '../../../src/serenity/consistency/ConsistencyView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

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

    it('can find a scenario by name and check it is present', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
            data: consistencyData,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCalled('Flaky Test A').isPresent(), equals(true)),
        );
    });

    it('lists visible scenario names', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
            data: consistencyData,
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

    it('shows "All" filter as active by default', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
            data: inconsistentTestData,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.activeFilters(), contain('All')),
            Ensure.that(view.scenarioCount(), equals(4)),
        );
    });

    it('displays filter chips with correct labels', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
            data: inconsistentTestData,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.filterLabels(), equals(['All', 'Flaky', 'Inconsistent', 'Degraded', 'Recovered'])),
        );
    });

    it('flaky filter shows only tests that never genuinely failed', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
            data: inconsistentTestData,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Flaky'),
            Ensure.that(view.resultCount.text(), includes('Showing 1')),
        );
    });

    it('inconsistent filter excludes flaky-only tests', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
            data: inconsistentTestData,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Inconsistent'),
            Ensure.that(view.resultCount.text(), includes('Showing 1')),
        );
    });

    it('classifies [SUCCESS, FAILURE] as degraded', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
            data: inconsistentTestData,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Degraded'),
            Ensure.that(view.resultCount.text(), includes('Showing 1')),
        );
    });

    it('classifies [FAILURE, SUCCESS] as recovered (clean pass)', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
            data: inconsistentTestData,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Recovered'),
            Ensure.that(view.resultCount.text(), includes('Showing 1')),
        );
    });

    it('classifies [FAILURE, RETRIED_SUCCESS] as inconsistent, not flaky', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
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
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.filterLabels(), contain('Flaky')),
            Ensure.that(view.filterBar.filterLabels(), contain('Inconsistent')),
        );
    });

    it('shows placeholder when no inconsistent tests', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ConsistencyView, './components/consistency/ConsistencyView', {
            data: minimalData({ inconsistentTests: [] }),
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('All Tests Consistent')),
        );
    });
});
