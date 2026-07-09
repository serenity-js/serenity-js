import { contain, Ensure, equals, includes } from '@serenity-js/assertions';

import { ScenariosView } from '../../src/serenity/ScenariosView.serenity.js';
import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

describe('ScenariosView interaction object', () => {

    const data = minimalData();

    it('displays filter chips with outcome labels', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
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
            importPath: './components/ScenariosView',
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
            importPath: './components/ScenariosView',
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
            importPath: './components/ScenariosView',
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
            importPath: './components/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.activeFilters(), contain('All')),
        );
    });
});

describe('ScenariosView deep linking', () => {

    const data = minimalData();

    it('filters by search param in route', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
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
            importPath: './components/ScenariosView',
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
            importPath: './components/ScenariosView',
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
            importPath: './components/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
            interactionObject: ScenariosView,
        });

        await actor.attemptsTo(
            Ensure.that(view.resultCount.text(), includes('Showing 4 of 4')),
            Ensure.that(view.scenarioCount(), equals(4)),
        );
    });

    it('filters by run param showing only matching run', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?run=2024-06-14T10:00:00.000Z' },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: 'build 41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200 },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: 'build 42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250 },
                ],
            }),
        });

        // RunSelector should be visible when run param is present
        await expect(page.locator('body')).toContainText('Test run');
    });
});

describe('ScenariosView scenario navigation', () => {

    it('scenarios in the same file without line numbers are both listed distinctly', async ({ mount, actor, page }) => {
        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
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
        );

        // Both scenarios from the same file should be rendered as distinct items
        const items = page.locator('.scenario-item');
        await expect(items.first()).toContainText('first scenario');
        await expect(items.last()).toContainText('second scenario');
        // Both show the same source file
        await expect(items.first()).toContainText('shared.spec.ts');
        await expect(items.last()).toContainText('shared.spec.ts');
    });

    it('displays line number in source path when available', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
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
        });

        await expect(page.locator('.scenario-item')).toContainText('a.spec.ts:42');
    });
});

describe('ScenariosView accessibility', () => {

    it('filter result count has aria-live polite region', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
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
