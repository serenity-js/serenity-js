// eslint-disable-next-line @typescript-eslint/no-var-requires
const Module = require('module'); // No type definitions available
import * as path from 'path';   // eslint-disable-line unicorn/import-style

import { Version } from './Version';

/**
 * @desc
 *  Dynamically loads Node modules located relative to `cwd`.
 */
export class ModuleLoader {

    /**
     * @param {string} cwd
     *  Current working directory, relative to which Node modules should be resolved.
     */
    constructor(public readonly cwd: string) {
    }

    /**
     * @desc
     *  Returns true if a given module is available to be required, false otherwise.
     *
     * @param {string} moduleId
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
     * @desc
     *  Works like `require.resolve`, but relative to specified current working directory
     *
     * @param {string} moduleId
     *  NPM module id, for example `cucumber` or `@serenity-js/core`
     *
     * @returns {string}
     *  Path a given Node module
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
     * @desc
     *  Works like `require`, but relative to specified current working directory
     *
     * @param {string} moduleId
     *
     * @returns {any}
     */
    require(moduleId: string): any {
        try {
            return require(this.resolve(moduleId));
        }
        catch {
            return require(moduleId);
        }
    }

    /**
     * @desc
     *  Returns {@link Version} of module specified by `moduleId`, based on its `package.json`.
     *
     * @param {string} moduleId
     * @returns {Version}
     */
    versionOf(moduleId: string): Version {
        return new Version(this.require(`${ moduleId }/package.json`).version);
    }
}
