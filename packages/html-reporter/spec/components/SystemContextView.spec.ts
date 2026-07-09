import { Ensure, equals, includes } from '@serenity-js/assertions';

import { SystemContextView } from '../../src/serenity/SystemContextView.serenity.js';
import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

describe('SystemContextView interaction object', () => {

    it('exposes the Node.js version', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.nodeVersion(), equals('v22.0.0')),
        );
    });

    it('exposes the test runner name and version', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.testRunner(), includes('Playwright')),
            Ensure.that(view.testRunner(), includes('1.45.0')),
        );
    });

    it('exposes the operating system', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.operatingSystem(), includes('darwin')),
        );
    });

    it('exposes the Serenity/JS version', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.serenityVersion(), equals('v3.44.0')),
        );
    });
});

describe('SystemContextView', () => {

    it('renders CI/CD information when present', async ({ mount, page }) => {
        await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData(),
        });

        await expect(page.locator('body')).toContainText('GitHub Actions');
        await expect(page.locator('body')).toContainText('#42');
        await expect(page.locator('body')).toContainText('main');
        await expect(page.locator('body')).toContainText('abc1234');
        await expect(page.locator('body')).toContainText('fix: resolve unstable test');
    });

    it('renders browser information', async ({ mount, page }) => {
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

    it('shows placeholder when systemContext is missing', async ({ mount, page }) => {
        await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: { ...minimalData(), systemContext: undefined },
        });

        await expect(page.locator('.placeholder-view')).toBeVisible();
        await expect(page.locator('body')).toContainText('not yet available');
    });

    it('does not render CI section when ci is null', async ({ mount, page }) => {
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
