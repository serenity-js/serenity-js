import { describe, expect, it } from '../../src/mcp-api.js';

describe('Project Install Dependencies', () => {

    describe('dry run mode', () => {

        it('shows the command that will be executed and explains the next steps', async ({ startClient, example }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = await example('playwright-test');

            const response = await client.callTool({
                name: 'serenity_project_install_dependencies',
                arguments: {
                    rootDirectory,
                    dryRun: true,
                },
            });

            expect(stderr()).toBe('');
            expect(response.isError).toBe(false);

            expect(response.structuredContent.instructions[0]).toEqual({
                target: 'serenity_project_install_dependencies',
                type: 'callTool',
                reason: `To run the proposed command, call the serenity_project_install_dependencies tool again with dryRun: false`
            });

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

            expect(response.structuredContent.result.command).toMatch(new RegExp(commandPattern));
        });
    });
});
