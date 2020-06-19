/* istanbul ignore file */

import * as fs from 'fs';
import * as path from 'path';
import { ModuleLoader } from '@serenity-js/core/lib/io';
import { MochaConfig } from './MochaConfig';

/**
 * @desc
 *  Allows for programmatic execution of Mocha test scenarios,
 *  using {@link SerenityReporterForMocha} to report progress.
 *
 * @package
 */
export class MochaAdapter {

    constructor(
        private readonly config: MochaConfig,
        private readonly loader: ModuleLoader,
    ) {
    }

    /**
     * @param {string[]} pathsToScenarios
     * @returns {Promise<void>}
     */
    run(pathsToScenarios: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.requireAny(this.config.require);

            const
                Mocha   = this.loader.require('mocha'),
                mocha   = new Mocha({
                    ...this.config,
                    reporter: require.resolve('../index'),
                });

            mocha.files = pathsToScenarios;

            mocha.loadFilesAsync()
                .then(() =>
                    mocha.run(numberOfFailures => resolve())
                );
        });
    }

    private requireAny(filesOrModules: string | string[]) {
        const requires = !! filesOrModules
            ? [].concat(filesOrModules).filter(item => !! item)
            : [];

        requires.forEach(fileOrModule => {
            const required = fs.existsSync(fileOrModule) || fs.existsSync(`${ fileOrModule }.js`)
                ? path.resolve(fileOrModule)    // local file
                : fileOrModule;                 // module

            require(required);
        });
    }
}
