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
                configure_package_json_scripts: 'Configure NPM scripts in package.json to include commands for running tests with Serenity/JS',
                create_example_test_file: 'Create an example test file demonstrating writing Serenity/JS test scenarios',
                run_test: 'Discover the commands to run Serenity/JS test scenarios',
            },
            inspection: {
                page_element_resolver: 'Define a selector identifying a page element based on its reference from the accessibility snapshot',
                snapshot: 'Capture an accessibility snapshot of the website to detect the elements of interest',
            },
            test_automation: {
                assertions: {
                    activities: {
                        ensure: {
                            that: 'Ensure.that($actual, $expectation) - Verify if the resolved value of the provided question meets the specified expectation',
                        },
                    },
                    questions: {
                        equals: 'equals($expected) - Check if the actual value of type T equals the expected value of the same type T',
                        includes: 'includes($expected) - Check if the actual string value includes the expected substring',
                    },
                },
                web: {
                    activities: {
                        click: {
                            on: 'Click.on($pageElement) - Click on a page element',
                        },
                        navigate: {
                            to: 'Navigate.to($url) - Navigate to a specific URL in the browser',
                            back: 'Navigate.back() - Navigate back in the browser history',
                            forward: 'Navigate.forward() - Navigate forward in the browser history',
                            reload_page: 'Navigate.reloadPage() - Reload the current page in the browser',
                        }
                    },
                    questions: {
                        page: {
                            current: {
                                name: 'Page.current().name() - A question that retrieves the name of the current page in the browser',
                                title: 'Page.current().title() - A question that retrieves the title of the current page in the browser',
                                url: {
                                    href: 'Page.current().url().href - A question that retrieves the URL of the current page in the browser.',
                                },
                            }
                        }
                    }
                }
            }
        });
    });
});
