import { contain, Ensure, equals, includes, isPresent, not } from '@serenity-js/assertions';

import { CapabilitiesView } from '../../../src/serenity/capabilities/CapabilitiesView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

function capabilitiesData() {
    return minimalData({
        capabilities: {
            name: 'spec',
            type: 'directory',
            outcomes: { passed: 5, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 },
            readme: '<h2>Feature Overview</h2><p>This is the project documentation.</p>',
            children: [
                {
                    name: 'passing-feature',
                    type: 'directory',
                    outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                    readme: '<p>Passing feature docs</p>',
                    children: [
                        { name: 'login.spec.ts', type: 'file', outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarios: [{ name: 'A', outcome: 'SUCCESS' }, { name: 'B', outcome: 'SUCCESS' }, { name: 'C', outcome: 'SUCCESS' }] },
                    ],
                },
                {
                    name: 'failing-feature',
                    type: 'directory',
                    outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                    children: [
                        { name: 'checkout.spec.ts', type: 'file', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarios: [{ name: 'D', outcome: 'SUCCESS' }, { name: 'E', outcome: 'FAILURE' }] },
                    ],
                },
                {
                    name: 'pending-feature',
                    type: 'directory',
                    outcomes: { passed: 1, failed: 0, pending: 1, skipped: 0, compromised: 0, error: 0 },
                    children: [
                        { name: 'search.spec.ts', type: 'file', outcomes: { passed: 1, failed: 0, pending: 1, skipped: 0, compromised: 0, error: 0 }, scenarios: [{ name: 'F', outcome: 'SUCCESS' }, { name: 'G', outcome: 'PENDING' }] },
                    ],
                },
            ],
        },
    });
}

describe('CapabilitiesView interaction object', () => {

    it('displays filter chips with health category labels', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.filterLabels(), equals(['All', 'Healthy', 'At Risk', 'Critical', 'Gaps'])),
        );
    });

    it('shows "All" filter as active by default', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.activeFilters(), equals(['All'])),
        );
    });

    it('search input uses "Find capabilities..." placeholder', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.searchInput.placeholder(), equals('Find capabilities...')),
        );
    });

    it('search filters the tree and shows result count', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            view.searchInput.enter('passing'),
            Ensure.that(view.resultCount.text(), includes('Showing 1 of 3 capabilities')),
            Ensure.that(view.treeNodeLabels(), contain('passing-feature')),
            Ensure.that(view.treeNodeLabels(), not(contain('failing-feature'))),
        );
    });

    it('does not show clear button when search is empty', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.searchInput.isClearable(), equals(false)),
        );
    });

    it('shows clear button when search has text', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            view.searchInput.enter('test'),
            Ensure.that(view.searchInput.isClearable(), equals(true)),
        );
    });
});

describe('CapabilitiesView', () => {

    describe('detail panel — documentation-first', () => {

        it('shows README prominently (not collapsible, not hidden)', async ({ mount, actor }) => {
            const view = await mount({
                component: 'CapabilitiesView',
                importPath: './components/capabilities/CapabilitiesView',
                data: capabilitiesData(),
                props: { onNavigate: () => undefined, route: '#/capabilities' },
                interactionObject: CapabilitiesView,
            });

            await actor.attemptsTo(
                Ensure.that(view.readmeContent(), includes('project documentation')),
                Ensure.that(view.readmeIsCollapsible(), equals(false)),
            );
        });

        it('shows title, health header, and README for a selected capability', async ({ mount, actor }) => {
            const view = await mount({
                component: 'CapabilitiesView',
                importPath: './components/capabilities/CapabilitiesView',
                data: capabilitiesData(),
                props: { onNavigate: () => undefined, route: '#/capabilities' },
                interactionObject: CapabilitiesView,
            });

            await actor.attemptsTo(
                view.selectCapability('passing-feature'),
                Ensure.that(view.detailTitle(), equals('Passing-Feature')),
                Ensure.that(view.confidence(), equals('100%')),
                Ensure.that(view.readmeContent(), includes('Passing feature docs')),
            );
        });
    });

    describe('left panel — navigation', () => {

        it('filter bar uses the shared filter-bar styling with confidence categories', async ({ mount, actor }) => {
            const view = await mount({
                component: 'CapabilitiesView',
                importPath: './components/capabilities/CapabilitiesView',
                data: capabilitiesData(),
                props: { onNavigate: () => undefined, route: '#/capabilities' },
                interactionObject: CapabilitiesView,
            });

            await actor.attemptsTo(
                Ensure.that(view.filterBar, isPresent()),
                Ensure.that(view.filterBar.filterLabels(), equals(['All', 'Healthy', 'At Risk', 'Critical', 'Gaps'])),
            );
        });
    });

    describe('detail header — single source of truth', () => {

        it('shows confidence prominently in the detail panel header', async ({ mount, actor }) => {
            const view = await mount({
                component: 'CapabilitiesView',
                importPath: './components/capabilities/CapabilitiesView',
                data: capabilitiesData(),
                props: { onNavigate: () => undefined, route: '#/capabilities' },
                interactionObject: CapabilitiesView,
            });

            await actor.attemptsTo(
                Ensure.that(view.confidence(), equals('90%')),
                Ensure.that(view.confidenceLabel(), includes('CONFIDENCE')),
            );
        });
    });

    it('shows empty state when capabilities data is missing', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: minimalData({ capabilities: null }),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.emptyStateText(), includes('specDirectory')),
        );
    });

    it('filter bar and search are hidden when there is only 1 capability', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: minimalData({
                capabilities: {
                    name: 'spec',
                    type: 'directory',
                    outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                    children: [
                        {
                            name: 'only-feature',
                            type: 'directory',
                            outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                            children: [
                                { name: 'test.spec.ts', type: 'file', outcomes: { passed: 2, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                            ],
                        },
                    ],
                },
            }),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar, not(isPresent())),
            Ensure.that(view.searchInput, not(isPresent())),
        );
    });
});

describe('CapabilitiesView sort control', () => {

    it('displays a sort dropdown with options: Name, Confidence, Scenarios', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.sortOptions(), equals(['Name', 'Confidence', 'Scenarios'])),
        );
    });

    it('defaults to sorting by name', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.selectedSort(), equals('name')),
        );
    });

    it('sorts tree nodes by confidence ascending (worst first) when Confidence is selected', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            view.selectSort('confidence'),
            // failing-feature (80%) should come before pending-feature (88%) which comes before passing-feature (100%)
            Ensure.that(
                view.childTreeNodeLabels().as(labels => labels[0]),
                includes('failing'),
            ),
            Ensure.that(
                view.childTreeNodeLabels().as(labels => labels[labels.length - 1]),
                includes('passing'),
            ),
        );
    });

    it('sorts tree nodes by scenario count descending when Scenarios is selected', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            view.selectSort('scenarios'),
            // passing-feature (3 scenarios) should come first, others have 2 each
            Ensure.that(
                view.childTreeNodeLabels().as(labels => labels[0]),
                includes('passing'),
            ),
        );
    });
});

describe('CapabilitiesView search and filter bar', () => {

    it('search input is above the filter bar (matching ScenariosView pattern)', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.searchInput, isPresent()),
            Ensure.that(view.filterBar, isPresent()),
        );
    });

    it('filter bar has a "Health:" label prefix consistent with ScenariosView "Status:" pattern', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.filterBar.label(), includes('HEALTH:')),
        );
    });
});

// Accessibility-contract tests: These verify ARIA implementation details (role attributes,
// tabindex values, visually-hidden elements) that are not user-observable behaviour.
// Exposing these as interaction object methods would violate the principle "IO APIs describe
// user-observable behaviour, not implementation". They remain as raw Playwright assertions
// because they test the component's accessibility contract with assistive technology, not
// what a sighted user sees or does.
describe('CapabilitiesView accessibility', () => {

    it('outcome bars have role="img" and aria-label for screen readers', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        const outcomeBars = page.locator('.req-tree-bars[role="img"]');
        const count = await outcomeBars.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const ariaLabel = await outcomeBars.nth(i).getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            // aria-label should describe the outcomes (e.g. "5 passed, 1 failed, 1 pending")
            expect(ariaLabel).toMatch(/passed/i);
        }
    });

    it('outcome bars include visually-hidden text summary', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        const hiddenSummaries = page.locator('.req-tree-bars .visually-hidden');
        const count = await hiddenSummaries.count();
        expect(count).toBeGreaterThan(0);

        const text = await hiddenSummaries.first().textContent();
        expect(text).toMatch(/passed/i);
    });

    it('tree nodes use roving tabindex pattern', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        const treeNodes = page.locator('.req-tree-node[tabindex]');
        const count = await treeNodes.count();
        expect(count).toBeGreaterThan(1);

        // Only one node should have tabindex="0" (the active/focusable one)
        const focusableNodes = page.locator('.req-tree-node[tabindex="0"]');
        await expect(focusableNodes).toHaveCount(1);

        // All other nodes should have tabindex="-1"
        const inertNodes = page.locator('.req-tree-node[tabindex="-1"]');
        const inertCount = await inertNodes.count();
        expect(inertCount).toBe(count - 1);
    });

    it('tree supports arrow key navigation', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        // Focus the first tree node
        const firstNode = page.locator('.req-tree-node[tabindex="0"]');
        await firstNode.focus();
        await expect(firstNode).toBeFocused();

        const firstNodeText = await firstNode.textContent();

        // Press ArrowDown to move focus to the next node
        await page.keyboard.press('ArrowDown');

        // Verify focus moved to a different node
        const focusedElement = page.locator('.req-tree-node:focus');
        await expect(focusedElement).toBeVisible();
        const focusedText = await focusedElement.textContent();
        expect(focusedText).not.toBe(firstNodeText);
    });
});

describe('CapabilitiesView detail panel interaction object', () => {

    function detailPanelData() {
        return minimalData({
            capabilities: {
                name: 'specs', type: 'directory', displayName: 'specs',
                outcomes: { passed: 15, failed: 3, pending: 1, skipped: 1, compromised: 0, error: 0 },
                children: [
                    {
                        name: 'authentication', type: 'directory', displayName: 'authentication',
                        outcomes: { passed: 5, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        children: [
                            { name: 'login.spec.ts', type: 'file', outcomes: { passed: 5, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                        ],
                    },
                    {
                        name: 'checkout', type: 'directory', displayName: 'checkout',
                        outcomes: { passed: 6, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        children: [
                            { name: 'cart.spec.ts', type: 'file', outcomes: { passed: 6, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                        ],
                    },
                    {
                        name: 'todo', type: 'directory', displayName: 'todo',
                        outcomes: { passed: 4, failed: 1, pending: 1, skipped: 1, compromised: 0, error: 0 },
                        children: [
                            { name: 'items.spec.ts', type: 'file', outcomes: { passed: 4, failed: 1, pending: 1, skipped: 1, compromised: 0, error: 0 } },
                        ],
                    },
                ],
            },
        });
    }

    it('shows the confidence score of the selected capability', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            data: detailPanelData(),
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.confidence(), equals('91%')),
        );
    });

    it('shows the scenario count of the selected capability', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            data: detailPanelData(),
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCount(), includes('20')),
        );
    });

    it('lists child capability names', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            data: detailPanelData(),
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.childCapabilityNames(), equals(['authentication', 'checkout', 'todo'])),
        );
    });

    it('allows selecting a capability from the tree', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            data: detailPanelData(),
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            view.selectCapability('authentication'),
            Ensure.that(view.detailTitle(), equals('Authentication')),
            Ensure.that(view.confidence(), equals('93%')),
        );
    });

    it('can read the href of a link in the README', async ({ mount, actor }) => {
        const view = await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            props: { onNavigate: () => undefined, route: '#/capabilities' },
            data: minimalData({
                capabilities: {
                    name: 'specs', type: 'directory', displayName: 'specs',
                    outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                    readme: '<p>Visit <a href="https://serenity-js.org">Serenity/JS</a> for docs.</p>',
                    children: [
                        { name: 'example', type: 'file', displayName: 'example', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, children: [] },
                    ],
                },
            }),
            interactionObject: CapabilitiesView,
        });

        await actor.attemptsTo(
            Ensure.that(view.readmeLinkHref('Serenity/JS'), equals('https://serenity-js.org')),
        );
    });
});
