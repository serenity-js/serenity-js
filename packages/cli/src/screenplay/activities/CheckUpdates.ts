import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import * as semver from 'semver';

import type { ModuleUpdate, UpdateReport } from '../../model/UpdateReport.js';
import { InstalledSerenityModules } from '../questions/InstalledSerenityModules.js';
import type { ModuleManagerJson } from '../questions/ModuleManagerConfig.js';
import { ModuleManagerConfig } from '../questions/ModuleManagerConfig.js';
import type { PackageManager } from '../questions/PackageManagerType.js';
import { PackageManagerType } from '../questions/PackageManagerType.js';

/**
 * Returns a default module-manager.json configuration for use when the network is unavailable.
 *
 * @returns Default module manager configuration
 */
function getDefaultModuleManagerConfig(): ModuleManagerJson {
    return {
        engines: {
            node: '^20 || ^22 || ^24',
        },
        packages: {},
        integrations: {},
    };
}

/**
 * Generates the update command for the detected package manager.
 *
 * @param packageManager - The detected package manager
 * @param updates - The list of modules to update
 * @returns The update command string
 */
function generateUpdateCommand(packageManager: PackageManager, updates: ModuleUpdate[]): string {
    const packages = updates.map(u => `${ u.name }@${ u.latestVersion }`).join(' ');

    switch (packageManager) {
        case 'yarn':
            return `yarn add ${ packages }`;
        case 'pnpm':
            return `pnpm add ${ packages }`;
        case 'npm':
        default:
            return `npm install ${ packages }`;
    }
}

/**
 * A Task that checks for available updates to Serenity/JS modules.
 *
 * This task:
 * - Lists all installed Serenity/JS modules
 * - Compares installed versions with latest versions from module-manager.json
 * - Detects the package manager used in the project
 * - Generates an update command if updates are available
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { UseNodeModules, FetchRemoteResources, CheckUpdates } from '@serenity-js/cli';
 *
 * const actor = actorCalled('Alice').whoCan(
 *     UseNodeModules.at(process.cwd()),
 *     FetchRemoteResources.using(),
 * );
 *
 * const report = await CheckUpdates.forProject().answeredBy(actor);
 * console.log(report.upToDate); // true or false
 * console.log(report.updates); // array of outdated modules
 * console.log(report.updateCommand); // command to run to update
 * ```
 *
 * @group Tasks
 */
export class CheckUpdates extends Question<Promise<UpdateReport>> {

    /**
     * Creates a new CheckUpdates task for the current project.
     */
    static forProject(): CheckUpdates {
        return new CheckUpdates();
    }

    private constructor() {
        super('check updates');
    }

    /**
     * Performs the update check and returns the report.
     *
     * @param actor - The actor performing the check
     * @returns A promise that resolves to the update report
     */
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<UpdateReport> {
        // Get installed Serenity/JS modules
        const modules = await actor.answer(InstalledSerenityModules());

        // Get module manager config (with fallback for network failures)
        let config: ModuleManagerJson;
        try {
            config = await actor.answer(ModuleManagerConfig());
        }
        catch {
            config = getDefaultModuleManagerConfig();
        }

        // Get package manager type
        const packageManager = await actor.answer(PackageManagerType());

        // Compare versions and find updates
        const updates: ModuleUpdate[] = [];

        for (const module of modules) {
            const latestVersion = config.packages[module.name];

            if (latestVersion && semver.gt(latestVersion, module.version)) {
                updates.push({
                    name: module.name,
                    currentVersion: module.version,
                    latestVersion,
                });
            }
        }

        // Generate update command if there are updates
        const updateCommand = updates.length > 0
            ? generateUpdateCommand(packageManager, updates)
            : null;

        return {
            upToDate: updates.length === 0,
            updates,
            updateCommand,
        };
    }
}
