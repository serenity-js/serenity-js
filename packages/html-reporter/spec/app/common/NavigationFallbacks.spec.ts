/**
 * Navigation fallback tests: 404 pages and invalid filter handling.
 * These test structural/navigation contracts and use raw Playwright locators
 * since they exercise the App component's routing which is not wrapped in an IO.
 */
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('Route-level 404', () => {

    it('shows "Page Not Found" heading for an unknown route', async ({ mount, page }) => {
        await mount({
            component: 'App',
            importPath: './components/common/App',
            data: minimalData(),
            hash: '/totally-fake-view',
        });

        await expect(page.locator('h2')).toContainText('Page Not Found');
    });

    it('shows a link to Dashboard from 404 page', async ({ mount, page }) => {
        await mount({
            component: 'App',
            importPath: './components/common/App',
            data: minimalData(),
            hash: '/nonexistent-page',
        });

        const backLink = page.locator('a[href="#/"]');
        await expect(backLink).toContainText('Go to Dashboard');
    });

    it('sets data-testid="not-found" on main content for unknown route', async ({ mount, page }) => {
        await mount({
            component: 'App',
            importPath: './components/common/App',
            data: minimalData(),
            hash: '/does-not-exist',
        });

        const main = page.locator('[data-testid="not-found"]');
        await expect(main).toBeVisible();
    });
});

describe('Scenario-level 404', () => {

    it('shows "not found" message when scenario ID does not match', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            data: minimalData(),
            props: {
                scenarioId: 'nonexistent/path.spec.ts:999',
                onNavigate: () => {},
            },
        });

        await expect(page.locator('text=Test scenario not found')).toBeVisible();
    });

    it('shows a back link to Test Scenarios list', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            data: minimalData(),
            props: {
                scenarioId: 'nonexistent/path.spec.ts:999',
                onNavigate: () => {},
            },
        });

        const backLink = page.getByRole('link', { name: /Back to Test Scenarios/ });
        await expect(backLink).toBeVisible();
        await expect(backLink).toHaveAttribute('href', '#/tests');
    });

    it('shows "Not Found" in the breadcrumb trail', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            data: minimalData(),
            props: {
                scenarioId: 'nonexistent/path.spec.ts:999',
                onNavigate: () => {},
            },
        });

        const breadcrumb = page.locator('.breadcrumb');
        await expect(breadcrumb).toContainText('Not Found');
    });
});

describe('Invalid filter fallback', () => {

    it('treats an unrecognised filter value as "All"', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            data: minimalData(),
            props: { onNavigate: () => {}, route: '/tests?filter=BOGUS' },
        });

        // The "All" chip should be active (aria-pressed="true")
        const allChip = page.locator('.filter-chip').first();
        await expect(allChip).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows all scenarios when filter is invalid', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            data: minimalData(),
            props: { onNavigate: () => {}, route: '/tests?filter=INVALID_VALUE' },
        });

        // All 4 scenarios from minimalData should be visible
        const scenarioItems = page.locator('.scenario-item');
        await expect(scenarioItems).toHaveCount(4);
    });

    it('treats a comma-separated filter with all invalid values as "All"', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            data: minimalData(),
            props: { onNavigate: () => {}, route: '/tests?filter=foo,bar,baz' },
        });

        const allChip = page.locator('.filter-chip').first();
        await expect(allChip).toHaveAttribute('aria-pressed', 'true');
    });

    it('strips invalid filter from the URL via replaceState', async ({ mount, page }) => {
        await mount({
            component: 'App',
            importPath: './components/common/App',
            data: minimalData(),
            hash: '/tests?filter=BOGUS',
        });

        // Wait for the sync effect to fire and strip the invalid filter
        await page.waitForFunction(() => !window.location.hash.includes('filter=BOGUS'), { timeout: 3000 });

        // URL should no longer contain the invalid filter
        const hash = await page.evaluate(() => window.location.hash);
        expect(hash).not.toContain('filter=BOGUS');
    });
});
