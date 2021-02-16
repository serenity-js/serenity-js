import { ModuleLoader, OperatingSystem } from '@serenity-js/core/lib/io';
import { CucumberCLIAdapter, CucumberConfig } from '@serenity-js/cucumber/lib/cli';     // tslint:disable-line:no-submodule-imports
import { TestRunner } from './TestRunner';

/**
 * @private
 */
export class CucumberTestRunner implements TestRunner {
    constructor(
        private readonly config: CucumberConfig,
        private readonly loader: ModuleLoader,
        private readonly os: OperatingSystem,
    ) {
    }

    run(pathsToScenarios: string[]): Promise<void> {
        return new CucumberCLIAdapter(this.config, this.loader, this.os).run(pathsToScenarios);
    }
}
