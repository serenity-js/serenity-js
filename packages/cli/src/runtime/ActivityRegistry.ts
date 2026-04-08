import type { Answerable } from '@serenity-js/core';

import { CheckInstallation } from '../screenplay/activities/CheckInstallation.js';
import { CheckUpdates } from '../screenplay/activities/CheckUpdates.js';

/**
 * A factory function that creates an activity (Question) for a command.
 *
 * @group Runtime
 */
export type ActivityFactory = (params: Record<string, unknown>) => Answerable<unknown>;

/**
 * Registry of activity factories keyed by module and activity name.
 *
 * The registry maps activity names from cli-api.json to their implementations.
 * Each module has its own namespace to avoid naming conflicts.
 *
 * @group Runtime
 */
const activityRegistry: Record<string, Record<string, ActivityFactory>> = {
    cli: {
        CheckInstallation: () => CheckInstallation.forProject(),
        CheckUpdates: () => CheckUpdates.forProject(),
    },
};

/**
 * Retrieves an activity factory from the registry.
 *
 * @param moduleName - The module name (e.g., 'cli')
 * @param activityName - The activity name (e.g., 'CheckInstallation')
 * @returns The activity factory, or undefined if not found
 *
 * @group Runtime
 */
export function getActivityFactory(moduleName: string, activityName: string): ActivityFactory | undefined {
    return activityRegistry[moduleName]?.[activityName];
}

/**
 * Registers an activity factory for a module.
 *
 * This allows modules to register their activities dynamically.
 *
 * @param moduleName - The module name (e.g., 'cli')
 * @param activityName - The activity name (e.g., 'CheckInstallation')
 * @param factory - The activity factory function
 *
 * @group Runtime
 */
export function registerActivity(moduleName: string, activityName: string, factory: ActivityFactory): void {
    if (!activityRegistry[moduleName]) {
        activityRegistry[moduleName] = {};
    }
    activityRegistry[moduleName][activityName] = factory;
}
