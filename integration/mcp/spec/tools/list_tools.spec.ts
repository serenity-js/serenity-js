import { describe, expect, it } from '../../src/mcp-api.js';

describe('List tools', () => {

    it('lists the available tools', async ({ startClient }) => {
        const { client, stderr } = await startClient({
            args: ['--experimental'],
        });

        const response = await client.listTools();

        const toolNames = response.tools.map(tool => ({ name: tool.name, description: tool.description }));

        expect(toolNames).toEqual([
            { name: 'serenity_project_analyze', description: [
                'Analyze a Node.js project in the specified root directory to assess compatibility with Serenity/JS.',
                'Check for any runtime issues, explain their root causes, and provide recommended fixes.'
            ].join(' ') },
            { name: 'serenity_project_install_dependencies', description: [
                'Install any missing and update any incompatible Node.js packages in the project located in the specified root directory.'
            ].join(' ') },
        ]);

        expect(response.isError).not.toBe(true);
        expect(stderr()).toBe('')
    });
});
