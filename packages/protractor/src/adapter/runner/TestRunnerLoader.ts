import { ModuleLoader, TestRunnerAdapter } from '@serenity-js/core/lib/io';

/**
 * @desc
 *  Loads a {@link @serenity-js/core/lib/io~TestRunnerAdapter}, needed to invoke
 *  the chosen test runner programmatically.
 */
export class TestRunnerLoader {
    /**
     * @param {@serenity-js/core/lib/io~ModuleLoader} loader
     */
    constructor(private readonly loader: ModuleLoader) {
    }

    /**
     * @param {@serenity-js/cucumber/lib/cli~CucumberConfig} cucumberOpts
     * @param {@serenity-js/cucumber/lib/cli~CucumberFormatterOutput} output
     * @returns {@serenity-js/core/lib/io~TestRunnerAdapter}
     */
    forCucumber(cucumberOpts: object /* CucumberConfig */, output: object /* CucumberFormatterOutput */): TestRunnerAdapter {
        const { CucumberCLIAdapter } = this.loader.require('@serenity-js/cucumber/lib/cli');
        return new CucumberCLIAdapter(cucumberOpts, this.loader, output);
    }

    /**
     * @param {@serenity-js/jasmine/lib/adapter~JasmineConfig} jasmineNodeOpts
     * @returns {@serenity-js/core/lib/io~TestRunnerAdapter}
     */
    forJasmine(jasmineNodeOpts: object /* JasmineConfig */): TestRunnerAdapter {
        const { JasmineAdapter } = this.loader.require('@serenity-js/jasmine/lib/adapter')
        return new JasmineAdapter(jasmineNodeOpts, this.loader);
    }

    /**
     * @param {@serenity-js/mocha/lib/adapter~MochaConfig} mochaOpts
     * @returns {@serenity-js/core/lib/io~TestRunnerAdapter}
     */
    forMocha(mochaOpts: object /* MochaConfig */): TestRunnerAdapter {
        const { MochaAdapter } = this.loader.require('@serenity-js/mocha/lib/adapter')
        return new MochaAdapter(mochaOpts, this.loader);
    }
}
