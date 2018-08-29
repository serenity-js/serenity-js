import { CucumberRunner } from './CucumberRunner';

const flatten = <T>(a: T[][]): T[] => a.reduce((acc, current) => acc.concat(current), []);

export class CucumberRunnerBuilder {
    private requiredFiles: string[];
    private args: string[] = [];
    private stepDefs: string[] = [];

    constructor(private readonly versions: number[]) {
    }

    thatRequires(...requiredFiles: string[]) {
        this.requiredFiles = requiredFiles;

        return this;
    }

    withArgs(...args: string[]) {
        this.args = args;

        return this;
    }

    withStepDefsIn(...stepDefs: string[]) {
        this.stepDefs = stepDefs;

        return this;
    }

    toRun(feature: string): CucumberRunner[] {
        const examples = flatten(this.versions.map(version => this.stepDefs.map(stepDef => ({
            version,
            step_interface: stepDef,
        }))));

        return examples.map(example => new CucumberRunner(
            example.version,
            this.requiredFiles,
            example.step_interface,
            feature,
            this.args,
        ));
    }
}
