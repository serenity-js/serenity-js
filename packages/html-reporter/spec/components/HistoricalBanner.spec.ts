import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('HistoricalBanner', () => {

    test('renders the banner with label and runLabel', async ({ mount, page }) => {
        await mount({
            component: 'HistoricalBanner',
            importPath: './components/HistoricalBanner',
            props: {
                label: 'Viewing results from:',
                runLabel: 'Run #42 — 15 Jun 2024',
                onShowLatest: '__noop',
            },
            data: minimalData(),
            dataAsProps: false,
        });

        await expect(page.locator('.historical-banner')).toContainText('Viewing results from:');
        await expect(page.locator('.historical-banner')).toContainText('Run #42 — 15 Jun 2024');
    });

    test('renders the runLabel in a strong element', async ({ mount, page }) => {
        await mount({
            component: 'HistoricalBanner',
            importPath: './components/HistoricalBanner',
            props: {
                label: 'Viewing results from:',
                runLabel: 'Run #42 — 15 Jun 2024',
                onShowLatest: '__noop',
            },
            data: minimalData(),
            dataAsProps: false,
        });

        const strong = page.locator('.historical-banner strong');
        await expect(strong).toHaveText('Run #42 — 15 Jun 2024');
    });

    test('renders subtitle when provided', async ({ mount, page }) => {
        await mount({
            component: 'HistoricalBanner',
            importPath: './components/HistoricalBanner',
            props: {
                label: 'Viewing results from:',
                runLabel: 'Run #42',
                subtitle: '— 2m 30s',
                onShowLatest: '__noop',
            },
            data: minimalData(),
            dataAsProps: false,
        });

        await expect(page.locator('.historical-banner')).toContainText('— 2m 30s');
    });

    test('does not render subtitle when not provided', async ({ mount, page }) => {
        await mount({
            component: 'HistoricalBanner',
            importPath: './components/HistoricalBanner',
            props: {
                label: 'Viewing errors from:',
                runLabel: 'Run #42',
                onShowLatest: '__noop',
            },
            data: minimalData(),
            dataAsProps: false,
        });

        const text = await page.locator('.historical-banner span').textContent();
        expect(text).not.toContain('—');
    });

    test('renders "show latest" link with onClick when no href provided', async ({ mount, page }) => {
        let clicked = false;
        await page.exposeFunction('__onShowLatest__', () => { clicked = true; });

        await mount({
            component: 'HistoricalBanner',
            importPath: './components/HistoricalBanner',
            props: {
                label: 'Viewing results from:',
                runLabel: 'Run #42',
                onShowLatest: '__onShowLatest__',
            },
            data: minimalData(),
            dataAsProps: false,
        });

        const link = page.locator('.historical-banner a.link-underline');
        await expect(link).toHaveText('show latest');
        await expect(link).not.toHaveAttribute('href');
        await link.click();
        expect(clicked).toBe(true);
    });

    test('renders "show latest" link with href when showLatestHref provided', async ({ mount, page }) => {
        await mount({
            component: 'HistoricalBanner',
            importPath: './components/HistoricalBanner',
            props: {
                label: 'Viewing results from:',
                runLabel: 'Run #42',
                showLatestHref: '#/tests',
                onShowLatest: '__noop',
            },
            data: minimalData(),
            dataAsProps: false,
        });

        const link = page.locator('.historical-banner a.link-underline');
        await expect(link).toHaveText('show latest');
        await expect(link).toHaveAttribute('href', '#/tests');
    });

    test('has the correct CSS class for styling', async ({ mount, page }) => {
        await mount({
            component: 'HistoricalBanner',
            importPath: './components/HistoricalBanner',
            props: {
                label: 'Viewing results from:',
                runLabel: 'Run #42',
                onShowLatest: '__noop',
            },
            data: minimalData(),
            dataAsProps: false,
        });

        await expect(page.locator('.historical-banner')).toBeVisible();
        await expect(page.locator('.historical-banner')).toHaveCount(1);
    });
});
