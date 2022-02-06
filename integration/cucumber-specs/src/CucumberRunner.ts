import { spawner, SpawnResult } from '@integration/testing-tools';
import * as path from 'path';

export class CucumberRunner {
    constructor(
        private readonly pathToCucumberExecutable: string,
        private readonly cwd: string,
        private readonly args: string[] = []
    ) {
    }

    run(pathToFeatureFile: string, stepDefinitionsFileNames: string[], scenarioArguments: string[]): Promise<SpawnResult> {
        const cucumber = spawner(
            this.pathToCucumberExecutable,
            { cwd: this.cwd },
        );

        const runnerSpecificRequires = stepDefinitionsFileNames
            .reduce((acc, current) => acc.concat('--require', path.resolve(process.cwd(), `src/step_definitions/${ current }`)), []);

        return cucumber(
            ...this.args,
            ...runnerSpecificRequires,
            `../cucumber-specs/${ pathToFeatureFile }`,
            ...scenarioArguments,
        );
    }
}
