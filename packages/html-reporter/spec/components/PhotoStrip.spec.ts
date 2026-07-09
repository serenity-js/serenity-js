import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

function activitiesWithPhotos() {
    return [
        {
            name: 'Navigate to login page',
            outcome: 'SUCCESS',
            duration: 150,
            startedAt: '2024-06-15T14:30:00.100Z',
            children: [],
            artifacts: [
                { name: 'screenshot-1.png', path: 'screenshots/screenshot-1.png' },
            ],
        },
        {
            name: 'Fill in credentials',
            outcome: 'SUCCESS',
            duration: 200,
            startedAt: '2024-06-15T14:30:00.300Z',
            children: [
                {
                    name: 'Enter username',
                    outcome: 'SUCCESS',
                    duration: 80,
                    startedAt: '2024-06-15T14:30:00.300Z',
                    children: [],
                    artifacts: [
                        { name: 'nested-screenshot.png', path: 'screenshots/nested-screenshot.png' },
                    ],
                },
            ],
            artifacts: [
                { name: 'screenshot-2.png', path: 'screenshots/screenshot-2.png' },
            ],
        },
        {
            name: 'Click submit',
            outcome: 'SUCCESS',
            duration: 100,
            startedAt: '2024-06-15T14:30:00.600Z',
            children: [],
            artifacts: [
                { name: 'not-a-photo.json', path: 'data/result.json' },
            ],
        },
    ];
}

describe('PhotoStrip', () => {

    it('renders nothing when no .png artifacts exist', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: [
                    { name: 'step 1', outcome: 'SUCCESS', duration: 100, children: [], artifacts: [] },
                ],
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await expect(page.locator('.photo-strip')).toHaveCount(0);
        await expect(page.locator('.card-title')).toHaveCount(0);
    });

    it('renders nothing when activities have no artifacts at all', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: [
                    { name: 'step 1', outcome: 'SUCCESS', duration: 100, children: [] },
                ],
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await expect(page.locator('.photo-strip')).toHaveCount(0);
    });

    it('displays the correct photo count in the title', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        // 3 photos: screenshot-1.png, nested-screenshot.png, screenshot-2.png
        await expect(page.locator('.card-title')).toContainText('Screenshots (3)');
    });

    it('renders a thumbnail for each screenshot', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        const items = page.locator('.photo-strip-item');
        await expect(items).toHaveCount(3);
    });

    it('displays the activity name as caption for each photo', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        const captions = page.locator('.photo-strip-caption');
        await expect(captions.first()).toHaveText('Navigate to login page');
    });

    it('collects photos from nested child activities', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        // The nested "Enter username" activity has a screenshot
        const captions = await page.locator('.photo-strip-caption').allTextContents();
        expect(captions).toContain('Enter username');
    });

    it('excludes non-.png artifacts', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        // The .json artifact from "Click submit" should not appear
        const captions = await page.locator('.photo-strip-caption').allTextContents();
        expect(captions).not.toContain('Click submit');
    });

    it('opens lightbox when clicking a thumbnail', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        // Click the first thumbnail image
        await page.locator('.photo-strip-item img').first().click();

        const lightbox = page.locator('.lightbox-overlay');
        await expect(lightbox).toBeVisible();
        await expect(page.locator('.lightbox-caption')).toContainText('Navigate to login page');
    });

    it('lightbox navigates forward with ArrowRight', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        // Open lightbox on first photo
        await page.locator('.photo-strip-item img').first().click();
        await expect(page.locator('.lightbox-caption')).toContainText('Navigate to login page');

        // Press ArrowRight to go to next
        await page.keyboard.press('ArrowRight');
        await expect(page.locator('.lightbox-caption')).toContainText('Fill in credentials');
    });

    it('lightbox navigates backward with ArrowLeft', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        // Open lightbox on second photo
        await page.locator('.photo-strip-item img').nth(1).click();
        await expect(page.locator('.lightbox-caption')).toContainText('Fill in credentials');

        // Press ArrowLeft to go back
        await page.keyboard.press('ArrowLeft');
        await expect(page.locator('.lightbox-caption')).toContainText('Navigate to login page');
    });

    it('lightbox closes on Escape', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await page.locator('.photo-strip-item img').first().click();
        await expect(page.locator('.lightbox-overlay')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator('.lightbox-overlay')).toHaveCount(0);
    });

    it('lightbox closes when clicking the overlay background', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await page.locator('.photo-strip-item img').first().click();
        await expect(page.locator('.lightbox-overlay')).toBeVisible();

        // Click the overlay itself (not the image)
        await page.locator('.lightbox-overlay').click({ position: { x: 5, y: 5 } });
        await expect(page.locator('.lightbox-overlay')).toHaveCount(0);
    });

    it('lightbox shows counter indicating position (e.g., 1/3)', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await page.locator('.photo-strip-item img').first().click();
        await expect(page.locator('.lightbox-caption')).toContainText('1/3');
    });

    it('lightbox hides previous nav button on first photo', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await page.locator('.photo-strip-item img').first().click();
        await expect(page.locator('.lightbox-prev')).toHaveCount(0);
        await expect(page.locator('.lightbox-next')).toBeVisible();
    });

    it('lightbox hides next nav button on last photo', async ({ mount, page }) => {
        await mount({
            component: 'PhotoStrip',
            importPath: './components/scenario/PhotoStrip',
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await page.locator('.photo-strip-item img').last().click();
        await expect(page.locator('.lightbox-next')).toHaveCount(0);
        await expect(page.locator('.lightbox-prev')).toBeVisible();
    });
});
