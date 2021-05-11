/* istanbul ignore file */
import { ModuleLoader, TestRunnerAdapter } from '@serenity-js/core/lib/io';
import { ExecutionIgnored, Outcome } from '@serenity-js/core/lib/model';
import * as fs from 'fs';
import * as path from 'path';   // eslint-disable-line unicorn/import-style

import { MochaConfig } from './MochaConfig';

/**
 * @desc
 *  Allows for programmatic execution of Mocha test scenarios,
 *  using {@link SerenityReporterForMocha} to report progress.
 *
 * @implements {@serenity-js/core/lib/io~TestRunnerAdapter}
 */
export class MochaAdapter implements TestRunnerAdapter {

    /**
     * @desc
     *  test
     * @param {MochaConfig} config
     * @param {@serenity-js/core/lib/io~ModuleLoader} loader
     */
    constructor(
        private readonly config: MochaConfig,
        private readonly loader: ModuleLoader,
    ) {
    }

    /**
     * @desc
     *  Scenario success threshold for this test runner.
     *
     * @returns {Outcome | { Code: number }}
     */
    successThreshold(): Outcome | { Code: number } {
        return ExecutionIgnored;
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
        const requires = filesOrModules
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
