import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('SystemContextView', () => {

    test('renders environment info', async ({ mount, page }) => {
        await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData(),
        });

        await expect(page.locator('.context-grid').first()).toBeVisible();
        await expect(page.locator('body')).toContainText('v22.0.0');
        await expect(page.locator('body')).toContainText('Playwright');
        await expect(page.locator('body')).toContainText('darwin');
        await expect(page.locator('body')).toContainText('v3.44.0');
    });

    test('renders CI/CD information when present', async ({ mount, page }) => {
        await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData(),
        });

        await expect(page.locator('body')).toContainText('GitHub Actions');
        await expect(page.locator('body')).toContainText('#42');
        await expect(page.locator('body')).toContainText('main');
        await expect(page.locator('body')).toContainText('abc1234');
        await expect(page.locator('body')).toContainText('fix: resolve flaky test');
    });

    test('renders browser information', async ({ mount, page }) => {
        await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData({
                systemContext: {
                    nodeVersion: 'v22.0.0',
                    os: { name: 'linux', version: '6.0', arch: 'x64' },
                    serenityVersion: '3.44.0',
                    testRunner: { name: 'Playwright', version: '1.45.0' },
                    browsers: [
                        { name: 'chromium', version: '126.0.1' },
                        { name: 'firefox', version: '115.0' },
                    ],
                    ci: null,
                },
            }),
        });

        await expect(page.locator('body')).toContainText('chromium');
        await expect(page.locator('body')).toContainText('126.0.1');
        await expect(page.locator('body')).toContainText('firefox');
        await expect(page.locator('body')).toContainText('115.0');
    });

    test('shows placeholder when systemContext is missing', async ({ mount, page }) => {
        await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: { ...minimalData(), systemContext: undefined },
        });

        await expect(page.locator('.placeholder-view')).toBeVisible();
        await expect(page.locator('body')).toContainText('not yet available');
    });

    test('does not render CI section when ci is null', async ({ mount, page }) => {
        await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData({
                systemContext: {
                    nodeVersion: 'v22.0.0',
                    os: { name: 'darwin', version: '24.0.0', arch: 'arm64' },
                    serenityVersion: '3.44.0',
                    testRunner: { name: 'Mocha', version: '11.0.0' },
                    browsers: [],
                    ci: null,
                },
            }),
        });

        await expect(page.locator('body')).toContainText('Mocha');
        await expect(page.locator('body')).not.toContainText('CI / CD');
    });
});
