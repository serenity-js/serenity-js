import { ModuleLoader } from '@serenity-js/core/lib/io';
import reporter = require('../index');
import { JasmineConfig } from './JasmineConfig';

/**
 * @desc
 *  Allows for programmatic execution of Jasmine test scenarios,
 *  using {@link SerenityReporterForJasmine} to report progress.
 */
export class JasmineAdapter {

    constructor(
        private readonly config: JasmineConfig,
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
                JasmineRunner   = this.loader.require('jasmine'),
                runner          = new JasmineRunner({           // instantiating the JasmineRunner has a side-effect...
                    projectBaseDir: '',
                }),
                jasmine         = (global as any).jasmine;      // ... of registering a global jasmine instance

            if (this.config.defaultTimeoutInterval) {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = this.config.defaultTimeoutInterval;
            }

            runner.clearReporters();

            // tslint:disable-next-line:prefer-object-spread
            runner.loadConfig(Object.assign(
                {
                    /*
                     * Default to not executing tests at random.
                     * See https://github.com/angular/protractor/blob/4f74a4ec753c97adfe955fe468a39286a0a55837/lib/frameworks/jasmine.js#L76
                     */
                    random: false,
                },
                this.config,
            ));

            runner.addReporter(reporter(jasmine));

            runner.onComplete((passed: boolean) => resolve());

            runner.configureDefaultReporter(this.config);

            runner.execute(pathsToScenarios, this.config.grep);
        });
    }
}
