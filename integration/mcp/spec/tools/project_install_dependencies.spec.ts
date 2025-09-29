import path from 'node:path';

import { ElicitRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { describe, expect, it } from '../../src/mcp-api.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe('Project Install Dependencies', () => {

    it('does not execute the command if the user aborted the execution', async ({ startClient }) => {
        const { client, stderr } = await startClient({
            args: [ '--experimental' ],
        });

        const rootDirectory = path.resolve(__dirname, '../../examples/playwright-test');

        client.setRequestHandler(ElicitRequestSchema, async (request) => {
            expect(request.params.message).toMatch('The project requires 10 development packages to be installed with npm. Would you like to proceed?')

            return {
                action: 'cancel',
            };
        });

        const response = await client.callTool({
            name: 'serenity_project_install_dependencies',
            arguments: {
                rootDirectory,
            },
        });

        expect(stderr()).toBe('');
        expect(response.isError).toBe(false);
        expect(response.structuredContent.instructions[0].target).toEqual('runtime');
        expect(response.structuredContent.instructions[0].type).toEqual('requestUserAction');
        expect(response.structuredContent.instructions[0].reason).toMatch(/Installation aborted. Install the missing packages using the provided command: .*?npm install --save-dev.*/);

        const versionPattern = '\\d+\\.\\d+\\.\\d+';

        const commandPattern = [
            '.*?npm.*?install --save-dev',
            `@serenity-js/assertions@${ versionPattern }`,
            `@serenity-js/console-reporter@${ versionPattern }`,
            `@serenity-js/core@${ versionPattern }`,
            `@serenity-js/playwright@${ versionPattern }`,
            `@serenity-js/playwright-test@${ versionPattern }`,
            `@serenity-js/rest@${ versionPattern }`,
            `@serenity-js/serenity-bdd@${ versionPattern }`,
            `@serenity-js/web@${ versionPattern }`,
            'npm-failsafe@latest',
            'rimraf@latest',
        ].join(' ')

        // if the user did not confirm, the command is not executed, but it is returned in the response
        expect(response.structuredContent.result.command).toMatch(new RegExp(commandPattern));
    });
});
