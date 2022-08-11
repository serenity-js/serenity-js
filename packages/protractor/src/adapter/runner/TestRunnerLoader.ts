/* eslint-disable unicorn/prevent-abbreviations,@typescript-eslint/ban-types */
import { TestRunnerAdapter } from '@serenity-js/core/lib/adapter';
import { Config, FileFinder, FileSystem, ModuleLoader, Path } from '@serenity-js/core/lib/io';
import { CucumberConfig } from '@serenity-js/cucumber/lib/adapter';

import { CucumberAdapterConfig } from './CucumberAdapterConfig';

/**
 * Loads a {@apilink TestRunnerAdapter} needed to invoke
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
     *  dependencies, like [`@serenity-js/cucumber`](/api/cucumber),
     *  [`@serenity-js/mocha`](/api/mocha),
     *  [`@serenity-js/jasmine`](/api/jasmine), etc.
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
     * See {@apilink JasmineConfig}
     *
     * @param jasmineNodeOpts
     */
    forJasmine(jasmineNodeOpts: object /* JasmineConfig */): TestRunnerAdapter {
        const { JasmineAdapter } = this.moduleLoader.require('@serenity-js/jasmine/lib/adapter')
        return new JasmineAdapter(jasmineNodeOpts, this.moduleLoader);
    }

    /**
     * See {@apilink MochaConfig}
     *
     * @param mochaOpts
     */
    forMocha(mochaOpts: object /* MochaConfig */): TestRunnerAdapter {
        const { MochaAdapter } = this.moduleLoader.require('@serenity-js/mocha/lib/adapter')
        return new MochaAdapter(mochaOpts, this.moduleLoader);
    }

    /**
     * See {@apilink CucumberConfig}
     *
     * @param cucumberOpts
     * @param adapterConfig
     */
    forCucumber(cucumberOpts: object /* CucumberConfig */, adapterConfig: CucumberAdapterConfig): TestRunnerAdapter {
        const { CucumberCLIAdapter, CucumberFormat, StandardOutput, TempFileOutput } = this.moduleLoader.require('@serenity-js/cucumber/lib/adapter');

        const config = new Config<CucumberConfig>(cucumberOpts)
            .where('require', requires =>
                this.finder.filesMatching(requires).map(p => p.value)
            )
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
