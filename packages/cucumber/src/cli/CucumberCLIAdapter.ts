import { ModuleLoader, Version } from '@serenity-js/core/lib/io';
import { CucumberConfig } from './CucumberConfig';
import { CucumberOptions } from './CucumberOptions';

export class CucumberCLIAdapter {

    private readonly options: CucumberOptions;

    constructor(
        config: CucumberConfig,
        private readonly loader: ModuleLoader,
    ) {
        this.options = new CucumberOptions(config);
    }

    run(pathsToScenarios: string[]): Promise<void> {
        return new Promise((resolve, reject) => {

            const
                cucumber: any   = this.loader.require('cucumber'),
                version         = this.loader.versionOf('cucumber'),
                argv            = this.options.asArgumentsForCucumber(version),

                serenityListener = this.loader.resolve('@serenity-js/cucumber');

            if (version.isAtLeast(new Version('2.0.0'))) {
                return new cucumber.Cli({
                    argv:   argv.concat('--format', serenityListener, ...pathsToScenarios),
                    cwd:    this.loader.cwd,
                    stdout: process.stdout,
                }).run().then(resolve, reject);
            }
            else {
                cucumber.Cli(argv.concat('--require', serenityListener, ...pathsToScenarios))
                    .run((wasSuccessful: boolean) =>
                        wasSuccessful
                            ? resolve()
                            : reject(new Error('Cucumber test run has failed')),
                    );
            }
        });
    }
}
