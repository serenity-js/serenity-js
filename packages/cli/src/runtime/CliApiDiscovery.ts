import * as fs from 'node:fs';
import * as path from 'node:path';

import type { CliApi } from '../schema/CliApiSchema.js';
import { CliApiSchema } from '../schema/CliApiSchema.js';

/**
 * Information about a discovered CLI API from a Serenity/JS module.
 *
 * @group Runtime
 */
export interface DiscoveredCliApi {
    /** The module name (e.g., '@serenity-js/cli') */
    moduleName: string;
    /** The parsed and validated CLI API definition */
    api: CliApi;
}

/**
 * Options for CLI API discovery.
 *
 * @group Runtime
 */
export interface DiscoverCliApisOptions {
    /** The root directory of the project to scan for installed modules */
    projectRoot: string;
    /** Optional path to the CLI module's own directory (for discovering its own cli-api.json) */
    cliModuleDirectory?: string;
}

/**
 * Attempts to load and parse a cli-api.json file from the given path.
 *
 * @param cliApiPath - Path to the cli-api.json file
 * @param moduleName - The module name to use in the result
 * @returns The discovered CLI API or undefined if not found/invalid
 */
function loadCliApi(cliApiPath: string, moduleName: string): DiscoveredCliApi | undefined {
    try {
        const content = fs.readFileSync(cliApiPath, 'utf-8');
        const parsed = JSON.parse(content);
        const result = CliApiSchema.safeParse(parsed);

        if (result.success) {
            return {
                moduleName,
                api: result.data,
            };
        }
    }
    catch {
        // Skip invalid or missing cli-api.json
    }
    return undefined;
}

/**
 * Discovers CLI API definitions from installed `@serenity-js/*` packages.
 *
 * Scans the node_modules/@serenity-js directory for packages that contain
 * a valid cli-api.json file and returns the parsed definitions.
 *
 * If `cliModuleDirectory` is provided, also discovers the CLI module's own
 * cli-api.json, ensuring the CLI's built-in commands are always available.
 *
 * @param options - Discovery options
 * @returns Array of discovered CLI API definitions
 *
 * @group Runtime
 */
export function discoverCliApis(options: DiscoverCliApisOptions): DiscoveredCliApi[] {
    const { projectRoot, cliModuleDirectory } = options;
    const serenityDirectory = path.join(projectRoot, 'node_modules', '@serenity-js');
    const discoveredApis: DiscoveredCliApi[] = [];
    const discoveredModules = new Set<string>();

    // First, discover the CLI module's own cli-api.json if provided
    if (cliModuleDirectory) {
        const cliApiPath = path.join(cliModuleDirectory, 'cli-api.json');
        const api = loadCliApi(cliApiPath, '@serenity-js/cli');
        if (api) {
            discoveredApis.push(api);
            discoveredModules.add('@serenity-js/cli');
        }
    }

    // Then scan node_modules/@serenity-js for other modules
    try {
        fs.accessSync(serenityDirectory);
    }
    catch {
        return discoveredApis;
    }

    const entries = fs.readdirSync(serenityDirectory, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const moduleName = `@serenity-js/${ entry.name }`;

            // Skip if already discovered (e.g., CLI module)
            if (discoveredModules.has(moduleName)) {
                continue;
            }

            const cliApiPath = path.join(serenityDirectory, entry.name, 'cli-api.json');
            const api = loadCliApi(cliApiPath, moduleName);
            if (api) {
                discoveredApis.push(api);
                discoveredModules.add(moduleName);
            }
        }
    }

    return discoveredApis;
}
