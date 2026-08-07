/**
 * Theme toggle radio group keyboard navigation.
 * These tests verify implementation contracts (tabindex roving, arrow key focus)
 * and use raw Playwright rather than interaction objects per project conventions.
 */
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('ThemeToggle — roving tabindex', () => {

    it('only the active radio has tabindex="0"', async ({ mount, page }) => {
        await mount({
            component: 'App',
            importPath: './components/common/App',
            data: minimalData(),
        });

        const radios = page.locator('[role="radiogroup"][aria-label="Theme preference"] [role="radio"]');
        await expect(radios).toHaveCount(3);

        // The checked one has tabindex 0
        const checked = page.locator('[role="radiogroup"] [role="radio"][aria-checked="true"]');
        await expect(checked).toHaveAttribute('tabindex', '0');

        // Unchecked ones have tabindex -1
        const unchecked = page.locator('[role="radiogroup"] [role="radio"][aria-checked="false"]');
        await expect(unchecked.first()).toHaveAttribute('tabindex', '-1');
    });

    it('ArrowRight moves selection and focus to next option', async ({ mount, page }) => {
        await mount({
            component: 'App',
            importPath: './components/common/App',
            data: minimalData(),
        });

        const radios = page.locator('[role="radiogroup"][aria-label="Theme preference"] [role="radio"]');
        const firstRadio = radios.first();

        // Click the first radio (light) to ensure known state
        await firstRadio.click();
        await expect(firstRadio).toHaveAttribute('aria-checked', 'true');

        await page.keyboard.press('ArrowRight');

        // Second radio (system) should now be checked and focused
        const secondRadio = radios.nth(1);
        await expect(secondRadio).toHaveAttribute('aria-checked', 'true');
        await expect(secondRadio).toBeFocused();
    });

    it('ArrowLeft wraps from first to last option', async ({ mount, page }) => {
        await mount({
            component: 'App',
            importPath: './components/common/App',
            data: minimalData(),
        });

        const radios = page.locator('[role="radiogroup"][aria-label="Theme preference"] [role="radio"]');
        const firstRadio = radios.first();

        // Click first to ensure known state
        await firstRadio.click();
        await expect(firstRadio).toHaveAttribute('aria-checked', 'true');

        await page.keyboard.press('ArrowLeft');

        // Should wrap to last (dark)
        const lastRadio = radios.last();
        await expect(lastRadio).toHaveAttribute('aria-checked', 'true');
        await expect(lastRadio).toBeFocused();
    });
});
