import { ModuleLoader } from '@serenity-js/core/lib/io';
import { Config } from 'protractor';

import { TestRunner } from './runners/TestRunner';

export class TestRunnerDetector {

    static protractorCliOptions() {
        return [ 'cucumberOpts' ];
    }

    constructor(private readonly loader: ModuleLoader) {
    }

    // todo: when invoking:
    //      Object.assign(
    //          {},
    //          config.cucumberOpts,
    //          config.capabilities.cucumberOpts
    //      )
    runnerFor(config: Config): TestRunner {

        const { CucumberTestRunner } = require('./runners/CucumberTestRunner');
        return new CucumberTestRunner(config.cucumberOpts, this.loader);
    }
}
