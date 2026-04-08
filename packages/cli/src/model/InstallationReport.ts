import type { ModuleInfo } from '../screenplay/abilities/UseNodeModules.js';
import type { CompatibilityResult } from './CompatibilityChecker.js';

/**
 * Information about the Node.js version.
 *
 * @group Model
 */
export interface NodeVersionInfo {
    /** The current Node.js version (e.g., 'v22.11.0') */
    current: string;
    /** Whether the current version is supported by Serenity/JS */
    supported: boolean;
    /** The required Node.js version range */
    requiredRange: string;
}

/**
 * The installation report returned by the check-installation command.
 *
 * Contains information about:
 * - Node.js version and whether it's supported
 * - Installed Serenity/JS modules with their versions
 * - Compatibility status with integration dependencies
 *
 * @group Model
 */
export interface InstallationReport {
    /** Information about the Node.js version */
    nodeVersion: NodeVersionInfo;
    /** List of installed Serenity/JS modules */
    modules: ModuleInfo[];
    /** Compatibility check result */
    compatibility: CompatibilityResult;
}
