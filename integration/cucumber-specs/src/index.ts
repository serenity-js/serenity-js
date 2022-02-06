import { SpawnResult } from '@integration/testing-tools';
import { LogicError } from '@serenity-js/core';
import { ModuleLoader, Version } from '@serenity-js/core/lib/io';

import { CucumberRunner } from './CucumberRunner';

export function registerRunner(
    pathToCucumberExecutable: string,
    cwd: string,
    args: string[]
): void {
    (global as any).cucumberRunner = new CucumberRunner(pathToCucumberExecutable, cwd, args);
}

export async function cucumber(pathToFeatureFile: string, stepDefinitionsFileNames: string | string[], scenarioArguments: string[] = []): Promise<SpawnResult> {
    if (! (global as any).cucumberRunner) {
        throw new LogicError('no Cucumber runner registered');
    }
    return (global as any).cucumberRunner.run(pathToFeatureFile, [].concat(stepDefinitionsFileNames), scenarioArguments);
}

export function cucumberVersion(): Version {
    const loader = new ModuleLoader(process.cwd());
    return loader.hasAvailable('cucumber')
        ? loader.versionOf('cucumber')
        : loader.versionOf('@cucumber/cucumber');
}
