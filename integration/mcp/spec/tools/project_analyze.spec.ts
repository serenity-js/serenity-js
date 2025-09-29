import path from 'node:path';

import { describe, expect, it } from '../../src/mcp-api.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe('Project Analyze', () => {

    describe('analyzes the project runtime to assess compatibility with Serenity/JS and recommend next steps', () => {

        it('complains if the root directory is not accessible', async ({ startClient }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = path.resolve(__dirname, '../../examples/invalid-path');

            const response = await client.callTool({
                name: 'serenity_project_analyze',
                arguments: {
                    rootDirectory,
                },
            });

            expect(response.isError).toBe(true);
            expect(stderr()).toBe('');

            expect(response.structuredContent.error.message).toMatch(/The path .*? is not a directory or cannot be accessed/)
            expect(response.content[0].text).toMatch(/Error: The path .*? is not a directory or cannot be accessed/)
        });

        it('advises the user to install a test framework if none could be found', async ({ startClient }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = path.resolve(__dirname, '../../examples/empty');

            const response = await client.callTool({
                name: 'serenity_project_analyze',
                arguments: {
                    rootDirectory,
                },
            });

            expect(response.isError).toBe(true);
            expect(response.structuredContent.instructions).toEqual([ {
                'reason': 'Could not determine the test runner used in this project. Supported test runners are Cucumber, Jasmine, Mocha, Playwright Test, Protractor and WebdriverIO. Please install one of these test runners and try again.',
                'target': 'runtime',
                'type': 'requestUserAction'
            } ]);

            expect(stderr()).toBe('');
        });

        it('detects available command line tools', async ({ startClient }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = path.resolve(__dirname, '../../examples/playwright-test');

            const response = await client.callTool({
                name: 'serenity_project_analyze',
                arguments: {
                    rootDirectory,
                },
            });

            expect(response.isError).not.toBe(true);

            expect(response.structuredContent.result.testRunner).toEqual('playwright-test');
            expect(response.structuredContent.result.git.status).toEqual('compatible');
            expect(response.structuredContent.result.java.status).toEqual('compatible');
            expect(response.structuredContent.result.node.status).toEqual('compatible');
            expect(response.structuredContent.result.packageManager.status).toEqual('compatible');

            expect(stderr()).toBe('');
        });

        it('detects available Node modules and suggests Serenity/JS integrations', async ({ startClient }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = path.resolve(__dirname, '../../examples/playwright-test');

            const response = await client.callTool({
                name: 'serenity_project_analyze',
                arguments: {
                    rootDirectory,
                },
            });

            const compatiblePackages = response.structuredContent.result.packages.filter(({ status }) => status === 'compatible').map(({ name }) => name);
            const missingPackages = response.structuredContent.result.packages.filter(({ status }) => status === 'missing').map(({ name }) => name);
            const testRunner = response.structuredContent.result.testRunner;

            expect(compatiblePackages).toEqual([
                '@playwright/test',
            ]);

            expect(missingPackages).toEqual([
                '@serenity-js/assertions',
                '@serenity-js/console-reporter',
                '@serenity-js/core',
                '@serenity-js/playwright',
                '@serenity-js/playwright-test',
                '@serenity-js/rest',
                '@serenity-js/serenity-bdd',
                '@serenity-js/web',
                'npm-failsafe',
                'rimraf',
            ]);

            expect(testRunner).toEqual('playwright-test')

            const callToolInstructions = response.structuredContent.instructions.filter(instruction => instruction.type === 'callTool');

            expect(callToolInstructions).toHaveLength(1);
            expect(callToolInstructions[0].target).toEqual('serenity_project_install_dependencies');
            expect(callToolInstructions[0].reason).toMatch(/Install the following packages before proceeding:/);

            expect(response.content[0].text).toEqual(JSON.stringify(response.structuredContent, undefined, 0));

            expect(response.content[1].text).toMatch(/# Project analysis result: dependency-issues/);
            expect(response.content[2].text).toMatch(/Instruction 1: Call tool serenity_project_install_dependencies\n\nInstall the following packages before proceeding:/);
            expect(response.content[3].text).toMatch(/Instruction 2: Update policy rule\n\nYou are acting as a coding assistant within a JavaScript\/TypeScript project/);
            expect(response.content[4].text).toMatch(/Instruction 3: Update policy rule\n\nThis project uses Git installed at/);

            expect(response.isError).not.toBe(true);
            expect(stderr()).toBe('');
        });

    });
});
