import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { Question } from '@serenity-js/core';

import { checkCompatibility } from '../../model/CompatibilityChecker.js';
import type { InstallationReport } from '../../model/InstallationReport.js';
import { UseNodeModules } from '../abilities/UseNodeModules.js';
import { InstalledSerenityModules } from '../questions/InstalledSerenityModules.js';
import { ModuleManagerConfig } from '../questions/ModuleManagerConfig.js';
import { isNodeVersionSupported, NodeVersion, SUPPORTED_NODE_RANGE } from '../questions/NodeVersion.js';

/**
 * Error thrown when the module manager configuration cannot be fetched.
 *
 * @group Errors
 */
export class NetworkRequiredError extends Error {
    constructor(cause?: Error) {
        super(
            'Internet connection is required to check compatibility with the latest Serenity/JS requirements. ' +
            'Please ensure you have network access and try again.'
        );
        this.name = 'NetworkRequiredError';
        this.cause = cause;
    }
}

/**
 * A Task that checks the Serenity/JS installation and returns an {@link InstallationReport}.
 *
 * This task:
 * - Checks the Node.js version and whether it's supported
 * - Lists all installed Serenity/JS modules
 * - Checks compatibility with integration dependencies (Playwright, WebdriverIO, etc.)
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { UseNodeModules, FetchRemoteResources, CheckInstallation } from '@serenity-js/cli';
 *
 * const actor = actorCalled('Alice').whoCan(
 *     UseNodeModules.at(process.cwd()),
 *     FetchRemoteResources.using(),
 * );
 *
 * const report = await CheckInstallation.forProject().answeredBy(actor);
 * console.log(report.nodeVersion.supported); // true or false
 * console.log(report.modules.length); // number of installed modules
 * console.log(report.compatibility.status); // 'compatible', 'incompatible', or 'unknown'
 * ```
 *
 * @group Tasks
 */
export class CheckInstallation extends Question<Promise<InstallationReport>> {

    /**
     * Creates a new CheckInstallation task for the current project.
     */
    static forProject(): CheckInstallation {
        return new CheckInstallation();
    }

    private constructor() {
        super('check installation');
    }

    /**
     * Performs the installation check and returns the report.
     *
     * @param actor - The actor performing the check
     * @returns A promise that resolves to the installation report
     * @throws {NetworkRequiredError} When the module manager configuration cannot be fetched
     */
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<InstallationReport> {
        // Get Node.js version
        const nodeVersionString = await actor.answer(NodeVersion());
        const nodeSupported = isNodeVersionSupported(nodeVersionString);

        // Get installed Serenity/JS modules
        const modules = await actor.answer(InstalledSerenityModules());

        // Get module manager config (requires network)
        let config;
        try {
            config = await actor.answer(ModuleManagerConfig());
        }
        catch (error) {
            throw new NetworkRequiredError(error instanceof Error ? error : undefined);
        }

        // Get installed dependencies for compatibility checking
        const nodeModules = actor.abilityTo(UseNodeModules);
        const installedDependencies: Record<string, string> = {};

        // Check for common integration dependencies
        const dependenciesToCheck = [
            'playwright',
            'playwright-core',
            '@playwright/test',
            'webdriverio',
            '@wdio/cli',
            '@cucumber/cucumber',
            'cucumber',
            'mocha',
            'jasmine',
            'protractor',
            'axios',
            '@hapi/hapi',
            'express',
            'koa',
            'restify',
        ];

        for (const dep of dependenciesToCheck) {
            try {
                const pkg = await nodeModules.readPackageJson(dep);
                installedDependencies[dep] = pkg.version;
            }
            catch {
                // Dependency not installed, skip
            }
        }

        // Check compatibility
        const compatibility = checkCompatibility(modules, installedDependencies, config);

        return {
            nodeVersion: {
                current: nodeVersionString,
                supported: nodeSupported,
                requiredRange: SUPPORTED_NODE_RANGE,
            },
            modules,
            compatibility,
        };
    }
}
