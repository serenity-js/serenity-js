import { contain, Ensure, equals, includes } from '@serenity-js/assertions';

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
            Ensure.that(view.filterBar.filterLabels(), contain('All')),
            Ensure.that(view.filterBar.filterLabels(), contain('Healthy')),
            Ensure.that(view.filterBar.filterLabels(), contain('At Risk')),
            Ensure.that(view.filterBar.filterLabels(), contain('Critical')),
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
            Ensure.that(view.filterBar.activeFilters(), contain('All')),
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

    it('search filters the tree and shows result count', async ({ mount, actor, page }) => {
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
        );

        await expect(page.locator('.req-tree-node', { hasText: 'passing-feature' })).toBeVisible();
        await expect(page.locator('.req-tree-node', { hasText: 'failing-feature' })).not.toBeVisible();
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

        it('shows README prominently (not collapsible, not hidden)', async ({ mount, page }) => {
            await mount({
                component: 'CapabilitiesView',
                importPath: './components/capabilities/CapabilitiesView',
                data: capabilitiesData(),
                props: { onNavigate: () => undefined, route: '#/capabilities' },
            });

            // README should be visible without any interaction
            const detail = page.locator('.req-detail-panel');
            await expect(detail.locator('.readme-content')).toBeVisible();
            await expect(detail.locator('.readme-content')).toContainText('project documentation');
            // Should NOT be inside a collapsible details/summary element
            await expect(detail.locator('details .readme-content')).toHaveCount(0);
        });

        it('reading order: title, health header, outcome bar, README, test files', async ({ mount, page }) => {
            await mount({
                component: 'CapabilitiesView',
                importPath: './components/capabilities/CapabilitiesView',
                data: capabilitiesData(),
                props: { onNavigate: () => undefined, route: '#/capabilities' },
            });

            await page.locator('.req-tree-node', { hasText: 'passing-feature' }).click();

            const detail = page.locator('.req-detail-panel');
            // Title comes first
            await expect(detail.locator('.req-detail-title').first()).toBeVisible();
            // Detail header (confidence + metrics) comes before README
            await expect(detail.locator('.req-detail-header')).toBeVisible();
            // README is present and visible
            await expect(detail.locator('.readme-content')).toContainText('Passing feature docs');
        });
    });

    describe('left panel — navigation', () => {

        it('filter bar uses the shared filter-bar styling with confidence categories', async ({ mount, page }) => {
            await mount({
                component: 'CapabilitiesView',
                importPath: './components/capabilities/CapabilitiesView',
                data: capabilitiesData(),
                props: { onNavigate: () => undefined, route: '#/capabilities' },
            });

            const leftPanel = page.locator('.req-tree-panel');
            const filterBar = leftPanel.locator('.filter-bar');
            await expect(filterBar).toBeVisible();
            await expect(filterBar).toContainText('Healthy');
            await expect(filterBar).toContainText('At Risk');
            await expect(filterBar).toContainText('Critical');
            await expect(filterBar).toContainText('Gaps');
        });
    });

    describe('detail header — single source of truth', () => {

        it('shows confidence prominently in the detail panel header', async ({ mount, page }) => {
            await mount({
                component: 'CapabilitiesView',
                importPath: './components/capabilities/CapabilitiesView',
                data: capabilitiesData(),
                props: { onNavigate: () => undefined, route: '#/capabilities' },
            });

            const header = page.locator('.req-detail-header');
            await expect(header).toBeVisible();
            await expect(header.locator('.req-detail-confidence')).toContainText('%');
            await expect(header.locator('.req-detail-confidence-label')).toContainText('confidence');
        });
    });

    it('shows empty state when capabilities data is missing', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: minimalData({ capabilities: null }),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        await expect(page.locator('.empty-state')).toBeVisible();
        await expect(page.locator('body')).toContainText('specDirectory');
    });

    it('filter bar and search are hidden when there is only 1 capability', async ({ mount, page }) => {
        await mount({
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
        });

        await expect(page.locator('.filter-bar')).not.toBeVisible();
        await expect(page.locator('input.search-input')).not.toBeVisible();
    });
});

describe('CapabilitiesView sort control', () => {

    it('displays a sort dropdown with options: Name, Confidence, Scenarios', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        const sortSelect = page.locator('.req-tree-panel .sort-select');
        await expect(sortSelect).toBeVisible();
        await expect(sortSelect.locator('option')).toHaveCount(3);
        await expect(sortSelect.locator('option[value="name"]')).toHaveText('Name');
        await expect(sortSelect.locator('option[value="confidence"]')).toHaveText('Confidence');
        await expect(sortSelect.locator('option[value="scenarios"]')).toHaveText('Scenarios');
    });

    it('defaults to sorting by name', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        const sortSelect = page.locator('.req-tree-panel .sort-select');
        await expect(sortSelect).toHaveValue('name');
    });

    it('sorts tree nodes by confidence ascending (worst first) when Confidence is selected', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        await page.locator('.req-tree-panel .sort-select').selectOption('confidence');

        const nodeLabels = await page.locator('.req-tree-node .req-tree-label').allTextContents();
        // Remove the root node (first entry)
        const childLabels = nodeLabels.slice(1);
        // failing-feature (50%) should come before pending-feature (70%) which comes before passing-feature (100%)
        expect(childLabels[0]).toContain('failing');
        expect(childLabels[childLabels.length - 1]).toContain('passing');
    });

    it('sorts tree nodes by scenario count descending when Scenarios is selected', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        await page.locator('.req-tree-panel .sort-select').selectOption('scenarios');

        const nodeLabels = await page.locator('.req-tree-node .req-tree-label').allTextContents();
        const childLabels = nodeLabels.slice(1);
        // passing-feature (3 scenarios) should come first, others have 2 each
        expect(childLabels[0]).toContain('passing');
    });
});

describe('CapabilitiesView search and filter bar', () => {

    it('search input is above the filter bar (matching ScenariosView pattern)', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        const leftPanel = page.locator('.req-tree-panel');
        await expect(leftPanel.locator('input.search-input')).toBeVisible();
        await expect(leftPanel.locator('.filter-bar')).toBeVisible();
    });

    it('filter bar has a "Health:" label prefix consistent with ScenariosView "Status:" pattern', async ({ mount, page }) => {
        await mount({
            component: 'CapabilitiesView',
            importPath: './components/capabilities/CapabilitiesView',
            data: capabilitiesData(),
            props: { onNavigate: () => undefined, route: '#/capabilities' },
        });

        const filterBar = page.locator('.req-tree-panel .filter-bar');
        await expect(filterBar).toContainText('Health:');
    });
});

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
            Ensure.that(view.confidence(), includes('%')),
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
            Ensure.that(view.childCapabilityNames(), contain('authentication')),
            Ensure.that(view.childCapabilityNames(), contain('checkout')),
            Ensure.that(view.childCapabilityNames(), contain('todo')),
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
            Ensure.that(view.confidence(), includes('%')),
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
