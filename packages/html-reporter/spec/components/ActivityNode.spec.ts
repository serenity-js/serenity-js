import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('ActivityNode — HTTP exchange (restQuery)', () => {

    test('renders a REST badge when restQuery is present', async ({ mount, page }) => {
        await mount({
            component: 'ActivityNode',
            importPath: './components/ActivityNode',
            data: minimalData(),
            props: {
                activity: {
                    type: 'Interaction',
                    name: 'Tess sends a HEAD request to "/"',
                    outcome: 'SUCCESS',
                    duration: 50,
                    children: [],
                    restQuery: {
                        method: 'HEAD',
                        url: 'https://todo-app.serenity-js.org/',
                        requestHeaders: 'Accept: application/json\nUser-Agent: axios/1.17.0',
                        statusCode: 200,
                        responseHeaders: 'content-type: text/html\nserver: GitHub.com',
                    },
                },
            },
        });

        await expect(page.locator('.rest-badge')).toBeVisible();
        await expect(page.locator('.rest-badge')).toContainText('REST');
    });

    test('displays method, URL, and status code', async ({ mount, page }) => {
        await mount({
            component: 'ActivityNode',
            importPath: './components/ActivityNode',
            data: minimalData(),
            props: {
                activity: {
                    type: 'Interaction',
                    name: 'Tess sends a HEAD request to "/"',
                    outcome: 'SUCCESS',
                    duration: 50,
                    children: [],
                    restQuery: {
                        method: 'HEAD',
                        url: 'https://todo-app.serenity-js.org/',
                        requestHeaders: 'Accept: application/json',
                        statusCode: 200,
                        responseHeaders: 'content-type: text/html',
                    },
                },
            },
        });

        // Click the badge to expand the panel
        await page.locator('.rest-badge').click();

        const panel = page.locator('.rest-query-panel');
        await expect(panel).toBeVisible();
        await expect(panel).toContainText('HEAD');
        await expect(panel).toContainText('https://todo-app.serenity-js.org/');
        await expect(panel).toContainText('200');
    });

    test('displays request and response headers', async ({ mount, page }) => {
        await mount({
            component: 'ActivityNode',
            importPath: './components/ActivityNode',
            data: minimalData(),
            props: {
                activity: {
                    type: 'Interaction',
                    name: 'Tess sends a POST request to "/todos"',
                    outcome: 'SUCCESS',
                    duration: 100,
                    children: [],
                    restQuery: {
                        method: 'POST',
                        url: 'https://api.example.com/todos',
                        requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer token123',
                        requestBody: '{\n    "title": "Buy milk"\n}',
                        statusCode: 201,
                        responseHeaders: 'content-type: application/json',
                        responseBody: '{\n    "id": 1,\n    "title": "Buy milk"\n}',
                    },
                },
            },
        });

        await page.locator('.rest-badge').click();

        const panel = page.locator('.rest-query-panel');
        await expect(panel).toContainText('Content-Type: application/json');
        await expect(panel).toContainText('Authorization: Bearer token123');
        await expect(panel).toContainText('content-type: application/json');
    });

    test('displays request and response bodies', async ({ mount, page }) => {
        await mount({
            component: 'ActivityNode',
            importPath: './components/ActivityNode',
            data: minimalData(),
            props: {
                activity: {
                    type: 'Interaction',
                    name: 'Tess sends a POST request to "/todos"',
                    outcome: 'SUCCESS',
                    duration: 100,
                    children: [],
                    restQuery: {
                        method: 'POST',
                        url: 'https://api.example.com/todos',
                        requestHeaders: 'Content-Type: application/json',
                        requestBody: '{\n    "title": "Buy milk"\n}',
                        statusCode: 201,
                        responseHeaders: 'content-type: application/json',
                        responseBody: '{\n    "id": 1,\n    "title": "Buy milk"\n}',
                    },
                },
            },
        });

        await page.locator('.rest-badge').click();

        const panel = page.locator('.rest-query-panel');
        await expect(panel).toContainText('Buy milk');
        await expect(panel).toContainText('"id": 1');
    });

    test('does not render REST badge when restQuery is absent', async ({ mount, page }) => {
        await mount({
            component: 'ActivityNode',
            importPath: './components/ActivityNode',
            data: minimalData(),
            props: {
                activity: {
                    type: 'Interaction',
                    name: 'Tess navigates to "/index.html"',
                    outcome: 'SUCCESS',
                    duration: 50,
                    children: [],
                },
            },
        });

        await expect(page.locator('.rest-badge')).not.toBeVisible();
    });
});

test.describe('ActivityNode — report data attachments', () => {

    test('renders a data attachment block for each reportData entry', async ({ mount, page }) => {
        await mount({
            component: 'ActivityNode',
            importPath: './components/ActivityNode',
            data: minimalData(),
            props: {
                activity: {
                    type: 'Interaction',
                    name: 'Tess logs the current items',
                    outcome: 'SUCCESS',
                    duration: 50,
                    children: [],
                    reportData: [
                        { title: 'current items', contents: '["buy milk", "feed cat"]' },
                    ],
                },
            },
        });

        const attachment = page.locator('.report-data-block');
        await expect(attachment).toBeVisible();
        await expect(attachment).toContainText('current items');
        await expect(attachment).toContainText('buy milk');
    });

    test('renders multiple data attachments', async ({ mount, page }) => {
        await mount({
            component: 'ActivityNode',
            importPath: './components/ActivityNode',
            data: minimalData(),
            props: {
                activity: {
                    type: 'Interaction',
                    name: 'Tess debugs the state',
                    outcome: 'SUCCESS',
                    duration: 50,
                    children: [],
                    reportData: [
                        { title: 'request', contents: 'GET /api/items' },
                        { title: 'response', contents: '200 OK' },
                    ],
                },
            },
        });

        const attachments = page.locator('.report-data-block');
        await expect(attachments).toHaveCount(2);
        await expect(attachments.first()).toContainText('request');
        await expect(attachments.last()).toContainText('response');
    });

    test('does not render data blocks when reportData is absent', async ({ mount, page }) => {
        await mount({
            component: 'ActivityNode',
            importPath: './components/ActivityNode',
            data: minimalData(),
            props: {
                activity: {
                    type: 'Interaction',
                    name: 'Tess navigates to "/index.html"',
                    outcome: 'SUCCESS',
                    duration: 50,
                    children: [],
                },
            },
        });

        await expect(page.locator('.report-data-block')).not.toBeVisible();
    });
});
