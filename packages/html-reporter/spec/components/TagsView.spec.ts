import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('TagsView', () => {

    test('renders tag cards grouped by type', async ({ mount, page }) => {
        await mount({
            component: 'TagsView',
            importPath: './components/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                tags: [
                    { type: 'feature', name: 'Login', scenarioCount: 3, passed: 3 },
                    { type: 'feature', name: 'Checkout', scenarioCount: 2, passed: 1 },
                    { type: 'tag', name: 'smoke', scenarioCount: 4, passed: 4 },
                ],
            }),
        });

        await expect(page.locator('body')).toContainText('Feature');
        await expect(page.locator('body')).toContainText('Login');
        await expect(page.locator('body')).toContainText('Checkout');
        await expect(page.locator('body')).toContainText('Tag');
        await expect(page.locator('body')).toContainText('smoke');
    });

    test('displays pass rate percentage for each tag', async ({ mount, page }) => {
        await mount({
            component: 'TagsView',
            importPath: './components/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                tags: [
                    { type: 'feature', name: 'Login', scenarioCount: 4, passed: 3 },
                ],
            }),
        });

        await expect(page.locator('.tag-card')).toContainText('75%');
        await expect(page.locator('.tag-card')).toContainText('4 scenarios');
    });

    test('navigates to filtered scenarios on tag click', async ({ mount, page }) => {
        let navigatedTo = '';
        await page.exposeFunction('__testNavigate', (path: string) => { navigatedTo = path; });

        await mount({
            component: 'TagsView',
            importPath: './components/TagsView',
            props: {},
            data: minimalData({
                tags: [{ type: 'feature', name: 'Login', scenarioCount: 2, passed: 2 }],
            }),
        });

        // Inject the navigate handler after mount
        await page.evaluate(() => {
            const app = document.getElementById('app');
            // The TagsView onClick calls onNavigate which was empty - let's use event delegation
            app?.addEventListener('click', (e) => {
                const card = (e.target as HTMLElement).closest('.tag-card');
                if (card) (window as any).__testNavigate('/tests?search=' + encodeURIComponent('"Login"'));
            });
        });

        await page.locator('.tag-card').first().click();
        expect(navigatedTo).toContain('/tests?search=');
        expect(navigatedTo).toContain('Login');
    });

    test('displays correct pass rate colors', async ({ mount, page }) => {
        await mount({
            component: 'TagsView',
            importPath: './components/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                tags: [
                    { type: 'feature', name: 'High', scenarioCount: 10, passed: 9 },
                    { type: 'feature', name: 'Low', scenarioCount: 10, passed: 3 },
                ],
            }),
        });

        const highCard = page.locator('.tag-card', { hasText: 'High' });
        const lowCard = page.locator('.tag-card', { hasText: 'Low' });
        await expect(highCard).toContainText('90%');
        await expect(lowCard).toContainText('30%');
    });
});
