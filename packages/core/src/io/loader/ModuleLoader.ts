import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { Version } from '../Version.js';

// Get the Module object for internal resolution APIs
const bootstrapRequire = createRequire(pathToFileURL(path.join(process.cwd(), 'package.json')).href);
const Module = bootstrapRequire('module'); // No type definitions available

/**
 * Creates a require function for the given directory.
 * Uses createRequire to create a require function anchored to the specified cwd.
 */
function createRequireForCwd(cwd: string): NodeRequire {
    const contextFile = path.join(cwd, 'noop.js');
    return createRequire(pathToFileURL(contextFile).href);
}

/**
 * Dynamically loads Node modules located relative to `cwd`.
 */
export class ModuleLoader {

    private readonly requireFn: NodeRequire;

    /**
     * @param {string} cwd
     *  Current working directory, relative to which Node modules should be resolved.
     * @param useRequireCache
     *  Whether to use Node's `require.cache`. Defaults to `true`.
     *  Set to `false` to force Node to reload required modules on every call.
     */
    constructor(
        public readonly cwd: string,
        public readonly useRequireCache: boolean = true,
    ) {
        // Create a require function anchored to the cwd
        this.requireFn = createRequireForCwd(cwd);
    }

    /**
     * Returns `true` if a given module is available to be required, false otherwise.
     *
     * @param moduleId
     *  NPM module id, for example 'cucumber' or '@serenity-js/core'
     */
    hasAvailable(moduleId: string): boolean {
        try {
            return !! this.require(moduleId);
        } catch {
            return false;
        }
    }

    /**
     * Works like `require.resolve`, but relative to specified current working directory
     *
     * @param moduleId
     *  NPM module id, for example `cucumber` or `@serenity-js/core`
     *
     * @returns
     *  Path to a given Node.js module
     */
    resolve(moduleId: string): string {
        const fromFile = path.join(this.cwd, 'noop.js');

        return Module._resolveFilename(moduleId, {
            id: fromFile,
            filename: fromFile,
            paths: Module._nodeModulePaths(this.cwd),
        });
    }

    /**
     * Works like `require`, but relative to specified current working directory
     *
     * @param moduleId
     */
    require(moduleId: string): any {
        try {
            return this.requireFn(this.cachedIfNeeded(this.resolve(moduleId)));
        }
        catch {
            return this.requireFn(this.cachedIfNeeded(moduleId));
        }
    }

    private cachedIfNeeded(moduleId: string): string {
        if (! this.useRequireCache) {
            delete this.requireFn.cache[moduleId];
        }

        return moduleId;
    }

    /**
     * Returns `Version` of module specified by `moduleId`, based on its `package.json`.
     *
     * @param moduleId
     */
    versionOf(moduleId: string): Version {
        return new Version(this.require(`${ moduleId }/package.json`).version);
    }
}
