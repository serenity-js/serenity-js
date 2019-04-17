import { ModuleLoader } from '@serenity-js/core/lib/io';
import { CucumberCLIAdapter, CucumberConfig } from '@serenity-js/cucumber/lib/cli';     // tslint:disable-line:no-submodule-imports
import { TestRunner } from './TestRunner';

export class CucumberTestRunner implements TestRunner {
    constructor(
        private readonly config: CucumberConfig,
        private readonly loader: ModuleLoader,
    ) {
    }

    run(pathsToScenarios: string[]): Promise<void> {
        return new CucumberCLIAdapter(this.config, this.loader).run(pathsToScenarios);
    }
}
