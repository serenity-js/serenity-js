export * from './CucumberRunner';
import { CucumberRunnerBuilder } from './CucumberRunnerBuilder';

export function cucumberVersions(...versions: number[]): CucumberRunnerBuilder {
    return new CucumberRunnerBuilder(versions);
}
