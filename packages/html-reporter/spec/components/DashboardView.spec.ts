import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

describe('DashboardView', () => {

    it('renders confidence hero card with score and delta', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200, score: { confidence: 70, passRate: 80, consistency: 75, completeness: 65 } },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250, score: { confidence: 76, passRate: 87, consistency: 82, completeness: 75 } },
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

    it('renders pass rate, consistency, and completeness with deltas', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200, score: { confidence: 70, passRate: 80, consistency: 75, completeness: 65 } },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250, score: { confidence: 76, passRate: 87, consistency: 82, completeness: 75 } },
                ],
            }),
        });

        const passRateCard = page.locator('.kpi-card[aria-label*="Pass rate"]');
        await expect(passRateCard.locator('.kpi-value')).toContainText('87');
        await expect(passRateCard.locator('.kpi-delta')).toContainText('↑ 7%');

        const consistencyCard = page.locator('.kpi-card[aria-label*="Consistency"]');
        await expect(consistencyCard.locator('.kpi-value')).toContainText('82');
        await expect(consistencyCard.locator('.kpi-delta')).toContainText('↑ 7%');

        const completenessCard = page.locator('.kpi-card[aria-label*="Completeness"]');
        await expect(completenessCard.locator('.kpi-value')).toContainText('75');
        await expect(completenessCard.locator('.kpi-delta')).toContainText('↑ 10%');
    });

    it('displays CI branch and commit info', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        await expect(page.locator('body')).toContainText('main');
        await expect(page.locator('body')).toContainText('abc1234');
    });

    it('displays slowest tests', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        await expect(page.locator('body')).toContainText('Slowest');
        await expect(page.locator('body')).toContainText('Test D');
    });

    it('displays failed count with inverted delta', async ({ mount, page }) => {
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

    it('displays duration with comparison', async ({ mount, page }) => {
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

    it('shows "No degraded tests" when none degraded', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        await expect(page.locator('body')).toContainText('All tests consistent');
    });

    it('hero card has area sparkline when history available', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200, score: { confidence: 70, passRate: 80, consistency: 75, completeness: 65 } },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250, score: { confidence: 76, passRate: 87, consistency: 82, completeness: 75 } },
                ],
            }),
        });

        await expect(page.locator('.kpi-card--hero .sparkline-area')).toBeVisible();
    });

    it('operational cards have dot trend indicators', async ({ mount, page }) => {
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

describe('DashboardView accessibility', () => {

    it('KPI cards use native button elements', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        const kpiCards = page.locator('.kpi-card');
        const count = await kpiCards.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const tagName = await kpiCards.nth(i).evaluate(element => element.tagName.toLowerCase());
            expect(tagName).toBe('button');
        }
    });

    it('KPI cards have type="button" attribute', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        const kpiCards = page.locator('.kpi-card');
        const count = await kpiCards.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            await expect(kpiCards.nth(i)).toHaveAttribute('type', 'button');
        }
    });

    it('KPI cards are keyboard-accessible without onKeyDown handlers', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),
        });

        // Tab to the first KPI card
        const firstCard = page.locator('.kpi-card').first();
        await firstCard.focus();
        await expect(firstCard).toBeFocused();

        // Press Enter — native button elements activate on Enter without needing onKeyDown
        await page.keyboard.press('Enter');

        // Verify the card received focus and is interactive via keyboard
        // (the button element handles Enter/Space natively)
        const tagName = await firstCard.evaluate(element => element.tagName.toLowerCase());
        expect(tagName).toBe('button');
    });
});

describe('DashboardView consistency card', () => {

    it('labels flaky test as "flaky" (not "inconsistent")', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                inconsistentTests: [
                    {
                        name: 'Flaky checkout',
                        category: 'Suite',
                        source: { path: 'spec/flaky.spec.ts', line: 10 },
                        tags: [],
                        inconsistencyRate: 0.5,
                        history: ['RETRIED_SUCCESS', 'RETRIED_SUCCESS'],
                        labels: ['#1', '#2'],
                    },
                ],
            }),
        });

        const consistencyCard = page.locator('.dashboard-status-card', { hasText: 'Consistency' });
        await expect(consistencyCard.locator('.status-item-kind')).toHaveText('flaky');
        await expect(consistencyCard.locator('.status-item-kind')).not.toHaveText('inconsistent');
    });

    it('labels test with failure history and RETRIED_SUCCESS last as "inconsistent"', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                inconsistentTests: [
                    {
                        name: 'Unstable login',
                        category: 'Suite',
                        source: { path: 'spec/unstable.spec.ts', line: 5 },
                        tags: [],
                        inconsistencyRate: 0.6,
                        history: ['FAILURE', 'RETRIED_SUCCESS'],
                        labels: ['#1', '#2'],
                    },
                ],
            }),
        });

        const consistencyCard = page.locator('.dashboard-status-card', { hasText: 'Consistency' });
        await expect(consistencyCard.locator('.status-item-kind')).toHaveText('inconsistent');
    });

    it('renders all four kind categories with correct labels', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData({
                newFailures: [
                    { name: 'Degraded test', category: 'Suite', source: { path: 'spec/a.spec.ts', line: 1 }, tags: [] },
                ],
                newPasses: [
                    { name: 'Recovered test', category: 'Suite', source: { path: 'spec/b.spec.ts', line: 1 }, tags: [] },
                ],
                inconsistentTests: [
                    {
                        name: 'Flaky test',
                        category: 'Suite',
                        source: { path: 'spec/c.spec.ts', line: 1 },
                        tags: [],
                        inconsistencyRate: 0.5,
                        history: ['RETRIED_SUCCESS', 'SUCCESS'],
                        labels: ['#1', '#2'],
                    },
                    {
                        name: 'Inconsistent test',
                        category: 'Suite',
                        source: { path: 'spec/d.spec.ts', line: 1 },
                        tags: [],
                        inconsistencyRate: 0.7,
                        history: ['FAILURE', 'RETRIED_SUCCESS'],
                        labels: ['#1', '#2'],
                    },
                ],
            }),
        });

        const consistencyCard = page.locator('.dashboard-status-card', { hasText: 'Consistency' });
        const kinds = consistencyCard.locator('.status-item-kind');
        await expect(kinds).toHaveCount(4);

        const texts = await kinds.allTextContents();
        expect(texts).toContain('degraded');
        expect(texts).toContain('recovered');
        expect(texts).toContain('flaky');
        expect(texts).toContain('inconsistent');
    });
});
