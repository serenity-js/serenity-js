/* istanbul ignore file */

import { ModuleLoader } from '@serenity-js/core/lib/io';
import { MochaConfig } from './MochaConfig';

/**
 * @desc
 *  Allows for programmatic execution of Mocha test scenarios,
 *  using {@link SerenityReporterForMocha} to report progress.
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
}
