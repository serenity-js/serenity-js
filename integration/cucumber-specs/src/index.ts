import { SpawnResult } from '@integration/testing-tools';
import { LogicError } from '@serenity-js/core';
import { CucumberRunner } from './CucumberRunner';
import { ModuleLoader, Version } from '@serenity-js/core/lib/io';

export function registerRunner(
    pathToCucumberExecutable: string,
    cwd: string,
    args: string[]
) {
    (global as any).cucumberRunner = new CucumberRunner(pathToCucumberExecutable, cwd, args);
}

export async function cucumber(pathToFeatureFile: string, stepDefinitionsFileNames: string | string[], scenarioArgs: string[] = []): Promise<SpawnResult> {
    if (! (global as any).cucumberRunner) {
        throw new LogicError('no Cucumber runner registered');
    }
    return (global as any).cucumberRunner.run(pathToFeatureFile, [].concat(stepDefinitionsFileNames), scenarioArgs);
}

export function cucumberVersion(): Version {
    const loader = new ModuleLoader(process.cwd());
    return loader.hasAvailable('cucumber')
        ? loader.versionOf('cucumber')
        : loader.versionOf('@cucumber/cucumber');
}
