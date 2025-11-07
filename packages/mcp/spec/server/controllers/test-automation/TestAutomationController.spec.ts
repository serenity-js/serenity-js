import http from 'node:http'
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from '@integration/testing-tools';
import { ModuleLoader } from '@serenity-js/core/lib/io/index.js';
import { afterEach, beforeEach, describe, it } from 'mocha';

import { ScreenplayExecutionContext } from '../../../../src/server/context/index.js';
import { PlaywrightBrowserConnection } from '../../../../src/server/integration/PlaywrightBrowserConnection.js';
import { createTestAutomationController } from '../examples.js';

async function startServer(port = 3123): Promise<{ url: string; close: () => Promise<void> }> {
    const server = http.createServer((request, response) => {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('200 OK\n');
    });

    const result = {
        url: `http://localhost:${port}/`,
        close: () => new Promise<void>((resolve, reject) => {
            server.close((error) => {
                return error
                    ? reject(error)
                    : resolve();
            });
        }),
    }

    return new Promise((resolve, reject) => {
        server.listen(port, () => resolve(result));
    });
}

describe('ScreenplayActivityController', () => {

    let executionContext: ScreenplayExecutionContext;
    let server: { url: string; close: () => Promise<void> };

    beforeEach(async () => {
        const browserConnection = new PlaywrightBrowserConnection({
            browserName: 'chromium',
            launchOptions: {
                headless: true,
            }
        });

        // Get the full path of the current file
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const moduleLoader = new ModuleLoader(__dirname);

        executionContext = new ScreenplayExecutionContext(browserConnection, moduleLoader);

        server = await startServer();
    });

    afterEach(async () => {
        await executionContext?.close();
        await server?.close();
    });

    describe('execute', () => {

        describe('structured content', () => {

            it('substitutes tokens in the template with static parameters', async () => {

                const controller = createTestAutomationController();

                const parameters = {
                    actorName: 'Alice',
                    url: server.url,
                };

                const result = await controller.execute(executionContext, parameters);

                expect(result.structuredContent).to.deep.equal({
                    result: {
                        activity: {
                            imports: { '@serenity-js/web': [ 'Navigate' ] },
                            template: `Navigate.to('${ server.url }')`
                        }
                    },
                });
            });

            it('substitutes tokens in the template with questions', async () => {

                const controller = createTestAutomationController();

                const parameters = {
                    actorName: 'Alice',
                    url: {
                        imports: {
                            '@serenity-js/core': [ 'Question', 'the' ],
                            '@serenity-js/assertions': [ 'includes' ],
                            '@serenity-js/web': [ 'Page' ],
                        },
                        question: 'Question.about(the`URL of the page`, actor => `' + server.url +  '`)',
                    },
                };

                const result = await controller.execute(executionContext, parameters);

                expect(result.structuredContent).to.deep.equal({
                    result: {
                        activity: {
                            imports: {
                                '@serenity-js/assertions': [ 'includes' ],
                                '@serenity-js/core': [ 'Question', 'the' ],
                                '@serenity-js/web': [ 'Navigate', 'Page' ],
                            },
                            template: 'Navigate.to(Question.about(the`URL of the page`, actor => `' + server.url + '`))'
                        }
                    },
                });
            });
        });

        describe('performing the activity', () => {

            it('dynamically compiles the template and performs the activity', async () => {

                const controller = createTestAutomationController();

                const parameters = {
                    actorName: 'Alice',
                    url: server.url,
                };

                const result = await controller.execute(executionContext, parameters);

                expect(result.structuredContent).to.deep.equal({
                    result: {
                        activity: {
                            imports: {
                                '@serenity-js/web': [ 'Navigate' ]
                            },
                            template: `Navigate.to('${ server.url }')`
                        },
                    },
                });
            });
        });
    });

    describe('capabilitiesDescriptor', () => {

        it('describes the capability provided by the controller and its path in the capability map', async () => {
            const controller = createTestAutomationController();

            const descriptor = controller.capabilityDescriptor();

            expect(descriptor).to.deep.equal({
                description: `Navigate.to($url) - Navigate to a specific URL in the browser`,
                path: [
                    `test_automation`,
                    `web`,
                    `activities`,
                    `navigate`,
                    `to`,
                ],
            });
        })
    });
});
