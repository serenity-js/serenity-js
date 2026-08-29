import { Ensure, equals } from '@serenity-js/assertions';

import { RestQueryPanel } from '../../../src/serenity/common/RestQueryPanel.serenity.js';
import { describe, it } from '../fixtures.js';

describe('RestQueryPanel', () => {

    it('displays the HTTP method', async ({ interactionObject, actor }) => {
        const panel = await interactionObject(RestQueryPanel, './components/common/RestQueryPanel', {
            props: {
                restQuery: {
                    method: 'GET',
                    url: 'https://api.example.com/users',
                    statusCode: 200,
                    requestHeaders: 'Accept: application/json',
                    requestBody: '',
                    responseHeaders: 'Content-Type: application/json',
                    responseBody: '{"users": []}',
                },
            },
        });

        await actor.attemptsTo(
            Ensure.that(panel.method(), equals('GET')),
        );
    });

    it('displays the request URL', async ({ interactionObject, actor }) => {
        const panel = await interactionObject(RestQueryPanel, './components/common/RestQueryPanel', {
            props: {
                restQuery: {
                    method: 'POST',
                    url: 'https://api.example.com/orders',
                    statusCode: 201,
                    requestHeaders: '',
                    requestBody: '{"item": "book"}',
                    responseHeaders: '',
                    responseBody: '',
                },
            },
        });

        await actor.attemptsTo(
            Ensure.that(panel.url(), equals('https://api.example.com/orders')),
        );
    });

    it('displays the response status code', async ({ interactionObject, actor }) => {
        const panel = await interactionObject(RestQueryPanel, './components/common/RestQueryPanel', {
            props: {
                restQuery: {
                    method: 'DELETE',
                    url: 'https://api.example.com/items/1',
                    statusCode: 404,
                    requestHeaders: '',
                    requestBody: '',
                    responseHeaders: '',
                    responseBody: 'Not Found',
                },
            },
        });

        await actor.attemptsTo(
            Ensure.that(panel.statusCode(), equals('404')),
        );
    });
});
