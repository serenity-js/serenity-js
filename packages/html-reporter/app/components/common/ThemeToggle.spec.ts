/**
 * Theme toggle radio group keyboard navigation.
 * These tests verify implementation contracts (tabindex roving, arrow key focus)
 * and use raw Playwright rather than interaction objects per project conventions.
 */
import { minimalData } from '../../../spec/app/data-factories.js';
import { describe, expect, it } from '@serenity-js/playwright-test';

const themeRadioGroupSelector = '[role="radiogroup"][aria-label="Theme preference"] [role="radio"]';

describe('ThemeToggle — roving tabindex', () => {

    it('only the active radio has tabindex="0"', async ({ mount, page }) => {
        await mount('components/common/App/Default', { data: minimalData() });

        const radios = page.locator(themeRadioGroupSelector);
        await expect(radios).toHaveCount(3);

        const checked = page.locator('[role="radiogroup"] [role="radio"][aria-checked="true"]');
        await expect(checked).toHaveAttribute('tabindex', '0');

        const unchecked = page.locator('[role="radiogroup"] [role="radio"][aria-checked="false"]');
        await expect(unchecked.first()).toHaveAttribute('tabindex', '-1');
    });

    it('ArrowRight moves selection and focus to next option', async ({ mount, page }) => {
        await mount('components/common/App/Default', { data: minimalData() });

        const radios = page.locator(themeRadioGroupSelector);
        const firstRadio = radios.first();

        await firstRadio.click();
        await expect(firstRadio).toHaveAttribute('aria-checked', 'true');

        await page.keyboard.press('ArrowRight');

        const secondRadio = radios.nth(1);
        await expect(secondRadio).toHaveAttribute('aria-checked', 'true');
        await expect(secondRadio).toBeFocused();
    });

    it('ArrowLeft wraps from first to last option', async ({ mount, page }) => {
        await mount('components/common/App/Default', { data: minimalData() });

        const radios = page.locator(themeRadioGroupSelector);
        const firstRadio = radios.first();

        await firstRadio.click();
        await expect(firstRadio).toHaveAttribute('aria-checked', 'true');

        await page.keyboard.press('ArrowLeft');

        const lastRadio = radios.last();
        await expect(lastRadio).toHaveAttribute('aria-checked', 'true');
        await expect(lastRadio).toBeFocused();
    });
});
