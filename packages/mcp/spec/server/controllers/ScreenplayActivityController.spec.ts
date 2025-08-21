import http from 'node:http'
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from '@integration/testing-tools';
import { ModuleLoader } from '@serenity-js/core/lib/io/index.js';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { z } from 'zod';

import { ScreenplayExecutionContext, ScreenplaySchematics } from '../../../src/server/context/index.js';
import { ScreenplayActivityController } from '../../../src/server/controllers/index.js';
import { PlaywrightBrowserConnection } from '../../../src/server/integration/PlaywrightBrowserConnection.js';
import { answerableParameterSchema } from '../../../src/server/schema.js';

function createController(): ScreenplayActivityController {
    const navigateSchematics = new ScreenplaySchematics({
        namespace: 'serenity',
        moduleName: 'web',
        imports: {
            '@serenity-js/web': [ 'Navigate' ],
        },
    });

    const navigateToSchematic = navigateSchematics.create({
        description: 'Navigate to a specific URL in the browser',
        template: 'Navigate.to($url)',
        type: 'Activity',
        inputSchema: z.object({
            actorName: z.string().describe('The name of the actor performing the activity'),
            url: answerableParameterSchema(z.string().describe('The URL to navigate to')),
        }),
    });

    return new ScreenplayActivityController(
        navigateToSchematic,
    );
}

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

    describe('handling a request', () => {

        describe('structured content', () => {

            it('substitutes tokens in the template with static parameters', async () => {

                const controller = createController();

                const parameters = {
                    actorName: 'Alice',
                    url: server.url,
                };

                const response = await controller.execute(executionContext, parameters);

                expect(response.structuredContent).to.deep.equal({
                    dependencies: [ '@serenity-js/web' ],
                    imports: { '@serenity-js/web': [ 'Navigate' ] },
                    actorName: 'Alice',
                    activities: [
                        `Navigate.to('${ server.url }')`
                    ]
                });
            });

            it('substitutes tokens in the template with questions', async () => {

                const controller = createController();

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

                const response = await controller.execute(executionContext, parameters);

                expect(response.structuredContent).to.deep.equal({
                    dependencies: [
                        '@serenity-js/assertions',
                        '@serenity-js/core',
                        '@serenity-js/web',
                    ],
                    imports: {
                        '@serenity-js/assertions': [ 'includes' ],
                        '@serenity-js/core': [ 'Question', 'the' ],
                        '@serenity-js/web': [ 'Navigate', 'Page' ],
                    },
                    actorName: 'Alice',
                    activities: [
                        'Navigate.to(Question.about(the`URL of the page`, actor => `' + server.url +  '`))'
                    ]
                });
            });
        });

        describe('performing the activity', () => {

            it('dynamically compiles the template and performs the activity', async () => {

                const controller = createController();

                const parameters = {
                    actorName: 'Alice',
                    url: server.url,
                };

                const response = await controller.execute(executionContext, parameters);

                expect(response.structuredContent).to.deep.equal({
                    dependencies: [ '@serenity-js/web' ],
                    imports: {
                        '@serenity-js/web': [ 'Navigate' ]
                    },
                    actorName: 'Alice',
                    activities: [
                        `Navigate.to('${ server.url }')`,
                    ]
                });
            });
        });
    });
});
