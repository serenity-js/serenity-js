import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

/**
 * Builds fixture data for a retried scenario with videos per attempt.
 */
function retriedScenarioData() {
    const attempts = [
        { attemptNumber: 1, outcome: 'FAILURE', duration: 200, activities: [{ name: 'step 1', outcome: 'FAILURE', duration: 200, children: [] }], error: { name: 'Error', message: 'attempt 1 failed' }, video: 'test-runs/run-1/video-1.webm' },
        { attemptNumber: 2, outcome: 'FAILURE', duration: 180, activities: [{ name: 'step 2', outcome: 'FAILURE', duration: 180, children: [] }], error: { name: 'Error', message: 'attempt 2 failed' }, video: 'test-runs/run-1/video-2.webm' },
        { attemptNumber: 3, outcome: 'SUCCESS', duration: 150, activities: [{ name: 'step 3', outcome: 'SUCCESS', duration: 150, children: [] }], video: 'test-runs/run-1/video-3.webm' },
    ];

    return minimalData({
        scenarios: [
            {
                name: 'retried test', category: 'Suite', outcome: 'SUCCESS', duration: 150,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/retry.spec.ts', line: 10 },
                tags: [],
                activities: attempts[2].activities,
                executionHistory: [{
                    outcome: 'SUCCESS', run: '#1',
                    timestamp: '2024-06-15T14:30:00.000Z',
                    duration: 500,
                    activities: attempts[2].activities,
                    retries: 2,
                    attempts,
                }],
                retries: 2,
                attempts,
                video: 'test-runs/run-1/video-3.webm',
            },
        ],
        history: [{
            timestamp: '2024-06-15T14:30:00.000Z', label: '#1',
            outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            duration: 500, slowest: 150, fastest: 150, average: 150,
        }],
    });
}

const SCENARIO_ID = 'spec/retry.spec.ts:10';

describe('Deep linking — ScenarioDetailView attempts', () => {

    it('pre-selects attempt from ?attempt= URL parameter', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: `${SCENARIO_ID}?attempt=2`, onNavigate: '__noop' },
            data: retriedScenarioData(),
        });

        const tabs = page.locator('.retry-tab');
        await expect(tabs).toHaveCount(3);
        await expect(tabs.nth(1)).toHaveClass(/active/);
    });

    it('defaults to first attempt when no ?attempt= parameter', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: SCENARIO_ID, onNavigate: '__noop' },
            data: retriedScenarioData(),
        });

        const tabs = page.locator('.retry-tab');
        await expect(tabs).toHaveCount(3);
        await expect(tabs.nth(0)).toHaveClass(/active/);
    });

    it('updates URL hash with ?attempt= when clicking an attempt tab', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: SCENARIO_ID, onNavigate: '__noop' },
            data: retriedScenarioData(),
        });

        const tabs = page.locator('.retry-tab');
        await tabs.nth(2).click();

        const hash = await page.evaluate(() => window.location.hash);
        expect(hash).toContain('attempt=3');
    });

    it('shows the correct video for the selected attempt', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: `${SCENARIO_ID}?attempt=2`, onNavigate: '__noop' },
            data: retriedScenarioData(),
        });

        const videoSource = page.locator('video source');
        await expect(videoSource).toHaveAttribute('src', 'test-runs/run-1/video-2.webm');
    });

    it('hides video section for attempts that have no recording', async ({ mount, page }) => {
        // Simulate video: 'on-first-retry' — only attempt 2 has a video
        const attemptsWithPartialVideo = [
            { attemptNumber: 1, outcome: 'FAILURE', duration: 200, activities: [{ name: 'step 1', outcome: 'FAILURE', duration: 200, children: [] }], error: { name: 'Error', message: 'attempt 1 failed' } },
            { attemptNumber: 2, outcome: 'FAILURE', duration: 180, activities: [{ name: 'step 2', outcome: 'FAILURE', duration: 180, children: [] }], error: { name: 'Error', message: 'attempt 2 failed' }, video: 'test-runs/run-1/video-retry.webm' },
            { attemptNumber: 3, outcome: 'SUCCESS', duration: 150, activities: [{ name: 'step 3', outcome: 'SUCCESS', duration: 150, children: [] }] },
        ];

        const data = minimalData({
            scenarios: [{
                name: 'retried test', category: 'Suite', outcome: 'SUCCESS', duration: 150,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/retry.spec.ts', line: 10 },
                tags: [],
                activities: attemptsWithPartialVideo[2].activities,
                executionHistory: [],
                retries: 2,
                attempts: attemptsWithPartialVideo,
                video: 'test-runs/run-1/video-retry.webm',
            }],
            history: [{
                timestamp: '2024-06-15T14:30:00.000Z', label: '#1',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                duration: 500, slowest: 150, fastest: 150, average: 150,
            }],
        });

        // Select attempt 1, which has no video
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: `${SCENARIO_ID}?attempt=1`, onNavigate: '__noop' },
            data,
        });

        const video = page.locator('video');
        await expect(video).toHaveCount(0);
    });
});

describe('Deep linking — PhotoStrip', () => {

    const photoData = minimalData({
        scenarios: [{
            name: 'test with photos', category: 'Suite', outcome: 'SUCCESS', duration: 100,
            startedAt: '2024-06-15T14:30:00.000Z',
            source: { path: 'spec/photos.spec.ts', line: 5 },
            tags: [],
            activities: [
                { name: 'Click button', outcome: 'SUCCESS', duration: 50, startedAt: '2024-06-15T14:30:00.000Z', children: [], artifacts: [{ path: 'screenshots/click.png', type: 'screenshot' }] },
                { name: 'Enter text', outcome: 'SUCCESS', duration: 50, startedAt: '2024-06-15T14:30:00.050Z', children: [], artifacts: [{ path: 'screenshots/enter.png', type: 'screenshot' }] },
            ],
            executionHistory: [],
        }],
    });

    it('updates URL hash with ?photo= when clicking a photo thumbnail', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/photos.spec.ts:5', onNavigate: '__noop' },
            data: photoData,
            hash: '/tests/spec/photos.spec.ts:5',
        });

        // The photo strip renders img elements inside .photo-strip-item divs
        const img = page.locator('.photo-strip-item img').first();
        await expect(img).toBeVisible();
        await img.click();

        const hash = await page.evaluate(() => window.location.hash);
        expect(hash).toContain('photo=0');
    });
});
