import { SpawnResult } from '@integration/testing-tools';
import * as path from 'path';

export class CucumberRunner {
    public readonly description: string;

    constructor(
        public readonly version: number,
        public readonly runnerSpecificFiles: string[],
        public readonly stepFile: string,
        public readonly featureFile: string,
        public readonly args: string[],
    ) {
        this.description = `[${this.version}.x] ${ this.featureFile }, ${ this.stepFile } steps`;
    }

    run(): Promise<SpawnResult> {
        const runnerModule = `@integration/cucumber-${ this.version }-runner`;
        const cucumberCli = require(runnerModule);

        const runnerSpecificRequires = this.runnerSpecificFiles
            .reduce((acc, current) => acc.concat('--require', current), []);

        return cucumberCli(
            ...runnerSpecificRequires,
            '--require', `features/step_definitions/${ this.stepFile }.steps.ts`,
            '--require', 'node_modules/@serenity-js/cucumber/register.js',
            `../cucumber/${ this.featureFile }`,
            ...this.args,
        );
    }
}
