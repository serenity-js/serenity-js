import * as fs from 'node:fs';
import * as path from 'node:path';

import type { Argv } from 'yargs';
import yargs from 'yargs';

import type { DiscoveredCliApi } from './runtime/CliApiDiscovery.js';
import { discoverCliApis } from './runtime/CliApiDiscovery.js';
import { registerModuleCommands } from './runtime/CommandRegistrar.js';

/**
 * Allows for the sjs command line interface output to be intercepted for testing purposes.
 *
 * @package
 */
export type Interceptor = (error: Error | undefined, argv: Record<string, unknown>, output: string) => void;

/**
 * Options for bootstrapping the CLI.
 *
 * @package
 */
export interface BootstrapOptions {
    /** Command line arguments */
    argv: string[];
    /** Directory containing the CLI module (for discovering cli-api.json) */
    cliModuleDirectory: string;
    /** Optional interceptor for testing */
    interceptor?: Interceptor;
}

/**
 * Reads package.json from the CLI module directory.
 */
function readPackageJson(cliModuleDirectory: string): { version: string; author: { name: string; email: string } } {
    const packageJsonPath = path.join(cliModuleDirectory, 'package.json');
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
}

/**
 * Generates example commands from discovered CLI APIs.
 *
 * @param cli - The yargs instance
 * @param discoveredApis - Array of discovered CLI API definitions
 */
function registerExamples(cli: Argv, discoveredApis: DiscoveredCliApi[]): void {
    for (const { api } of discoveredApis) {
        for (const [commandName, command] of Object.entries(api.commands)) {
            cli.example(`$0 ${ api.module } ${ commandName }`, command.description);
        }
    }

    // Always add the generic help example
    cli.example('$0 <module> --help', 'shows the available commands for a module');
}

/**
 * Invokes the sjs command line interface, responsible for providing
 * installation verification, update checking, and dynamic command routing
 * based on installed Serenity/JS modules.
 *
 * @param options - Bootstrap options including argv, cliModuleDirectory, and optional interceptor
 */
export function bootstrap(options: BootstrapOptions): void {
    const { argv, cliModuleDirectory, interceptor } = options;
    const projectRoot = process.cwd();
    const pkg = readPackageJson(cliModuleDirectory);

    // Discover CLI APIs from installed @serenity-js/* modules
    const discoveredApis = discoverCliApis({ projectRoot, cliModuleDirectory });

    const cli = yargs()
        .version(pkg.version)
        .usage('Usage: $0 <module> <command> [options]')
        .epilog(`copyright (C) 2016-${ new Date().getFullYear() } ${ pkg.author.name } <${ pkg.author.email }>`)
        .option('pretty', {
            type: 'boolean',
            default: false,
            describe: 'Pretty-print JSON output',
        })
        .alias('h', 'help')
        .help();

    // Register examples from discovered CLI APIs
    registerExamples(cli, discoveredApis);

    // Register commands from all discovered CLI APIs
    for (const discoveredApi of discoveredApis) {
        registerModuleCommands(cli, discoveredApi);
    }

    cli.demandCommand(1, 'Please specify a module')
        .strict()
        .parse(argv, {}, interceptor);
}
