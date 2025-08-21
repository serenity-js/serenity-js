import { describe, expect, it } from '../src/mcp-api.js';

describe('List Capabilities', () => {

    it('lists Serenity/JS test automation capabilities', async ({ client }) => {
        const response = await client.callTool({
            name: 'serenity_list_capabilities',
            arguments: {},
        });

        expect(response.structuredContent).toEqual({
            'test_automation': {
                'web': {
                    'activities': {
                        'navigate': {
                            'to': 'Navigate.to($url) - Navigate to a specific URL in the browser',
                            'back': 'Navigate.back() - Navigate back in the browser history',
                            'forward': 'Navigate.forward() - Navigate forward in the browser history',
                            'reload_page': 'Navigate.reloadPage() - Reload the current page in the browser',
                        }
                    }
                }
            }
        });
    });
});
