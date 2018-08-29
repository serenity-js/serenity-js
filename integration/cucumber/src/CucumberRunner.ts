import { SpawnResult } from '@integration/testing-tools';

export class CucumberRunner {
    public readonly description: string;

    constructor(
        public readonly version: number,
        public readonly requiredFiles: string[],
        public readonly stepFile: string,
        public readonly featureFile: string,
        public readonly args: string[],
    ) {
        this.description = `[${this.version}.x] ${ this.featureFile }, ${ this.stepFile } steps`;
    }

    run(): Promise<SpawnResult> {
        const runnerModule = `@integration/cucumber-${ this.version }-runner`;
        const cucumberCli = require(runnerModule);

        const runnerSpecificRequires = this.requiredFiles
            .reduce((acc, current) => acc.concat('--require', current), []);

        return cucumberCli(
            ...runnerSpecificRequires,
            '--require', `lib/step_definitions/${ this.stepFile }.steps.js`,
            `../cucumber/${ this.featureFile }`,
            ...this.args,
        );
    }
}
