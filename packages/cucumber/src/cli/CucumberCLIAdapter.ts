/* istanbul ignore file covered in integration tests */
import { FileSystem, ModuleLoader, Version } from '@serenity-js/core/lib/io';
import { CucumberConfig } from './CucumberConfig';
import { CucumberOptions } from './CucumberOptions';

/**
 * @private
 */
export class CucumberCLIAdapter {

    private readonly options: CucumberOptions;

    constructor(
        config: CucumberConfig,
        private readonly loader: ModuleLoader,
        private readonly fileSystem: FileSystem,
    ) {
        this.options = new CucumberOptions(config);
    }

    async run(pathsToScenarios: string[]): Promise<void> {
        const version = this.loader.hasAvailable('@cucumber/cucumber')
            ? this.loader.versionOf('@cucumber/cucumber')
            : this.loader.versionOf('cucumber');

        /*
         *  Cucumber.js allows max 1 formatter per output
         *      - https://github.com/cucumber/cucumber-js/blob/625fab034eea768bf74f7a46993a57182204ddf6/src/cli/index.ts#L83-L140
         *  and doesn't allow to write to \\.\NUL on Windows (equivalent of *nix /dev/null) because of the check in OptionSplitter
         *      - https://github.com/cucumber/cucumber-js/blob/625fab034eea768bf74f7a46993a57182204ddf6/src/cli/option_splitter.ts#L3
         *  so instead I create a dummy temp file, which is deleted when the test run is finished.
         */
        const dummyOutputFile  = this.fileSystem.tempFilePath('serenity-');
        const serenityListener = `${ this.loader.resolve('@serenity-js/cucumber') }:${ dummyOutputFile.value }`;

        return this.runScenarios(version, serenityListener, pathsToScenarios)
            .then(
                () => this.fileSystem.remove(dummyOutputFile),
                error => this.fileSystem.remove(dummyOutputFile).then(() => { throw error }, fileRemoveError => { throw error })
            );
    }

    private runScenarios(version: Version, serenityListener: string, pathsToScenarios): Promise<void> {
        const argv = this.options.asArgumentsForCucumber(version);

        if (version.isAtLeast(new Version('7.0.0'))) {
            return this.runWithCucumber7(argv, serenityListener, pathsToScenarios);
        }

        if (version.isAtLeast(new Version('2.0.0'))) {
            return this.runWithCucumber2to6(argv, serenityListener, pathsToScenarios);
        }

        return this.runWithCucumber0to1(argv, serenityListener, pathsToScenarios);
    }

    private runWithCucumber7(argv: string[], pathToSerenityListener: string, pathsToScenarios: string[]): Promise<void> {
        const cucumber = this.loader.require('@cucumber/cucumber');

        return new cucumber.Cli({
            argv:   argv.concat('--format', pathToSerenityListener, ...pathsToScenarios),
            cwd:    this.loader.cwd,
            stdout: process.stdout,
        }).run();
    }

    private runWithCucumber2to6(argv: string[], pathToSerenityListener: string, pathsToScenarios: string[]): Promise<void> {
        const cucumber = this.loader.require('cucumber');

        return new cucumber.Cli({
            argv:   argv.concat('--format', pathToSerenityListener, ...pathsToScenarios),
            cwd:    this.loader.cwd,
            stdout: process.stdout,
        }).run();
    }

    private runWithCucumber0to1(argv: string[], pathToSerenityListener: string, pathsToScenarios: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loader.require('cucumber')
                .Cli(argv.concat('--require', pathToSerenityListener, ...pathsToScenarios))
                .run((wasSuccessful: boolean) =>
                    wasSuccessful
                        ? resolve()
                        : reject(new Error('Cucumber test run has failed')),
                );
        })
    }
}
