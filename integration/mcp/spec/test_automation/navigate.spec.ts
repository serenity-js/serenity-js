import { describe, expect, it } from '../../src/mcp-api.js';

describe('Navigate', () => {

    describe('to', () => {

        it('navigates to a url', async ({ client, testServerUrl }) => {
            const response = await client.callTool({
                name: 'serenity_web_navigate_to',
                arguments: {
                    actorName: 'Alice',
                    url: testServerUrl,
                },
            });

            expect(response.structuredContent).toEqual({
                dependencies: [
                    '@serenity-js/web'
                ],
                imports: {
                    '@serenity-js/web': [
                        'Navigate'
                    ]
                },
                actorName: 'Alice',
                activities: [
                    `Navigate.to('${ testServerUrl }')`
                ]
            });

            // expect(response.content[0].text).toEqual(trimmed`
            //     | # Serenity/JS Code for serenity_web_navigate_to
            //     | \`\`\`ts
            //     | await actorCalled('Alice').attemptsTo(
            //     |     Navigate.to(https://serenity-js.org),
            //     | );
            //     | \`\`\`
            //     |
            //     | ## Required dependencies
            //     | - \`@serenity-js/web\`
            //     |
            //     | ## Required imports
            //     | \`\`\`ts
            //     | import { Navigate } from '@serenity-js/web';
            //     | \`\`\`
            //     |`
            // );
        });
    });

    describe('back', () => {
        it('navigates back in the browser history', async ({ client }) => {
            const response = await client.callTool({
                name: 'serenity_web_navigate_back',
                arguments: {
                    actorName: 'Alice',
                },
            });

            expect(response.structuredContent).toEqual({
                dependencies: [
                    '@serenity-js/web'
                ],
                imports: {
                    '@serenity-js/web': [
                        'Navigate'
                    ]
                },
                actorName: 'Alice',
                activities: [
                    `Navigate.back()`
                ]
            });

            // expect(response.content[0].text).toEqual(trimmed`
            //     | # Serenity/JS Code for serenity_web_navigate_back
            //     | \`\`\`ts
            //     | await actorCalled('Alice').attemptsTo(
            //     |     Navigate.back(),
            //     | );
            //     | \`\`\`
            //     |
            //     | ## Required dependencies
            //     | - \`@serenity-js/web\`
            //     |
            //     | ## Required imports
            //     | \`\`\`ts
            //     | import { Navigate } from '@serenity-js/web';
            //     | \`\`\`
            //     |`
            // );
        });
    });

    describe('forward', () => {
        it('navigates forward in the browser history', async ({ client }) => {
            const response = await client.callTool({
                name: 'serenity_web_navigate_forward',
                arguments: {
                    actorName: 'Alice',
                },
            });

            expect(response.structuredContent).toEqual({
                dependencies: [
                    '@serenity-js/web'
                ],
                imports: {
                    '@serenity-js/web': [
                        'Navigate'
                    ]
                },
                actorName: 'Alice',
                activities: [
                    `Navigate.forward()`
                ]
            });

            // expect(response.content[0].text).toEqual(trimmed`
            //     | # Serenity/JS Code for serenity_web_navigate_forward
            //     | \`\`\`ts
            //     | await actorCalled('Alice').attemptsTo(
            //     |     Navigate.forward(),
            //     | );
            //     | \`\`\`
            //     |
            //     | ## Required dependencies
            //     | - \`@serenity-js/web\`
            //     |
            //     | ## Required imports
            //     | \`\`\`ts
            //     | import { Navigate } from '@serenity-js/web';
            //     | \`\`\`
            //     |`
            // );
        });
    });

    describe('reloadPage', () => {
        it('reloads the current page', async ({ client }) => {
            const response = await client.callTool({
                name: 'serenity_web_navigate_reload_page',
                arguments: {
                    actorName: 'Alice',
                },
            });

            expect(response.structuredContent).toEqual({
                dependencies: [
                    '@serenity-js/web'
                ],
                imports: {
                    '@serenity-js/web': [
                        'Navigate'
                    ]
                },
                actorName: 'Alice',
                activities: [
                    `Navigate.reloadPage()`
                ]
            });

            // expect(response.content[0].text).toEqual(trimmed`
            //     | # Serenity/JS Code for serenity_web_navigate_reload_page
            //     | \`\`\`ts
            //     | await actorCalled('Alice').attemptsTo(
            //     |     Navigate.reloadPage(),
            //     | );
            //     | \`\`\`
            //     |
            //     | ## Required dependencies
            //     | - \`@serenity-js/web\`
            //     |
            //     | ## Required imports
            //     | \`\`\`ts
            //     | import { Navigate } from '@serenity-js/web';
            //     | \`\`\`
            //     |`
            // );
        });
    });
});
