/* istanbul ignore file covered in integration tests */
import { ModuleLoader, TestRunnerAdapter, Version } from '@serenity-js/core/lib/io';
import { CucumberConfig } from './CucumberConfig';
import { CucumberOptions } from './CucumberOptions';
import { CucumberFormatterOutput, OutputDescriptor } from './output';

/**
 * @desc
 *  Allows for programmatic execution of Cucumber test scenarios.
 *
 * @implements {@serenity-js/core/lib/io~TestRunnerAdapter}
 */
export class CucumberCLIAdapter implements TestRunnerAdapter {

    private readonly options: CucumberOptions;

    /**
     * @param {CucumberConfig} config
     * @param {@serenity-js/core/lib/io~ModuleLoader} loader
     * @param {CucumberFormatterOutput} output
     */
    constructor(
        config: CucumberConfig,
        private readonly loader: ModuleLoader,
        private readonly output: CucumberFormatterOutput,
    ) {
        this.options = new CucumberOptions(config);
    }

    /**
     * @desc
     *  Instructs Cucumber to execute feature files located at `pathsToScenarios`
     *
     * @param {string[]} pathsToScenarios
     *  Absolute or relative paths to feature files
     *
     * @returns {Promise<void>}
     */
    async run(pathsToScenarios: string[]): Promise<void> {
        const version = this.loader.hasAvailable('@cucumber/cucumber')
            ? this.loader.versionOf('@cucumber/cucumber')
            : this.loader.versionOf('cucumber');

        const serenityListener = this.loader.resolve('@serenity-js/cucumber');

        return this.runScenarios(version, serenityListener, pathsToScenarios);
    }

    private runScenarios(version: Version, serenityListener: string, pathsToScenarios: string[]): Promise<void> {
        const argv = this.options.asArgumentsForCucumber(version);

        if (version.isAtLeast(new Version('7.0.0'))) {
            return this.runWithCucumber7(argv, serenityListener, pathsToScenarios);
        }

        if (version.isAtLeast(new Version('3.0.0'))) {
            return this.runWithCucumber3to6(argv, serenityListener, pathsToScenarios);
        }

        if (version.isAtLeast(new Version('2.0.0'))) {
            return this.runWithCucumber2(argv, serenityListener, pathsToScenarios);
        }

        return this.runWithCucumber0to1(argv, serenityListener, pathsToScenarios);
    }

    private runWithCucumber7(argv: string[], pathToSerenityListener: string, pathsToScenarios: string[]): Promise<void> {
        const cucumber  = this.loader.require('@cucumber/cucumber');
        const output    = this.output.get();

        return new cucumber.Cli({
            argv:   argv.concat('--format', `${ pathToSerenityListener }:${ output.value() }`, ...pathsToScenarios),
            cwd:    this.loader.cwd,
            stdout: process.stdout,
        })
        .run()
        .then(cleanUpAndPassThrough(output), cleanUpAndReThrow(output));
    }

    private runWithCucumber3to6(argv: string[], pathToSerenityListener: string, pathsToScenarios: string[]): Promise<void> {
        const cucumber  = this.loader.require('cucumber');
        const output    = this.output.get();

        return new cucumber.Cli({
            argv:   argv.concat('--format', `${ pathToSerenityListener }:${ output.value() }`, ...pathsToScenarios),
            cwd:    this.loader.cwd,
            stdout: process.stdout,
        })
        .run()
        .then(cleanUpAndPassThrough(output), cleanUpAndReThrow(output));
    }

    private runWithCucumber2(argv: string[], pathToSerenityListener: string, pathsToScenarios: string[]): Promise<void> {
        const cucumber = this.loader.require('cucumber');

        return new cucumber.Cli({
            argv:   argv.concat('--require', pathToSerenityListener, ...pathsToScenarios),
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

/**
 * @private
 */
function cleanUpAndPassThrough<T>(output: OutputDescriptor): (result: T) => Promise<T> {
    return (result: T) => {
        return output.cleanUp()
            .then(() => result);
    }
}

/**
 * @private
 */
function cleanUpAndReThrow(output: OutputDescriptor): (error: Error) => Promise<void> {
    return (error: Error) => {
        return output.cleanUp()
            .then(() => {
                throw error;
            }, ignored => {
                throw error;
            });
    }
}
