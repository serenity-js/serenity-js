import type { Argv, Options } from 'yargs';

import type { DiscoveredCliApi } from './CliApiDiscovery.js';
import { executeCommand } from './CommandExecutor.js';

/**
 * Registers commands from a discovered CLI API.
 *
 * @param cli - The yargs instance
 * @param discoveredApi - The discovered CLI API definition
 */
export function registerModuleCommands(cli: Argv, discoveredApi: DiscoveredCliApi): void {
    const { api } = discoveredApi;

    cli.command(api.module, `${ api.module } module commands`, (yargsInstance: Argv) => {
        for (const [commandName, command] of Object.entries(api.commands)) {
            // Build yargs options from command parameters
            const options: Record<string, Options> = {};

            if (command.parameters) {
                for (const [parameterName, parameter] of Object.entries(command.parameters)) {
                    const option: Options = {
                        describe: parameter.description,
                        demandOption: parameter.required ?? false,
                        default: parameter.default,
                    };

                    // Map parameter types to yargs types
                    switch (parameter.type) {
                        case 'string':
                            option.type = 'string';
                            break;
                        case 'number':
                            option.type = 'number';
                            break;
                        case 'boolean':
                            option.type = 'boolean';
                            break;
                        case 'enum':
                            option.type = 'string';
                            option.choices = parameter.values;
                            break;
                        case 'array':
                            option.type = 'array';
                            break;
                    }

                    options[parameterName] = option;
                }
            }

            yargsInstance.command(
                commandName,
                command.description,
                options,
                async (args: { pretty?: boolean } & Record<string, unknown>) => {
                    await executeCommand(api.module, commandName, command, args);
                },
            );
        }

        return yargsInstance.demandCommand(1, 'Please specify a command');
    });
}
