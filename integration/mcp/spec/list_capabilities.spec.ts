import { describe, expect, it } from '../src/mcp-api.js';

describe('List Capabilities', () => {

    it('lists Serenity/JS capabilities', async ({ client }) => {
        const response = await client.callTool({
            name: 'serenity_list_capabilities',
            arguments: {},
        });

        expect(response.structuredContent).toEqual({
            'web': {
                'activities': {
                    'navigate': {
                        'to': 'Navigate.to(url) - Navigate to a specific URL',
                        'back': 'Navigate.back() - Navigate back in the browser history',
                        'forward': 'Navigate.forward() - Navigate forward in the browser history',
                        'reloadPage': 'Navigate.reloadPage() - Reload the current page'
                    }
                }
            }
        });
    });
});
