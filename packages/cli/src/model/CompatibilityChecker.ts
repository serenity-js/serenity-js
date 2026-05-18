import * as semver from 'semver';

import type { ModuleInfo } from '../screenplay/abilities/UseNodeModules.js';
import type { ModuleManagerJson } from '../screenplay/questions/ModuleManagerConfig.js';

/**
 * Represents a compatibility issue between installed packages.
 *
 * @group Model
 */
export interface CompatibilityIssue {
    /** The Serenity/JS module that has the compatibility issue */
    module: string;
    /** The dependency that is incompatible */
    dependency: string;
    /** The currently installed version of the dependency */
    installedVersion: string;
    /** The required version range for compatibility */
    requiredRange: string;
    /** A suggestion for how to fix the issue */
    suggestion: string;
}

/**
 * Represents the result of a compatibility check.
 *
 * @group Model
 */
export interface CompatibilityResult {
    /** The overall compatibility status */
    status: 'compatible' | 'incompatible' | 'unknown';
    /** List of compatibility issues found */
    issues: CompatibilityIssue[];
}

/**
 * Default mapping of Serenity/JS modules to their relevant integration dependencies.
 * Used as a fallback when the remote config doesn't provide moduleDependencies.
 */
const DEFAULT_MODULE_DEPENDENCY_MAP: Record<string, string[]> = {
    '@serenity-js/playwright': ['playwright', 'playwright-core', '@playwright/test'],
    '@serenity-js/playwright-test': ['playwright', 'playwright-core', '@playwright/test'],
    '@serenity-js/webdriverio': ['webdriverio', '@wdio/cli'],
    '@serenity-js/webdriverio-8': ['webdriverio', '@wdio/cli'],
    '@serenity-js/cucumber': ['@cucumber/cucumber', 'cucumber'],
    '@serenity-js/mocha': ['mocha'],
    '@serenity-js/jasmine': ['jasmine'],
    '@serenity-js/protractor': ['protractor'],
    '@serenity-js/rest': ['axios'],
    '@serenity-js/local-server': ['@hapi/hapi', 'express', 'koa', 'restify'],
};

/**
 * Gets the module dependency map from the config, falling back to the default if not provided.
 *
 * @param config - The module manager configuration
 * @returns The module dependency map
 */
function getModuleDependencyMap(config: ModuleManagerJson): Record<string, string[]> {
    return config.moduleDependencies ?? DEFAULT_MODULE_DEPENDENCY_MAP;
}

/**
 * Checks the compatibility of installed Serenity/JS modules with their dependencies.
 *
 * @param installedModules - List of installed Serenity/JS modules
 * @param installedDependencies - Map of installed dependency names to versions
 * @param config - The module-manager.json configuration
 * @returns The compatibility result with status and any issues found
 *
 * @group Model
 */
export function checkCompatibility(
    installedModules: ModuleInfo[],
    installedDependencies: Record<string, string>,
    config: ModuleManagerJson,
): CompatibilityResult {
    const issues: CompatibilityIssue[] = [];
    let hasCheckedAnyIntegration = false;
    const moduleDependencyMap = getModuleDependencyMap(config);

    for (const module of installedModules) {
        const relevantDependencies = moduleDependencyMap[module.name] || [];

        for (const dependency of relevantDependencies) {
            const installedVersion = installedDependencies[dependency];
            const requiredRange = config.integrations[dependency];

            // Skip if dependency is not installed or not in the config
            if (!installedVersion || !requiredRange) {
                continue;
            }

            hasCheckedAnyIntegration = true;

            // Check if the installed version satisfies the required range
            if (!semver.satisfies(installedVersion, requiredRange)) {
                issues.push({
                    module: module.name,
                    dependency,
                    installedVersion,
                    requiredRange,
                    suggestion: `Update ${ dependency } to a version matching ${ requiredRange }`,
                });
            }
        }
    }

    if (issues.length > 0) {
        return { status: 'incompatible', issues };
    }

    if (!hasCheckedAnyIntegration) {
        return { status: 'unknown', issues: [] };
    }

    return { status: 'compatible', issues: [] };
}
