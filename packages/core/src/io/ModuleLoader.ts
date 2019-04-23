const Module = require('module');             // tslint:disable-line:no-var-requires     No type definitions available
import * as path from 'path';
import { Version } from './Version';

export class ModuleLoader {
    constructor(public readonly cwd: string) {
    }

    /**
     * @package
     *
     * @param moduleId
     *  NPM module id, for example 'cucumber' or '@serenity-js/core'
     */
    resolve(moduleId: string): string {
        const fromFile = path.join(this.cwd, 'noop.js');

        return Module._resolveFilename(moduleId, {
            id: fromFile,
            filename: fromFile,
            paths: Module._nodeModulePaths(this.cwd),
        });
    }

    require(moduleId: string): any {
        try {
            return require(this.resolve(moduleId));
        }
        catch (e) {
            return require(moduleId);
        }
    }

    versionOf(moduleId: string): Version {
        return new Version(this.require(`${ moduleId }/package`).version);
    }
}
