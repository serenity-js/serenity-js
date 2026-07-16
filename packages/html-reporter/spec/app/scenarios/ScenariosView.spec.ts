import { contain, Ensure, equals, includes } from '@serenity-js/assertions';

import { ScenariosView } from '../../../src/serenity/scenarios/ScenariosView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('ScenariosView scenario access', () => {

    const data = minimalData();

    it('can find a scenario by name and read its outcome', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCalled('Test D').outcome(), equals('FAILURE')),
        );
    });

    it('can find a scenario by name and read its source location', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCalled('Test D').sourceLocation(), includes('b.spec.ts')),
        );
    });

    it('lists all visible scenario names', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioNames(), contain('Test D')),
        );
    });

    it('can check if a scenario is present after filtering', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Failed'),
            Ensure.that(view.scenarioCalled('Test D').isPresent(), equals(true)),
        );
    });
});

describe('ScenariosView interaction object', () => {

    const data = minimalData();

    it('displays filter chips with outcome labels', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.filterLabels(), equals(['All', 'Passed', 'Failed', 'Skipped'])),
        );
    });

    it('shows all scenarios initially', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.resultCount.text(), includes('4')),
            Ensure.that(view.scenarioCount(), equals(4)),
        );
    });

    it('narrows results when searching', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            view.find('Test D'),
            Ensure.that(view.resultCount.text(), includes('1')),
            Ensure.that(view.scenarioCount(), equals(1)),
        );
    });

    it('filters by selecting a filter chip', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            view.filterBar.selectFilter('Failed'),
            Ensure.that(view.resultCount.text(), includes('1')),
            Ensure.that(view.scenarioCount(), equals(1)),
        );
    });

    it('shows "All" filter as active by default', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.activeFilters(), contain('All')),
        );
    });
});

describe('ScenariosView category sort', () => {

    it('orders scenarios alphabetically by name within each category', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data: minimalData({
                scenarios: [
                    { name: 'Zebra test', category: 'Auth', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'spec/auth.spec.ts', line: 1 }, tags: [], activities: [], executionHistory: [] },
                    { name: 'Alpha test', category: 'Auth', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'spec/auth.spec.ts', line: 5 }, tags: [], activities: [], executionHistory: [] },
                    { name: 'Middle test', category: 'Auth', outcome: 'FAILURE', duration: 100, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'spec/auth.spec.ts', line: 10 }, tags: [], activities: [], executionHistory: [], error: { name: 'Error', message: 'failed' } },
                    { name: 'Beta checkout', category: 'Checkout', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-15T14:30:00.300Z', source: { path: 'spec/checkout.spec.ts', line: 1 }, tags: [], activities: [], executionHistory: [] },
                    { name: 'Alpha checkout', category: 'Checkout', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-15T14:30:00.400Z', source: { path: 'spec/checkout.spec.ts', line: 5 }, tags: [], activities: [], executionHistory: [] },
                ],
            }),
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            // Default sort is 'category' — groups should be alphabetical, names within each group too
            Ensure.that(view.scenarioNames(), equals([
                'Alpha test',
                'Middle test',
                'Zebra test',
                'Alpha checkout',
                'Beta checkout',
            ])),
        );
    });

    it('groups same-named scenarios from different projects together within a category', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data: minimalData({
                scenarios: [
                    { name: 'should complete checkout', category: 'Checkout', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'spec/checkout.spec.ts', line: 10 }, tags: [{ type: 'project', name: 'desktop' }], activities: [], executionHistory: [] },
                    { name: 'should add to cart', category: 'Checkout', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-15T14:30:00.100Z', source: { path: 'spec/checkout.spec.ts', line: 20 }, tags: [{ type: 'project', name: 'desktop' }], activities: [], executionHistory: [] },
                    { name: 'should complete checkout', category: 'Checkout', outcome: 'FAILURE', duration: 200, startedAt: '2024-06-15T14:30:00.200Z', source: { path: 'spec/checkout.spec.ts', line: 10 }, tags: [{ type: 'project', name: 'mobile' }], activities: [], executionHistory: [], error: { name: 'Error', message: 'mobile broken' } },
                    { name: 'should add to cart', category: 'Checkout', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-15T14:30:00.300Z', source: { path: 'spec/checkout.spec.ts', line: 20 }, tags: [{ type: 'project', name: 'mobile' }], activities: [], executionHistory: [] },
                ],
            }),
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            // Same-named scenarios appear adjacent (sorted by name), regardless of project
            Ensure.that(view.scenarioNames(), equals([
                'should add to cart',
                'should add to cart',
                'should complete checkout',
                'should complete checkout',
            ])),
        );
    });
});

describe('ScenariosView deep linking', () => {

    const data = minimalData();

    it('filters by search param in route', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=%22Test+D%22' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.resultCount.text(), includes('Showing 1 of 4')),
            Ensure.that(view.scenarioCount(), equals(1)),
        );
    });

    it('filters by outcome filter param in route', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?filter=failed' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.resultCount.text(), includes('Showing 1 of 4')),
            Ensure.that(view.scenarioCount(), equals(1)),
        );
    });

    it('applies both search and filter params', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=Suite&filter=passed' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            // Only passed tests in category "Suite" (Test A and Test B)
            Ensure.that(view.resultCount.text(), includes('Showing 2 of 4')),
            Ensure.that(view.scenarioCount(), equals(2)),
        );
    });

    it('shows all scenarios with no params', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.resultCount.text(), includes('Showing 4 of 4')),
            Ensure.that(view.scenarioCount(), equals(4)),
        );
    });

    it('filters by run param showing only matching run', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?run=2024-06-14T10:00:00.000Z' },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: 'build 41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200 },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: 'build 42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250 },
                ],
            }),
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.runSelectorIsPresent(), equals(true)),
        );
    });
});

describe('ScenariosView scenario navigation', () => {

    it('scenarios in the same file without line numbers are both listed distinctly', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => undefined, route: '/tests' },
            data: minimalData({
                scenarios: [
                    {
                        name: 'first scenario', category: 'Suite', outcome: 'SUCCESS', duration: 100,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/shared.spec.ts' },
                        tags: [], activities: [], executionHistory: [],
                    },
                    {
                        name: 'second scenario', category: 'Suite', outcome: 'FAILURE', duration: 200,
                        startedAt: '2024-06-15T14:30:00.100Z',
                        source: { path: 'spec/shared.spec.ts' },
                        tags: [], activities: [], executionHistory: [],
                        error: { name: 'AssertionError', message: 'Expected true to be false', stack: '' },
                    },
                ],
            }),
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), equals(2)),
            Ensure.that(view.scenarioNames(), contain('first scenario')),
            Ensure.that(view.scenarioNames(), contain('second scenario')),
            Ensure.that(view.scenarioCalled('first scenario').sourceLocation(), includes('shared.spec.ts')),
            Ensure.that(view.scenarioCalled('second scenario').sourceLocation(), includes('shared.spec.ts')),
        );
    });

    it('displays line number in source path when available', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => undefined, route: '/tests' },
            data: minimalData({
                scenarios: [
                    {
                        name: 'test with line', category: 'Suite', outcome: 'SUCCESS', duration: 100,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/a.spec.ts', line: 42 },
                        tags: [], activities: [], executionHistory: [],
                    },
                ],
            }),
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCalled('test with line').sourceLocation(), includes('a.spec.ts:42')),
        );
    });
});

/* Implementation contract: verifies ARIA attributes for screen reader support. Kept as raw Playwright. */
describe('ScenariosView accessibility', () => {

    it('filter result count has aria-live polite region', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data: minimalData(),
        });

        // The result count area should announce changes to screen readers
        const liveRegion = page.locator('[aria-live="polite"]');
        await expect(liveRegion).toBeVisible();
        await expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
        // It should contain the result count text
        await expect(liveRegion).toContainText('Showing');
    });
});
