/* eslint-disable unicorn/prevent-abbreviations */
import type { TestRunnerAdapter } from '@serenity-js/core/lib/adapter';
import { Config, FileFinder, FileSystem, ModuleLoader, Path } from '@serenity-js/core/lib/io';
import type { CucumberConfig } from '@serenity-js/cucumber/lib/adapter';

import type { CucumberAdapterConfig } from './CucumberAdapterConfig';

/**
 * Loads a [`TestRunnerAdapter`](https://serenity-js.org/api/core-adapter/interface/TestRunnerAdapter/) needed to invoke
 * the chosen test runner programmatically.
 *
 * @group Integration
 */
export class TestRunnerLoader {

    private readonly moduleLoader: ModuleLoader;
    private readonly fileSystem: FileSystem;
    private readonly finder: FileFinder;

    /**
     * @param cwd
     *  Current working directory; used to resolve glob paths to files for Cucumber.js to `require`,
     *  and instructing Serenity/JS where to look for this module's optional
     *  dependencies, like [`@serenity-js/cucumber`](https://serenity-js.org/api/cucumber),
     *  [`@serenity-js/mocha`](https://serenity-js.org/api/mocha),
     *  [`@serenity-js/jasmine`](https://serenity-js.org/api/jasmine), etc.
     *
     * @param runnerId
     *  Unique identifier used to differentiate output files produced by native Cucumber.js formatters.
     *  For example, `process.pid`
     */
    constructor(cwd: Path, private readonly runnerId: number | string) {
        this.moduleLoader   = new ModuleLoader(cwd.value);
        this.fileSystem     = new FileSystem(cwd);
        this.finder         = new FileFinder(cwd);
    }

    /**
     * See [`JasmineConfig`](https://serenity-js.org/api/jasmine-adapter/interface/JasmineConfig/)
     *
     * @param jasmineNodeOpts
     */
    forJasmine(jasmineNodeOpts: object /* JasmineConfig */): TestRunnerAdapter {
        const { JasmineAdapter } = this.moduleLoader.require('@serenity-js/jasmine/adapter')
        return new JasmineAdapter(jasmineNodeOpts, this.moduleLoader);
    }

    /**
     * See [`MochaConfig`](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/)
     *
     * @param mochaOpts
     */
    forMocha(mochaOpts: object /* MochaConfig */): TestRunnerAdapter {
        const { MochaAdapter } = this.moduleLoader.require('@serenity-js/mocha/lib/adapter')
        return new MochaAdapter(mochaOpts, this.moduleLoader);
    }

    /**
     * See [`CucumberConfig`](https://serenity-js.org/api/cucumber-adapter/interface/CucumberConfig/)
     *
     * @param cucumberOpts
     * @param adapterConfig
     */
    forCucumber(cucumberOpts: object /* CucumberConfig */, adapterConfig: CucumberAdapterConfig): TestRunnerAdapter {
        const { CucumberCLIAdapter, CucumberFormat, StandardOutput, TempFileOutput } = this.moduleLoader.require('@serenity-js/cucumber/lib/adapter');

        const config = new Config<CucumberConfig>(cucumberOpts)
            .whereIf(adapterConfig.uniqueFormatterOutputs, 'format', values =>
                [].concat(values).map(value => {
                    const format = new CucumberFormat(value);

                    if (format.output === '') {
                        return format.value;
                    }

                    const basename = Path.from(format.output).basename();
                    const filenameParts = basename.split('.');

                    if (filenameParts[0] === basename) {
                        return `${ format.formatter }:${ format.output }.${ this.runnerId }`;
                    }

                    filenameParts.splice(-1, 0, `${ this.runnerId }`);

                    return `${ format.formatter }:${ format.output.replace(basename, filenameParts.join('.')) }`;
                })
            );

        const output = adapterConfig.useStandardOutput
            ? new StandardOutput()
            : new TempFileOutput(this.fileSystem);

        return new CucumberCLIAdapter(config.object(), this.moduleLoader, this.fileSystem, output);
    }
}
