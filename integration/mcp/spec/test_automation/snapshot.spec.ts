import { describe, expect, it } from '../../src/mcp-api.js';

describe('snapshot', () => {

    it('captures an aria snapshot of the website', async ({ client, testServerUrl }) => {
        void await client.callTool({
            name: 'serenity_web_navigate_to',
            arguments: {
                actorName: 'Alice',
                url: 'https://serenity-js.org',
            },
        });

        await client.callTool({
            name: 'serenity_inspection_snapshot',
            arguments: {
                actorName: 'Alice',
            },
        });

        // console.log(snapshotResponse)

        const elementResolverResponse = await client.callTool({
            name: 'serenity_inspection_page_element_resolver',
            arguments: {
                actorName: 'Alice',
                element: {
                    description: 'Get Started button on the Serenity/JS homepage',
                    reference: 'e54',   // "Start automating" button
                }
            },
        });

        expect(elementResolverResponse.structuredContent).toEqual({
            instructions: [
                'Use the provided Serenity/JS page element definition instead of the element reference from the snapshot.',
                'Use the pageElement as argument to interactions such as Click.on(), Enter.theValue().into(), etc.',
            ],
            result: {
                pageElement: {
                    imports: { '@serenity-js/web': [ 'By', 'PageElement' ] },
                    question: `PageElement.located(By.role('link', { name: 'Start automating 🚀' })).describedAs('Get Started button on the Serenity/JS homepage')`
                },
            }
        });
    });
});
