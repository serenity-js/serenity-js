import { expect, test } from './fixtures';

test.describe('HTML Reporter', () => {

    test.describe('Dashboard', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto('/index.html#/');
            await page.waitForSelector('.kpi-card, .kpi-value');
        });

        test('displays the pass rate', async ({ page }) => {
            await expect(page.locator('body')).toContainText('71.4%');
        });

        test('displays degraded tests in the Degraded card', async ({ page }) => {
            const degradedCard = page.locator('.card', { hasText: 'Degraded' });
            await expect(degradedCard).toContainText('should complete an item');
            await expect(degradedCard).not.toContainText('No degraded tests');
        });

        test('displays recovered tests in the Recovered card', async ({ page }) => {
            const recoveredCard = page.locator('.card', { hasText: 'Recovered' });
            await expect(recoveredCard).toContainText('should persist items');
            await expect(recoveredCard).not.toContainText('No newly recovered tests');
        });

        test('displays the total scenario count', async ({ page }) => {
            await expect(page.locator('body')).toContainText('7 scenarios');
        });
    });

    test.describe('Test Scenarios', () => {

        test.describe('listing', () => {

            test.beforeEach(async ({ page }) => {
                await page.goto('/index.html#/tests');
                await page.waitForSelector('.scenario-item');
            });

            test('displays all scenarios', async ({ page }) => {
                await expect(page.locator('body')).toContainText('Showing 7 of 7 test scenarios');
            });

            test('shows scenario names', async ({ page }) => {
                await expect(page.locator('body')).toContainText('should display items');
                await expect(page.locator('body')).toContainText('should add a new item');
            });

            test('shows source paths', async ({ page }) => {
                await expect(page.locator('body')).toContainText('todo.spec.ts');
            });
        });

        test.describe('search', () => {

            test('filters scenarios by name', async ({ page }) => {
                await page.goto('/index.html#/tests?search=%22complete%22');
                await page.waitForFunction(() => document.body.textContent?.includes('Showing 1 of 7'));
                await expect(page.locator('body')).toContainText('Showing 1 of 7 test scenarios');
                await expect(page.locator('body')).toContainText('should complete an item');
            });

            test('filters scenarios by category', async ({ page }) => {
                await page.goto('/index.html#/tests?search=%22Persistence%22');
                await page.waitForFunction(() => document.body.textContent?.includes('Showing 2 of 7'));
                await expect(page.locator('body')).toContainText('Showing 2 of 7 test scenarios');
            });
        });
    });

    test.describe('System Context', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto('/index.html#/system');
            await page.waitForSelector('.context-grid');
        });

        test('displays Node.js version', async ({ page }) => {
            await expect(page.locator('body')).toContainText(process.version);
        });

        test('displays the test runner', async ({ page }) => {
            await expect(page.locator('body')).toContainText('Playwright');
        });

        test('displays CI provider information', async ({ page }) => {
            await expect(page.locator('body')).toContainText('GitHub Actions');
            await expect(page.locator('body')).toContainText('#42');
            await expect(page.locator('body')).toContainText('main');
            await expect(page.locator('body')).toContainText('abc1234');
        });

        test('displays the commit message', async ({ page }) => {
            await expect(page.locator('body')).toContainText('fix: resolve flaky test');
        });
    });

    test.describe('Errors', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto('/index.html#/errors');
            await page.waitForFunction(() => document.body.textContent?.includes('should complete'));
        });

        test('displays error scenarios', async ({ page }) => {
            await expect(page.locator('body')).toContainText('should complete an item');
        });

        test('shows error messages', async ({ page }) => {
            await expect(page.locator('body')).toContainText('Expected');
        });
    });

    test.describe('Stability', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto('/index.html#/stability');
            await page.waitForFunction(() => document.body.textContent?.includes('should complete an item'));
        });

        test('displays unstable tests', async ({ page }) => {
            await expect(page.locator('body')).toContainText('should complete an item');
        });

        test('shows the flakiness rate', async ({ page }) => {
            await expect(page.locator('body')).toContainText('50%');
        });
    });

    test.describe('Tags', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto('/index.html#/tags');
            await page.waitForSelector('.tag-card');
        });

        test('displays feature tags', async ({ page }) => {
            await expect(page.locator('body')).toContainText('Todo List');
        });

        test('displays browser tags', async ({ page }) => {
            await expect(page.locator('body')).toContainText(/chromium \d+\.\d+/);
        });
    });

    test.describe('Dashboard cards', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto('/index.html#/');
            await page.waitForSelector('.kpi-card, .kpi-value');
        });

        test('renders charts', async ({ page }) => {
            await expect(page.locator('canvas').first()).toBeVisible();
        });

        test('displays slowest tests', async ({ page }) => {
            await expect(page.locator('body')).toContainText('Slowest');
        });

        test('displays CI branch info', async ({ page }) => {
            await expect(page.locator('body')).toContainText('main');
        });

        test('displays CI commit info', async ({ page }) => {
            await expect(page.locator('body')).toContainText('abc1234');
        });
    });

    test.describe('Scenario detail with artifacts', () => {

        test.beforeEach(async ({ page }) => {
            // Navigate to the first passing scenario (has screenshots and video)
            await page.goto('/index.html#/tests');
            await page.waitForSelector('.scenario-item');
            await page.locator('.scenario-item', { hasText: 'should display items' }).click();
            await page.waitForSelector('.activity-tree, .scenario-detail-header');
        });

        test('displays screenshot thumbnails in the activity tree', async ({ page }) => {
            await expect(page.locator('img[src*="screenshot"]')).not.toHaveCount(0);
        });

        test('displays video player', async ({ page }) => {
            await expect(page.locator('video')).toHaveCount(1);
        });

        test('video source references a webm file', async ({ page }) => {
            const video = page.locator('video').first();
            const source = await video.getAttribute('src') || await video.locator('source').getAttribute('src');
            expect(source).toContain('.webm');
        });
    });

    test.describe('Scenario filters and navigation', () => {

        test('filters by passed outcome', async ({ page }) => {
            await page.goto('/index.html#/tests');
            await page.waitForSelector('.scenario-item');
            await page.click('button:has-text("Passed")');
            await page.waitForFunction(() => document.body.textContent?.includes('Showing 5 of 7'));
            await expect(page.locator('body')).toContainText('Showing 5 of 7');
        });

        test('shows retried scenario as passed', async ({ page }) => {
            await page.goto('/index.html#/tests?search=%22edit%22');
            await page.waitForSelector('.scenario-item');
            const editItem = page.locator('.scenario-item', { hasText: 'should edit an item' });
            await expect(editItem).toBeVisible();
            await expect(editItem.locator('.scenario-outcome-icon.passed')).toBeVisible();
        });

        test('navigates to scenario detail on click', async ({ page }) => {
            await page.goto('/index.html#/tests');
            await page.waitForSelector('.scenario-item');
            await page.click('.scenario-item');
            await page.waitForSelector('.activity-tree, .error-block, .scenario-detail-header');
            expect(page.url()).toContain('#/tests/');
        });
    });

    test.describe('Test Runs', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto('/index.html#/test-runs');
            await page.waitForSelector('.scenario-item');
        });

        test('renders the trend chart', async ({ page }) => {
            await expect(page.locator('canvas')).toHaveCount(1);
        });

        test('displays run history entries', async ({ page }) => {
            await expect(page.locator('.scenario-item')).not.toHaveCount(0);
        });

        test('navigates to filtered scenarios on run click', async ({ page }) => {
            await page.click('.scenario-item');
            await page.waitForFunction(() => window.location.hash.includes('/tests?run='));
            expect(page.url()).toContain('/tests?run=');
        });
    });

    test.describe('Timeline', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto('/index.html#/timeline');
            await page.waitForSelector('.card');
        });

        test('displays the timeline view', async ({ page }) => {
            await expect(page.locator('body')).toContainText('Timeline');
        });

        test('shows scenario bars', async ({ page }) => {
            await expect(page.locator('body')).toContainText('should display items');
        });
    });

    test.describe('Tags navigation', () => {

        test('navigates to filtered scenarios on tag click', async ({ page }) => {
            await page.goto('/index.html#/tags');
            await page.waitForSelector('.tag-card');
            await page.click('.tag-card');
            await page.waitForFunction(() => window.location.hash.includes('/tests'));
            expect(page.url()).toContain('/tests');
        });
    });

    test.describe('Theme', () => {

        test('toggles dark mode', async ({ page }) => {
            await page.goto('/index.html#/');
            await page.waitForSelector('button[aria-label="Toggle theme"]');
            const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
            await page.click('button[aria-label="Toggle theme"]');
            await page.waitForFunction(
                (initial) => document.documentElement.getAttribute('data-theme') !== initial,
                initialTheme,
            );
            const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
            expect(newTheme).not.toEqual(initialTheme);
        });
    });

    test.describe('Document title', () => {

        test('includes project title', async ({ page }) => {
            await page.goto('/index.html#/');
            await page.waitForSelector('.kpi-card');
            const title = await page.title();
            expect(title).toContain('Serenity/JS');
            expect(title).toContain('Test Project');
        });
    });
});
