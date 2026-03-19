import path from 'node:path';

import { spawner, SpawnResult } from '@integration/testing-tools';

export class CucumberRunner {
    constructor(
        private readonly pathToCucumberExecutable: string,
        private readonly cwd: string,
        private readonly args: string[] = [],
        private readonly execArgv: string[] = []
    ) {
    }

    run(pathToFeatureFile: string, stepDefinitionsFileNames: string[], scenarioArguments: string[]): Promise<SpawnResult> {
        const cucumber = spawner(
            this.pathToCucumberExecutable,
            { cwd: this.cwd, execArgv: this.execArgv },
        );

        // Determine if we should use --import or --require based on the args
        // Cucumber 8+ with ESM mode should use --import for step definitions
        // Older versions with --require-module should use --require
        const useImport = this.execArgv.some(arg => arg.includes('--import'));
        const importFlag = useImport ? '--import' : '--require';

        const runnerSpecificRequires = stepDefinitionsFileNames
            .reduce((acc, current) => acc.concat(importFlag, path.resolve(process.cwd(), `src/step_definitions/${ current }`)), []);

        return cucumber(
            ...this.args,
            ...runnerSpecificRequires,
            `../cucumber-specs/${ pathToFeatureFile }`,
            ...scenarioArguments,
        );
    }
}
