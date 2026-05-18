/**
 * Represents information about a module that has an available update.
 *
 * @group Model
 */
export interface ModuleUpdate {
    /** The module name (e.g., '@serenity-js/core') */
    name: string;
    /** The currently installed version */
    currentVersion: string;
    /** The latest available version */
    latestVersion: string;
}

/**
 * Represents the result of checking for updates to Serenity/JS modules.
 *
 * @group Model
 */
export interface UpdateReport {
    /** Whether all modules are up to date */
    upToDate: boolean;
    /** List of modules that have available updates */
    updates: ModuleUpdate[];
    /** The command to run to update all outdated modules, or null if all are up to date */
    updateCommand: string | null;
}
