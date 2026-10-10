/**
 * Hash routing contracts of the App component.
 * These use raw Playwright since they exercise the App component's routing, which is not wrapped in an IO,
 * and need precise control over when the URL hash changes relative to the initial render.
 */
import { describe, expect, it } from '@serenity-js/playwright-test';

import { minimalData } from '../../../spec/app/data-factories.js';

const galleryUrl = 'http://localhost:3200/playwright/gallery/index.html';

describe('App hash routing', () => {

    it('shows the view for a hash that changes straight after the initial render', async ({ page }) => {
        await page.goto(galleryUrl);
        await page.waitForFunction(() => typeof (window as any).mount === 'function');

        await page.evaluate(async data => {
            await (window as any).mount({ story: 'components/common/App/Default', props: { data } });

            // Change the hash synchronously after rendering, before the App had a chance to run its effects
            // and subscribe to hashchange events - like a test navigating to a deep link right after the page loads
            window.location.hash = '#/totally-fake-view';
        }, minimalData());

        await expect(page.locator('h2')).toContainText('Page Not Found');
    });
});
