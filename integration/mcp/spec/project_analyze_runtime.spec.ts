import path from 'node:path';

import { describe, expect, it } from '../src/mcp-api.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe('Project Analyze Runtime', () => {

    it('instructs the user to install a test runner first if none is found', async ({ client }) => {
        const rootDirectory = path.resolve(__dirname, '../examples/empty');
        const response = await client.callTool({
            name: 'serenity_project_analyze_runtime_environment',
            arguments: {
                rootDirectory,
            },
        });

        expect(response.isError).not.toBe(true);
    });

    it('analyzes the runtime of a node.js project to determine compatibility with Serenity/JS', async ({ client }) => {
        const response = await client.callTool({
            name: 'serenity_project_analyze_runtime_environment',
            arguments: {
                rootDirectory: path.resolve(__dirname, '../examples/playwright-test'),
            },
        });

        expect(response.isError).not.toBe(true);

        // expect(response.structuredContent['missingDependencies']).toEqual([
        //     `@serenity-js/assertions`,
        //     `@serenity-js/console-reporter`,
        //     `@serenity-js/core`,
        //     `@serenity-js/playwright`,
        //     `@serenity-js/playwright-test`,
        //     `@serenity-js/rest`,
        //     `@serenity-js/serenity-bdd`,
        //     `@serenity-js/web`,
        //     `npm-failsafe`,
        // ]);

        // expect(response.content[0].text).toEqual(`
        // `);
    });
});
