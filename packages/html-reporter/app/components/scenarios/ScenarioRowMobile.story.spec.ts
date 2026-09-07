import { minimalData } from '../../../spec/app/data-factories.js';
import { describe, expect, it } from '../../../spec/app/story-fixtures.js';

/*
 * Implementation contracts: these tests verify CSS layout behaviour (single-row tags,
 * bounding box height) and click-target mechanics at specific viewport sizes. They
 * require raw Playwright for viewport manipulation, bounding box measurement, and
 * navigation callback capture — none of which map to user-observable IO behaviour.
 */
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

    it('keeps tags on a single row without wrapping on mobile viewport', async ({ mount, page }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        await mount('components/scenarios/ScenariosView/Default', {
            ...scenarioWithManyTags,
            data: scenarioWithManyTags,
        });

        const tagsElement = page.locator('.scenario-tags').first();
        await tagsElement.waitFor();
        const box = await tagsElement.boundingBox();

        // A single row of tags should be no taller than ~40px (one line of chips)
        expect(box!.height).toBeLessThanOrEqual(40);
    });

    it('allows clicking the scenario name without tag interference on mobile', async ({ mount, page }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        await mount('components/scenarios/ScenariosView/WithNavigation', {
            ...scenarioWithManyTags,
            data: scenarioWithManyTags,
            route: '/tests',
        });

        // Click the scenario name directly - should trigger row navigation, not a tag link
        const scenarioName = page.locator('.scenario-name').first();
        await scenarioName.click();

        const navigatedTo = page.locator('[data-testid="navigated-to"]');
        const navigatedValue = await navigatedTo.inputValue();
        // The navigation should go to scenario detail (contains the scenario path), not to a tag search
        expect(navigatedValue).toContain('/tests/');
        expect(navigatedValue).not.toContain('search=');
    });
});
