import { Question } from '@serenity-js/core';

import { FetchRemoteResources } from '../abilities/FetchRemoteResources.js';

/**
 * The URL of the module-manager.json configuration file.
 *
 * @group Questions
 */
export const MODULE_MANAGER_URL = 'https://serenity-js.org/presets/v3/module-manager.json';

/**
 * Represents the structure of the module-manager.json configuration.
 *
 * @group Model
 */
export interface ModuleManagerJson {
    /** Node.js engine requirements */
    engines: {
        node: string;
    };
    /** Map of Serenity/JS package names to their latest versions */
    packages: Record<string, string>;
    /** Map of integration package names to their compatible version ranges */
    integrations: Record<string, string>;
    /**
     * Map of Serenity/JS module names to their relevant integration dependencies.
     * If not provided, a default mapping will be used.
     */
    moduleDependencies?: Record<string, string[]>;
    /** Caching configuration */
    caching?: {
        enabled: boolean;
        duration: number;
    };
    /** Sampling configuration */
    sampling?: {
        enabled: boolean;
        rate: number;
    };
    /** Last update timestamp */
    updatedAt?: string;
}

/**
 * A Question that fetches and returns the module-manager.json configuration
 * from the Serenity/JS website.
 *
 * The module-manager.json contains information about:
 * - Latest versions of all Serenity/JS packages
 * - Compatible versions of integration packages (Playwright, WebdriverIO, etc.)
 * - Node.js engine requirements
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { FetchRemoteResources, ModuleManagerConfig } from '@serenity-js/cli';
 *
 * const actor = actorCalled('Alice').whoCan(
 *     FetchRemoteResources.using()
 * );
 *
 * const config = await actor.answer(ModuleManagerConfig());
 * console.log(config.packages['@serenity-js/core']); // e.g., '3.42.0'
 * ```
 *
 * @group Questions
 */
export function ModuleManagerConfig(): Question<Promise<ModuleManagerJson>> {
    return Question.about('module manager configuration', async actor => {
        const resources = actor.abilityTo(FetchRemoteResources);
        return resources.fetch<ModuleManagerJson>(MODULE_MANAGER_URL);
    });
}
