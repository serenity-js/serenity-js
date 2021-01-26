/* istanbul ignore file covered in integration tests */
import { ModuleLoader, Version } from '@serenity-js/core/lib/io';
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
    ) {
        this.options = new CucumberOptions(config);
    }

    async run(pathsToScenarios: string[]): Promise<void> {
        const version = this.loader.hasAvailable('@cucumber/cucumber')
            ? this.loader.versionOf('@cucumber/cucumber')
            : this.loader.versionOf('cucumber');

        const
            argv             = this.options.asArgumentsForCucumber(version),
            serenityListener = this.loader.resolve('@serenity-js/cucumber');

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
