import { Ensure, equals } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { RestQueryPanel } from '../../../src/serenity/common/RestQueryPanel.serenity.js';

describe('RestQueryPanel', () => {

    it('displays the HTTP method', async ({ story, actor }) => {
        const panel = story('components/common/RestQueryPanel/Default', {
            restQuery: {
                method: 'GET',
                url: 'https://api.example.com/users',
                statusCode: 200,
                requestHeaders: 'Accept: application/json',
                requestBody: '',
                responseHeaders: 'Content-Type: application/json',
                responseBody: '{"users": []}',
            },
        }).as(RestQueryPanel);

        await actor.attemptsTo(
            Ensure.that(panel.method(), equals('GET')),
        );
    });

    it('displays the request URL', async ({ story, actor }) => {
        const panel = story('components/common/RestQueryPanel/Default', {
            restQuery: {
                method: 'POST',
                url: 'https://api.example.com/orders',
                statusCode: 201,
                requestHeaders: '',
                requestBody: '{"item": "book"}',
                responseHeaders: '',
                responseBody: '',
            },
        }).as(RestQueryPanel);

        await actor.attemptsTo(
            Ensure.that(panel.url(), equals('https://api.example.com/orders')),
        );
    });

    it('displays the response status code', async ({ story, actor }) => {
        const panel = story('components/common/RestQueryPanel/Default', {
            restQuery: {
                method: 'DELETE',
                url: 'https://api.example.com/items/1',
                statusCode: 404,
                requestHeaders: '',
                requestBody: '',
                responseHeaders: '',
                responseBody: 'Not Found',
            },
        }).as(RestQueryPanel);

        await actor.attemptsTo(
            Ensure.that(panel.statusCode(), equals('404')),
        );
    });
});
