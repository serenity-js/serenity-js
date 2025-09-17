import path from 'node:path';

import { describe, expect, it, StartClientOptions, test } from '../../src/mcp-api.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe('Project Analyze', () => {

    it('analyzes the project runtime to assess compatibility with Serenity/JS and recommend next steps', async ({ startClient }) => {
        const { client, stderr } = await startClient({
            args: ['--experimental'],
        });

        const rootDirectory = path.resolve(__dirname, '../../examples/empty');

        const tools = await client.listTools();
        // const response = await client.callTool({
        //     name: 'serenity_project_analyze',
        //     arguments: {
        //         rootDirectory,
        //     },
        // });
        //
        // expect(response.isError).not.toBe(true);
    });
});
