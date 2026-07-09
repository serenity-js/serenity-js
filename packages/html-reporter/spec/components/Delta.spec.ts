import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

describe('Delta', () => {

    it('renders nothing when previous is undefined', async ({ mount, page }) => {
        await mount({
            component: 'Delta',
            importPath: './components/charts/Delta',
            props: { current: 80, previous: undefined },
            data: minimalData(),
        });

        await expect(page.locator('.kpi-delta')).toHaveCount(0);
    });

    it('shows "no change" when current equals previous', async ({ mount, page }) => {
        await mount({
            component: 'Delta',
            importPath: './components/charts/Delta',
            props: { current: 75, previous: 75 },
            data: minimalData(),
        });

        const delta = page.locator('.kpi-delta');
        await expect(delta).toHaveText('— no change');
        await expect(delta).toHaveClass(/kpi-delta--neutral/);
    });

    it('shows upward arrow with positive class when value increases', async ({ mount, page }) => {
        await mount({
            component: 'Delta',
            importPath: './components/charts/Delta',
            props: { current: 85, previous: 70 },
            data: minimalData(),
        });

        const delta = page.locator('.kpi-delta');
        await expect(delta).toContainText('↑ 15');
        await expect(delta).toHaveClass(/kpi-delta--positive/);
    });

    it('shows downward arrow with negative class when value decreases', async ({ mount, page }) => {
        await mount({
            component: 'Delta',
            importPath: './components/charts/Delta',
            props: { current: 60, previous: 80 },
            data: minimalData(),
        });

        const delta = page.locator('.kpi-delta');
        await expect(delta).toContainText('↓ 20');
        await expect(delta).toHaveClass(/kpi-delta--negative/);
    });

    it('inverts polarity when invert is true (increase = negative)', async ({ mount, page }) => {
        await mount({
            component: 'Delta',
            importPath: './components/charts/Delta',
            props: { current: 5, previous: 2, invert: true },
            data: minimalData(),
        });

        // More failures = bad, so increase should show as negative
        const delta = page.locator('.kpi-delta');
        await expect(delta).toContainText('↓ 3');
        await expect(delta).toHaveClass(/kpi-delta--negative/);
    });

    it('inverts polarity when invert is true (decrease = positive)', async ({ mount, page }) => {
        await mount({
            component: 'Delta',
            importPath: './components/charts/Delta',
            props: { current: 1, previous: 4, invert: true },
            data: minimalData(),
        });

        // Fewer failures = good, so decrease should show as positive
        const delta = page.locator('.kpi-delta');
        await expect(delta).toContainText('↑ 3');
        await expect(delta).toHaveClass(/kpi-delta--positive/);
    });

    it('appends suffix to the displayed value', async ({ mount, page }) => {
        await mount({
            component: 'Delta',
            importPath: './components/charts/Delta',
            props: { current: 90, previous: 85, suffix: '%' },
            data: minimalData(),
        });

        const delta = page.locator('.kpi-delta');
        await expect(delta).toContainText('↑ 5%');
    });

    it('displays absolute difference regardless of direction', async ({ mount, page }) => {
        await mount({
            component: 'Delta',
            importPath: './components/charts/Delta',
            props: { current: 10, previous: 25 },
            data: minimalData(),
        });

        const delta = page.locator('.kpi-delta');
        // Should show 15, not -15
        await expect(delta).toContainText('↓ 15');
    });
});
