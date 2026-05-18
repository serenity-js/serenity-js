import { Serenity } from '@serenity-js/core';

import { JsonOutput } from '../io/JsonOutput.js';
import type { Command } from '../schema/CliApiSchema.js';
import { getActivityFactory } from './ActivityRegistry.js';
import { CliActors } from './CliActors.js';

/**
 * Creates a configured Serenity instance with CLI actors.
 *
 * @param projectRoot - The root directory of the project
 * @returns A configured Serenity instance
 */
export function createSerenityInstance(projectRoot: string): Serenity {
    const serenity = new Serenity();
    serenity.configure({
        actors: new CliActors(projectRoot),
    });
    return serenity;
}

/**
 * Executes a command and handles the result/error consistently.
 *
 * @param moduleName - The module name (e.g., 'cli')
 * @param commandName - The command name (e.g., 'check-installation')
 * @param command - The command definition from cli-api.json
 * @param args - The command arguments including pretty flag
 */
export async function executeCommand(
    moduleName: string,
    commandName: string,
    command: Command,
    args: { pretty?: boolean } & Record<string, unknown>,
): Promise<void> {
    const activityFactory = getActivityFactory(moduleName, command.activity);

    if (!activityFactory) {
        console.log(JsonOutput.format(
            JsonOutput.error(
                'ACTIVITY_NOT_FOUND',
                `Activity '${ command.activity }' not found for command '${ commandName }' in module '${ moduleName }'`,
                'Ensure the module is properly installed and the activity is registered',
            ),
            { pretty: args.pretty },
        ));
        process.exitCode = 1;
        return;
    }

    try {
        const serenity = createSerenityInstance(process.cwd());
        const actor = serenity.theActorCalled('CLI');

        // Extract command parameters (exclude yargs internal properties)
        const params: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(args)) {
            if (!['_', '$0', 'pretty', 'help', 'version', 'h', 'v'].includes(key)) {
                params[key] = value;
            }
        }

        const activity = activityFactory(params);
        const result = await actor.answer(activity);

        console.log(JsonOutput.format(JsonOutput.success(result), { pretty: args.pretty }));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        const errorCode = `${ commandName.toUpperCase().replace(/-/g, '_') }_ERROR`;

        console.log(JsonOutput.format(
            JsonOutput.error(errorCode, message, 'Check the error details and try again', stack),
            { pretty: args.pretty },
        ));

        process.exitCode = 1;
    }
}
