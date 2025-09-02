import { describe, expect, it } from '../src/mcp-api.js';

describe('List Capabilities', () => {

    it('lists Serenity/JS test automation capabilities', async ({ client }) => {
        const response = await client.callTool({
            name: 'serenity_list_capabilities',
            arguments: {},
        });

        expect(response.structuredContent).toEqual({
            project: {
                analyze_runtime_environment: `Analyze a Node.js project in the specified root directory to determine compatibility with Serenity/JS. Detect available command line tools. Check for any runtime issues, explains their causes, and provides recommended fixes.`,
                analyze_dependencies: `List the Node.js packages used by the project in the specified root directory to determine compatibility with Serenity/JS. Check for compatibility issues and recommend any missing packages that should be installed.`,
                configure_playwright_test: 'Configure Playwright Test for use with Serenity/JS',
            },
            test_automation: {
                web: {
                    activities: {
                        navigate: {
                            to: 'Navigate.to($url) - Navigate to a specific URL in the browser',
                            back: 'Navigate.back() - Navigate back in the browser history',
                            forward: 'Navigate.forward() - Navigate forward in the browser history',
                            reload_page: 'Navigate.reloadPage() - Reload the current page in the browser',
                        }
                    }
                }
            }
        });
    });
});
