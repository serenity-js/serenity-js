/* eslint-disable unicorn/prevent-abbreviations,@typescript-eslint/ban-types */
import { Config, FileFinder, FileSystem, ModuleLoader, Path, TestRunnerAdapter } from '@serenity-js/core/lib/io';
import { CucumberConfig } from '@serenity-js/cucumber/lib/cli';
import { CucumberAdapterConfig } from './CucumberAdapterConfig';

/**
 * @desc
 *  Loads a {@link @serenity-js/core/lib/io~TestRunnerAdapter}, needed to invoke
 *  the chosen test runner programmatically.
 *
 * @public
 */
export class TestRunnerLoader {

    private readonly moduleLoader: ModuleLoader;
    private readonly fileSystem: FileSystem;
    private readonly finder: FileFinder;

    /**
     * @param {@serenity-js/core/lib/io~Path} cwd
     *  Current working directory; used to resolve glob paths to files for Cucumber.js to `require`,
     *  and instructing Serenity/JS where to look for this module's optional
     *  dependencies, like [`@serenity-js/cucumber`](/modules/cucumber),
     *  [`@serenity-js/mocha`](/modules/mocha),
     *  [`@serenity-js/jasmine`](/modules/jasmine), etc.
     *
     * @param {number | string} runnerId
     *  Unique identifier used to differentiate output files produced by native Cucumber.js formatters.
     *  For example, `process.pid`
     */
    constructor(cwd: Path, private readonly runnerId: number | string) {
        this.moduleLoader   = new ModuleLoader(cwd.value);
        this.fileSystem     = new FileSystem(cwd);
        this.finder         = new FileFinder(cwd);
    }

    /**
     * @param {@serenity-js/jasmine/lib/adapter~JasmineConfig} jasmineNodeOpts
     * @returns {@serenity-js/core/lib/io~TestRunnerAdapter}
     */
    forJasmine(jasmineNodeOpts: object /* JasmineConfig */): TestRunnerAdapter {
        const { JasmineAdapter } = this.moduleLoader.require('@serenity-js/jasmine/lib/adapter')
        return new JasmineAdapter(jasmineNodeOpts, this.moduleLoader);
    }

    /**
     * @param {@serenity-js/mocha/lib/adapter~MochaConfig} mochaOpts
     * @returns {@serenity-js/core/lib/io~TestRunnerAdapter}
     */
    forMocha(mochaOpts: object /* MochaConfig */): TestRunnerAdapter {
        const { MochaAdapter } = this.moduleLoader.require('@serenity-js/mocha/lib/adapter')
        return new MochaAdapter(mochaOpts, this.moduleLoader);
    }

    /**
     *
     * @param {@serenity-js/cucumber/lib/cli~CucumberConfig} cucumberOpts
     * @param {CucumberAdapterConfig} adapterConfig
     * @returns {@serenity-js/core/lib/io~TestRunnerAdapter}
     */
    forCucumber(cucumberOpts: object /* CucumberConfig */, adapterConfig: CucumberAdapterConfig): TestRunnerAdapter {
        const { CucumberCLIAdapter, CucumberFormat, StandardOutput, TempFileOutput } = this.moduleLoader.require('@serenity-js/cucumber/lib/cli');

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

        return new CucumberCLIAdapter(config.object(), this.moduleLoader, output);
    }
}
