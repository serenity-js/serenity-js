import { describe, expect, it } from '../../src/mcp-api.js';

describe('expectations', () => {

    it('produces an expectation to include a substring', async ({ client, testServerUrl }) => {
        const response = await client.callTool({
            name: 'serenity_assertions_includes',
            arguments: {
                actorName: 'Alice',
                expected: {
                    imports: { '@serenity-js/web': [ 'Text', 'PageElement', 'By' ] },
                    question: `Text.of(PageElement.located(By.css('h1')).describedAs('header'))`,
                },
            },
        });

        expect(response.structuredContent).toEqual({
            result: {
                question: {
                    imports: {
                        '@serenity-js/assertions': [ 'includes' ],
                        '@serenity-js/web': [ 'By', 'PageElement', 'Text' ]
                    },
                    template: "includes(Text.of(PageElement.located(By.css('h1')).describedAs('header')))"
                },
            }
        });
    });
});
