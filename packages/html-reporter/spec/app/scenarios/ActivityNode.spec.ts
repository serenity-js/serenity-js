import { Ensure, equals, includes, isFalse, isTrue } from '@serenity-js/assertions';

import { ActivityNode } from '../../../src/serenity/scenarios/ActivityNode.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

describe('ActivityNode — HTTP exchange (restQuery)', () => {

    it('renders a REST badge when restQuery is present', async ({ mount, actor }) => {
        const node = await mount({
            component: 'ActivityNode',
            importPath: './components/scenarios/ActivityNode',
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
            interactionObject: ActivityNode,
        });

        await actor.attemptsTo(
            Ensure.that(node.hasRestBadge(), isTrue()),
        );
    });

    it('displays method, URL, and status code', async ({ mount, actor }) => {
        const node = await mount({
            component: 'ActivityNode',
            importPath: './components/scenarios/ActivityNode',
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
            interactionObject: ActivityNode,
        });

        await actor.attemptsTo(
            node.expandRestPanel(),
            Ensure.that(node.restPanel.method(), equals('HEAD')),
            Ensure.that(node.restPanel.url(), equals('https://todo-app.serenity-js.org/')),
            Ensure.that(node.restPanel.statusCode(), equals('200')),
        );
    });

    it('displays request and response headers', async ({ mount, actor }) => {
        const node = await mount({
            component: 'ActivityNode',
            importPath: './components/scenarios/ActivityNode',
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
            interactionObject: ActivityNode,
        });

        await actor.attemptsTo(
            node.expandRestPanel(),
            Ensure.that(node.restPanelContent(), includes('Content-Type: application/json')),
            Ensure.that(node.restPanelContent(), includes('Authorization: Bearer token123')),
            Ensure.that(node.restPanelContent(), includes('content-type: application/json')),
        );
    });

    it('displays request and response bodies', async ({ mount, actor }) => {
        const node = await mount({
            component: 'ActivityNode',
            importPath: './components/scenarios/ActivityNode',
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
            interactionObject: ActivityNode,
        });

        await actor.attemptsTo(
            node.expandRestPanel(),
            Ensure.that(node.restPanelContent(), includes('Buy milk')),
            Ensure.that(node.restPanelContent(), includes('"id": 1')),
        );
    });

    it('does not render REST badge when restQuery is absent', async ({ mount, actor }) => {
        const node = await mount({
            component: 'ActivityNode',
            importPath: './components/scenarios/ActivityNode',
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
            interactionObject: ActivityNode,
        });

        await actor.attemptsTo(
            Ensure.that(node.hasRestBadge(), isFalse()),
        );
    });
});

describe('ActivityNode — report data attachments', () => {

    it('renders a data attachment block for each reportData entry', async ({ mount, actor }) => {
        const node = await mount({
            component: 'ActivityNode',
            importPath: './components/scenarios/ActivityNode',
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
            interactionObject: ActivityNode,
        });

        await actor.attemptsTo(
            Ensure.that(node.reportDataCount(), equals(1)),
            Ensure.that(node.reportDataContent().as(blocks => blocks[0]), includes('current items')),
            Ensure.that(node.reportDataContent().as(blocks => blocks[0]), includes('buy milk')),
        );
    });

    it('renders multiple data attachments', async ({ mount, actor }) => {
        const node = await mount({
            component: 'ActivityNode',
            importPath: './components/scenarios/ActivityNode',
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
            interactionObject: ActivityNode,
        });

        await actor.attemptsTo(
            Ensure.that(node.reportDataCount(), equals(2)),
            Ensure.that(node.reportDataContent().as(blocks => blocks[0]), includes('request')),
            Ensure.that(node.reportDataContent().as(blocks => blocks[1]), includes('response')),
        );
    });

    it('does not render data blocks when reportData is absent', async ({ mount, actor }) => {
        const node = await mount({
            component: 'ActivityNode',
            importPath: './components/scenarios/ActivityNode',
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
            interactionObject: ActivityNode,
        });

        await actor.attemptsTo(
            Ensure.that(node.reportDataCount(), equals(0)),
        );
    });
});
