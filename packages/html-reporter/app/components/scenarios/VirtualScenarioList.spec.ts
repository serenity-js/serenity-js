/**
 * Rendering contracts of virtualised lists.
 * These use raw Playwright since they need to inspect the DOM synchronously after the initial render,
 * before the virtualiser has had a chance to measure its scroll container.
 */
import { describe, expect, it } from '@serenity-js/playwright-test';

import { minimalData } from '../../../spec/app/data-factories.js';

const galleryUrl = 'http://localhost:3200/playwright/gallery/index.html';

describe('Virtual scenario list', () => {

    it('renders the scenario rows in the same render as the view', async ({ page }) => {
        await page.goto(galleryUrl);
        await page.waitForFunction(() => typeof (window as any).mount === 'function');

        const renderedRows = await page.evaluate(async data => {
            await (window as any).mount({ story: 'components/scenarios/ScenariosView/Default', props: { ...data, data } });

            // Count the rows straight after rendering, before any effects had a chance to run
            return document.querySelectorAll('.scenario-item').length;
        }, minimalData());

        expect(renderedRows).toBeGreaterThan(0);
    });
});
