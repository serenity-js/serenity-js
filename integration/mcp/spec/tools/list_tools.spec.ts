import path from 'node:path';

import { describe, expect, it } from '../../src/mcp-api.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe('List tools', () => {

    it('lists the available tools', async ({ startClient }) => {
        const { client, stderr } = await startClient({
            args: ['--experimental'],
        });

        const response = await client.listTools();

        expect(response.isError).not.toBe(true);
        expect(stderr()).toBe('')

        const toolNames = response.tools.map(tool => ({ name: tool.name, description: tool.description }));

        expect(toolNames).toEqual([
            { name: 'serenity_project_analyze', description: [
                'Analyze a Node.js project in the specified root directory to assess compatibility with Serenity/JS.',
                'Check for any runtime issues, explain their root causes, and provide recommended fixes.'
            ].join(' ') },
        ]);
    });
});
