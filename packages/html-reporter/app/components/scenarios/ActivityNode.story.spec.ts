import { Ensure, equals, includes, isFalse, isTrue } from '@serenity-js/assertions';

import { minimalData } from '../../../spec/app/data-factories.js';
import { describe, it } from '../../../spec/app/story-fixtures.js';
import { ActivityNode } from '../../../src/serenity/scenarios/ActivityNode.serenity.js';

const activityNodeStory = 'components/scenarios/ActivityNode/Default';

const baseActivity = {
    type: 'Interaction',
    outcome: 'SUCCESS',
    duration: 50,
    children: [],
};

const headRequestQuery = {
    method: 'HEAD',
    url: 'https://todo-app.serenity-js.org/',
    requestHeaders: 'Accept: application/json\nUser-Agent: axios/1.17.0',
    statusCode: 200,
    responseHeaders: 'content-type: text/html\nserver: GitHub.com',
};

const postRequestQuery = {
    method: 'POST',
    url: 'https://api.example.com/todos',
    requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer token123',
    requestBody: '{\n    "title": "Buy milk"\n}',
    statusCode: 201,
    responseHeaders: 'content-type: application/json',
    responseBody: '{\n    "id": 1,\n    "title": "Buy milk"\n}',
};

describe('ActivityNode — HTTP exchange (restQuery)', () => {

    it('renders a REST badge when restQuery is present', async ({ interactionObject, actor }) => {
        const node = await interactionObject(ActivityNode, activityNodeStory, {
            data: minimalData(),
            props: {
                activity: {
                    ...baseActivity,
                    name: 'Tess sends a HEAD request to "/"',
                    restQuery: headRequestQuery,
                },
            },
        });

        await actor.attemptsTo(
            Ensure.that(node.hasRestBadge(), isTrue()),
        );
    });

    it('displays method, URL, and status code', async ({ interactionObject, actor }) => {
        const node = await interactionObject(ActivityNode, activityNodeStory, {
            data: minimalData(),
            props: {
                activity: {
                    ...baseActivity,
                    name: 'Tess sends a HEAD request to "/"',
                    restQuery: {
                        ...headRequestQuery,
                        requestHeaders: 'Accept: application/json',
                        responseHeaders: 'content-type: text/html',
                    },
                },
            },
        });

        await actor.attemptsTo(
            node.expandRestPanel(),
            Ensure.that(node.restPanel.method(), equals('HEAD')),
            Ensure.that(node.restPanel.url(), equals('https://todo-app.serenity-js.org/')),
            Ensure.that(node.restPanel.statusCode(), equals('200')),
        );
    });

    it('displays request and response headers', async ({ interactionObject, actor }) => {
        const node = await interactionObject(ActivityNode, activityNodeStory, {
            data: minimalData(),
            props: {
                activity: {
                    ...baseActivity,
                    name: 'Tess sends a POST request to "/todos"',
                    duration: 100,
                    restQuery: postRequestQuery,
                },
            },
        });

        await actor.attemptsTo(
            node.expandRestPanel(),
            Ensure.that(node.restPanelContent(), includes('Content-Type: application/json')),
            Ensure.that(node.restPanelContent(), includes('Authorization: Bearer token123')),
            Ensure.that(node.restPanelContent(), includes('content-type: application/json')),
        );
    });

    it('displays request and response bodies', async ({ interactionObject, actor }) => {
        const node = await interactionObject(ActivityNode, activityNodeStory, {
            data: minimalData(),
            props: {
                activity: {
                    ...baseActivity,
                    name: 'Tess sends a POST request to "/todos"',
                    duration: 100,
                    restQuery: postRequestQuery,
                },
            },
        });

        await actor.attemptsTo(
            node.expandRestPanel(),
            Ensure.that(node.restPanelContent(), includes('Buy milk')),
            Ensure.that(node.restPanelContent(), includes('"id": 1')),
        );
    });

    it('does not render REST badge when restQuery is absent', async ({ interactionObject, actor }) => {
        const node = await interactionObject(ActivityNode, activityNodeStory, {
            data: minimalData(),
            props: {
                activity: {
                    ...baseActivity,
                    name: 'Tess navigates to "/index.html"',
                },
            },
        });

        await actor.attemptsTo(
            Ensure.that(node.hasRestBadge(), isFalse()),
        );
    });
});

describe('ActivityNode — report data attachments', () => {

    it('renders a data attachment block for each reportData entry', async ({ interactionObject, actor }) => {
        const node = await interactionObject(ActivityNode, activityNodeStory, {
            data: minimalData(),
            props: {
                activity: {
                    ...baseActivity,
                    name: 'Tess logs the current items',
                    reportData: [
                        { title: 'current items', contents: '["buy milk", "feed cat"]' },
                    ],
                },
            },
        });

        await actor.attemptsTo(
            Ensure.that(node.reportDataCount(), equals(1)),
            Ensure.that(node.reportDataContent().as(blocks => blocks[0]), includes('current items')),
            Ensure.that(node.reportDataContent().as(blocks => blocks[0]), includes('buy milk')),
        );
    });

    it('renders multiple data attachments', async ({ interactionObject, actor }) => {
        const node = await interactionObject(ActivityNode, activityNodeStory, {
            data: minimalData(),
            props: {
                activity: {
                    ...baseActivity,
                    name: 'Tess debugs the state',
                    reportData: [
                        { title: 'request', contents: 'GET /api/items' },
                        { title: 'response', contents: '200 OK' },
                    ],
                },
            },
        });

        await actor.attemptsTo(
            Ensure.that(node.reportDataCount(), equals(2)),
            Ensure.that(node.reportDataContent().as(blocks => blocks[0]), includes('request')),
            Ensure.that(node.reportDataContent().as(blocks => blocks[1]), includes('response')),
        );
    });

    it('does not render data blocks when reportData is absent', async ({ interactionObject, actor }) => {
        const node = await interactionObject(ActivityNode, activityNodeStory, {
            data: minimalData(),
            props: {
                activity: {
                    ...baseActivity,
                    name: 'Tess navigates to "/index.html"',
                },
            },
        });

        await actor.attemptsTo(
            Ensure.that(node.reportDataCount(), equals(0)),
        );
    });
});
