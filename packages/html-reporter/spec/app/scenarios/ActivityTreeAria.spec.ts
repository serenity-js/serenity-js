/**
 * Activity tree ARIA semantics and keyboard navigation.
 * These tests verify implementation contracts (ARIA attributes, tabindex, keyboard focus mechanics)
 * and use raw Playwright rather than interaction objects per project conventions.
 */
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

const treeData = minimalData({
    scenarios: [{
        name: 'Test scenario', category: 'Suite', outcome: 'FAILURE', duration: 500,
        startedAt: '2024-06-15T14:30:00.000Z',
        source: { path: 'spec/tree.spec.ts' },
        tags: [],
        activities: [
            {
                type: 'Task', name: 'Given Alice logs in', outcome: 'SUCCESS', duration: 200,
                children: [
                    { type: 'Interaction', name: 'Alice enters username', outcome: 'SUCCESS', duration: 50, children: [] },
                    { type: 'Interaction', name: 'Alice enters password', outcome: 'SUCCESS', duration: 50, children: [] },
                    { type: 'Interaction', name: 'Alice clicks submit', outcome: 'SUCCESS', duration: 100, children: [] },
                ],
            },
            {
                type: 'Task', name: 'When Alice views dashboard', outcome: 'FAILURE', duration: 300,
                children: [
                    { type: 'Interaction', name: 'Alice navigates to /dashboard', outcome: 'SUCCESS', duration: 100, children: [] },
                    { type: 'Interaction', name: 'Alice waits for heading', outcome: 'FAILURE', duration: 200, children: [] },
                ],
            },
        ],
        executionHistory: [],
        error: { name: 'AssertionError', message: 'Expected heading', stack: '' },
    }],
});

describe('ActivityTree — ARIA semantics', () => {

    it('tree container has role="tree" and aria-label', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const tree = page.locator('[role="tree"]');
        await expect(tree).toHaveAttribute('aria-label', 'Activity tree');
    });

    it('top-level activities have role="treeitem" with aria-level="1"', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const topItems = page.locator('[role="tree"] > [role="treeitem"]');
        await expect(topItems).toHaveCount(2);
        await expect(topItems.first()).toHaveAttribute('aria-level', '1');
        await expect(topItems.nth(1)).toHaveAttribute('aria-level', '1');
    });

    it('passing task is initially collapsed (aria-expanded="false")', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const firstItem = page.locator('[role="tree"] > [role="treeitem"]').first();
        await expect(firstItem).toHaveAttribute('aria-expanded', 'false');
    });

    it('failing task is auto-expanded (aria-expanded="true")', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const secondItem = page.locator('[role="tree"] > [role="treeitem"]').nth(1);
        await expect(secondItem).toHaveAttribute('aria-expanded', 'true');
    });

    it('nested children have incremented aria-level', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        // The failing task is auto-expanded, its children should have level 2
        const nestedItems = page.locator('[role="tree"] > [role="treeitem"]:nth-child(2) [role="group"] > [role="treeitem"]');
        await expect(nestedItems).toHaveCount(2);
        await expect(nestedItems.first()).toHaveAttribute('aria-level', '2');
        await expect(nestedItems.nth(1)).toHaveAttribute('aria-level', '2');
    });

    it('expanded children are wrapped in role="group"', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        // Only the expanded (failing) task should have a visible group
        const groups = page.locator('[role="tree"] > [role="treeitem"] > [role="group"]');
        await expect(groups).toHaveCount(1);
    });

    it('first treeitem has tabindex="0" (roving tabindex entry point)', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const firstItem = page.locator('[role="tree"] > [role="treeitem"]').first();
        await expect(firstItem).toHaveAttribute('tabindex', '0');
    });

    it('non-first treeitems have tabindex="-1"', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const secondItem = page.locator('[role="tree"] > [role="treeitem"]').nth(1);
        await expect(secondItem).toHaveAttribute('tabindex', '-1');

        // Nested items also have tabindex -1
        const nestedItem = page.locator('[role="tree"] > [role="treeitem"]:nth-child(2) [role="group"] > [role="treeitem"]').first();
        await expect(nestedItem).toHaveAttribute('tabindex', '-1');
    });

    it('treeitems expose aria-setsize and aria-posinset', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const topItems = page.locator('[role="tree"] > [role="treeitem"]');
        await expect(topItems.first()).toHaveAttribute('aria-setsize', '2');
        await expect(topItems.first()).toHaveAttribute('aria-posinset', '1');
        await expect(topItems.nth(1)).toHaveAttribute('aria-setsize', '2');
        await expect(topItems.nth(1)).toHaveAttribute('aria-posinset', '2');
    });
});

describe('ActivityTree — keyboard navigation', () => {

    it('ArrowDown moves focus to the next visible treeitem', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const firstItem = page.locator('[role="tree"] > [role="treeitem"]').first();
        await firstItem.focus();
        await page.keyboard.press('ArrowDown');

        const secondItem = page.locator('[role="tree"] > [role="treeitem"]').nth(1);
        await expect(secondItem).toBeFocused();
    });

    it('ArrowUp moves focus to the previous visible treeitem', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const secondItem = page.locator('[role="tree"] > [role="treeitem"]').nth(1);
        await secondItem.focus();
        await page.keyboard.press('ArrowUp');

        const firstItem = page.locator('[role="tree"] > [role="treeitem"]').first();
        await expect(firstItem).toBeFocused();
    });

    it('ArrowRight expands a collapsed node', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const firstItem = page.locator('[role="tree"] > [role="treeitem"]').first();
        await expect(firstItem).toHaveAttribute('aria-expanded', 'false');

        await firstItem.focus();
        await page.keyboard.press('ArrowRight');

        await expect(firstItem).toHaveAttribute('aria-expanded', 'true');
    });

    it('ArrowRight on an expanded node moves focus to first child', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        // Second item is expanded (failing task)
        const secondItem = page.locator('[role="tree"] > [role="treeitem"]').nth(1);
        await secondItem.focus();
        await page.keyboard.press('ArrowRight');

        // Focus should move to the first child within the group
        const firstChild = page.locator('[role="tree"] > [role="treeitem"]:nth-child(2) [role="group"] > [role="treeitem"]').first();
        await expect(firstChild).toBeFocused();
    });

    it('ArrowLeft collapses an expanded node', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const secondItem = page.locator('[role="tree"] > [role="treeitem"]').nth(1);
        await expect(secondItem).toHaveAttribute('aria-expanded', 'true');

        await secondItem.focus();
        await page.keyboard.press('ArrowLeft');

        await expect(secondItem).toHaveAttribute('aria-expanded', 'false');
    });

    it('ArrowLeft on a collapsed child moves focus to parent', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        // Focus a child of the expanded second item
        const firstChild = page.locator('[role="tree"] > [role="treeitem"]:nth-child(2) [role="group"] > [role="treeitem"]').first();
        await firstChild.focus();
        await page.keyboard.press('ArrowLeft');

        // Focus should move to the parent (second top-level item)
        const secondItem = page.locator('[role="tree"] > [role="treeitem"]').nth(1);
        await expect(secondItem).toBeFocused();
    });

    it('Home moves focus to the first treeitem', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const secondItem = page.locator('[role="tree"] > [role="treeitem"]').nth(1);
        await secondItem.focus();
        await page.keyboard.press('Home');

        const firstItem = page.locator('[role="tree"] > [role="treeitem"]').first();
        await expect(firstItem).toBeFocused();
    });

    it('End moves focus to the last visible treeitem', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const firstItem = page.locator('[role="tree"] > [role="treeitem"]').first();
        await firstItem.focus();
        await page.keyboard.press('End');

        // The last visible treeitem is the second child of the expanded failing task
        const lastChild = page.locator('[role="tree"] > [role="treeitem"]:nth-child(2) [role="group"] > [role="treeitem"]').last();
        await expect(lastChild).toBeFocused();
    });

    it('Enter toggles expansion of a node with children', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        const firstItem = page.locator('[role="tree"] > [role="treeitem"]').first();
        await expect(firstItem).toHaveAttribute('aria-expanded', 'false');

        await firstItem.focus();
        await page.keyboard.press('Enter');

        await expect(firstItem).toHaveAttribute('aria-expanded', 'true');
    });

    it('Space toggles expansion of a node with children', async ({ mount, page }) => {
        await mount({
            component: 'ActivityTreeCard',
            importPath: './components/scenarios/ActivityTreeCard',
            data: treeData,
            props: {
                scenario: treeData.scenarios[0],
                currentActivities: treeData.scenarios[0].activities,
            },
        });

        // Collapse the expanded second item
        const secondItem = page.locator('[role="tree"] > [role="treeitem"]').nth(1);
        await expect(secondItem).toHaveAttribute('aria-expanded', 'true');

        await secondItem.focus();
        await page.keyboard.press(' ');

        await expect(secondItem).toHaveAttribute('aria-expanded', 'false');
    });
});
