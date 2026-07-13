import { Ensure, equals } from '@serenity-js/assertions';

import { ScenariosView } from '../../../src/serenity/scenarios/ScenariosView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('ScenariosView mobile', () => {

    const scenarioWithManyTags = minimalData({
        scenarios: [
            {
                name: 'should complete checkout', category: 'Checkout', outcome: 'FAILURE', duration: 500,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/checkout.spec.ts', line: 10 },
                tags: [
                    { type: 'browser', name: 'chromium 149.0.7827.55' },
                    { type: 'project', name: 'chromium' },
                    { type: 'platform', name: 'macOS 25.5.0' },
                    { type: 'tag', name: 'smoke' },
                    { type: 'tag', name: 'regression' },
                    { type: 'tag', name: 'checkout-flow' },
                    { type: 'tag', name: 'payments' },
                ],
                activities: [],
                executionHistory: [],
                error: { name: 'AssertionError', message: 'Expected checkout to complete', stack: '' },
            },
        ],
    });

    it('keeps tags on a single row without wrapping on mobile viewport', async ({ mount, page, actor }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        const view = await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data: scenarioWithManyTags,
            interactionObject: ScenariosView,
        });

        // The tags container should not exceed one line height
        const tagsElement = page.locator('.scenario-tags').first();
        await tagsElement.waitFor();
        const box = await tagsElement.boundingBox();

        // A single row of tags should be no taller than ~40px (one line of chips)
        // If tags wrap, the height would be 60px+ (two or more lines)
        expect(box!.height).toBeLessThanOrEqual(40);
    });

    it('allows clicking the scenario name without tag interference on mobile', async ({ mount, page, actor }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        let navigatedTo = '';
        await page.exposeFunction('__captureNav', (path: string) => { navigatedTo = path; });

        await mount({
            component: 'ScenariosView',
            importPath: './components/scenarios/ScenariosView',
            props: { onNavigate: '__captureNav', route: '/tests' },
            data: scenarioWithManyTags,
        });

        // Click the scenario name directly - should trigger row navigation, not a tag link
        const scenarioName = page.locator('.scenario-name').first();
        await scenarioName.click();

        // The navigation should go to scenario detail (contains the scenario path), not to a tag search
        expect(navigatedTo).toContain('/tests/');
        expect(navigatedTo).not.toContain('search=');
    });
});
