import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createRequire } from 'module';

import { Version } from '../Version';

/**
 * Dynamically loads Node modules located relative to `cwd`.
 */
export class ModuleLoader {

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
    }

    /**
     * Returns `true` if a given module is available to be required, false otherwise.
     *
     * @param moduleId
     *  NPM module id, for example 'cucumber' or '@serenity-js/core'
     */
    hasAvailable(moduleId: string): boolean {
        try {
            void this.require(moduleId);
            return true;
        }
        catch (error) {
            return error?.code === 'ERR_REQUIRE_ESM';
        }
    }

    /**
     * Works like `require.resolve`, but relative to specified current working directory
     *
     * @param moduleId
     *  NPM module id, for example `cucumber` or `@serenity-js/core`
     *
     * @param cwd
     *  Current working directory, relative to which Node modules should be resolved.
     *  Overrides the `cwd` value provided to the constructor.
     *
     * @returns
     *  Path to a given Node.js module
     */
    resolve(moduleId: string, cwd: string = this.cwd): string {
        const fromFile = path.join(cwd, 'noop.js');

        const relativeRequire = createRequire(fromFile);

        try {
            return relativeRequire.resolve(moduleId);
        }
        catch {
            // Fallback for ESM modules, which don't support `require.resolve`
            if (this.isPathToModule(moduleId)) {
                return path.resolve(cwd, moduleId.replaceAll('/', path.sep));
            }

            return moduleId;
        }
    }

    async load(moduleId: string): Promise<any> {
        try {
            return this.require(moduleId);
        }
        catch (error) {
            if (error.code === 'ERR_REQUIRE_ESM') {
                return this.import(moduleId);
            }

            throw error;
        }
    }

    async import(moduleId: string): Promise<any> {
        const moduleIdOrUrl = this.isPathToModule(moduleId)
            ? pathToFileURL(this.resolve(moduleId)).href
            : moduleId;

        return await import(moduleIdOrUrl);
    }

    private isPathToModule(moduleId: string): boolean {
        return ['./', '../', '/'].some(prefix => moduleId.startsWith(prefix));
    }
    /**
     * Works like `require`, but relative to specified current working directory
     *
     * @param moduleId
     */
    require(moduleId: string): any {
        try {
            return require(this.cachedIfNeeded(this.resolve(moduleId)));
        }
        catch (error) {
            if (error.code === 'ERR_REQUIRE_ESM') {
                throw error;
            }

            return require(this.cachedIfNeeded(moduleId));
        }
    }

    private cachedIfNeeded(moduleId: string): string {
        if (! this.useRequireCache) {
            delete require.cache[moduleId];
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
