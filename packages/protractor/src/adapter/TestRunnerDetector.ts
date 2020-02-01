import { ModuleLoader } from '@serenity-js/core/lib/io';
import { Config } from 'protractor';

import { TestRunner } from './runners/TestRunner';

/**
 * @private
 */
export class TestRunnerDetector {

    static protractorCliOptions() {
        return [
            'cucumberOpts',         // todo: alias: cucumber ?
            'jasmineNodeOpts',      // todo: alias: jasmine ?
        ];
    }

    constructor(private readonly loader: ModuleLoader) {
    }

    // todo: when invoking, merge config
    //      Object.assign(
    //          {},
    //          config.cucumberOpts,
    //          config.capabilities.cucumberOpts
    //      )
    runnerFor(config: Config): TestRunner {

        // todo: simplify and introduce a config object with "as(String)", "as(Object)", etc. to avoid issues with undefined
        // todo: and config merge too, using on deepmerge

        const
            specifiesRunnerFor = (type: string) =>
                !!config.serenity &&
                !!config.serenity.runner &&
                config.serenity.runner === type;

        switch (true) {
            case specifiesRunnerFor('cucumber'):
                return this.useCucumber(config);
            case specifiesRunnerFor('jasmine'):
                return this.useJasmine(config);
            case !! config.cucumberOpts:
                return this.useCucumber(config);
            case !! config.jasmineNodeOpts:
            default:
                return this.useJasmine(config);
        }
    }

    private useCucumber(config: Config): TestRunner {
        const { CucumberTestRunner } = require('./runners/CucumberTestRunner');
        return new CucumberTestRunner(config.cucumberOpts || {}, this.loader);
    }

    private useJasmine(config: Config): TestRunner {
        const { JasmineTestRunner } = require('./runners/JasmineTestRunner');
        return new JasmineTestRunner(config.jasmineNodeOpts, this.loader);
    }
}
