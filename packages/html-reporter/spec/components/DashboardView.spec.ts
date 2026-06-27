import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('DashboardView', () => {

    test('renders confidence hero card with score and delta', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200, score: { confidence: 70, passRate: 80, stability: 75, completeness: 65 } },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250, score: { confidence: 76, passRate: 87, stability: 82, completeness: 75 } },
                ],
            }),
        });

        const heroCard = page.locator('.kpi-card--hero');
        await expect(heroCard).toBeVisible();
        await expect(heroCard.locator('.kpi-label')).toHaveText('Confidence');
        await expect(heroCard.locator('.kpi-value')).toContainText('76');
        // Description shows state change
        await expect(heroCard.locator('.kpi-subtitle')).toContainText('Improved since last run');
    });

    test('renders pass rate, stability, and completeness with deltas', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200, score: { confidence: 70, passRate: 80, stability: 75, completeness: 65 } },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250, score: { confidence: 76, passRate: 87, stability: 82, completeness: 75 } },
                ],
            }),
        });

        const passRateCard = page.locator('.kpi-card[aria-label*="Pass rate"]');
        await expect(passRateCard.locator('.kpi-value')).toContainText('87');
        await expect(passRateCard.locator('.kpi-delta')).toContainText('↑ 7%');

        const stabilityCard = page.locator('.kpi-card[aria-label*="Stability"]');
        await expect(stabilityCard.locator('.kpi-value')).toContainText('82');
        await expect(stabilityCard.locator('.kpi-delta')).toContainText('↑ 7%');

        const completenessCard = page.locator('.kpi-card[aria-label*="Completeness"]');
        await expect(completenessCard.locator('.kpi-value')).toContainText('75');
        await expect(completenessCard.locator('.kpi-delta')).toContainText('↑ 10%');
    });

    test('displays CI branch and commit info', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        await expect(page.locator('body')).toContainText('main');
        await expect(page.locator('body')).toContainText('abc1234');
    });

    test('displays slowest tests', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        await expect(page.locator('body')).toContainText('Slowest');
        await expect(page.locator('body')).toContainText('Test D');
    });

    test('displays failed count with inverted delta', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        const failedCard = page.locator('.kpi-card--operational', { hasText: 'Failed' });
        await expect(failedCard.locator('.kpi-value')).toHaveText('1');
        // Previous run: 0 failed → current: 1 failed → delta is +1, but inverted (increase = negative)
        await expect(failedCard.locator('.kpi-delta')).toContainText('↓ 1');
    });

    test('displays duration with comparison', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        const durationCard = page.locator('.kpi-card--operational', { hasText: 'Duration' });
        await expect(durationCard.locator('.kpi-value')).toContainText('1.0s');
        // Previous: 800ms, current: 1000ms → 200ms slower
        await expect(durationCard.locator('.kpi-delta')).toContainText('200ms');
    });

    test('shows "No degraded tests" when none degraded', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        await expect(page.locator('body')).toContainText('No degraded tests');
    });

    test('hero card has area sparkline when history available', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200, score: { confidence: 70, passRate: 80, stability: 75, completeness: 65 } },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250, score: { confidence: 76, passRate: 87, stability: 82, completeness: 75 } },
                ],
            }),
        });

        await expect(page.locator('.kpi-card--hero .sparkline-area')).toBeVisible();
    });

    test('operational cards have dot trend indicators', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        await expect(page.locator('.kpi-card--operational', { hasText: 'Failed' }).locator('.kpi-dots')).toBeVisible();
        await expect(page.locator('.kpi-card--operational', { hasText: 'Duration' }).locator('.kpi-dots')).toBeVisible();
    });
});
