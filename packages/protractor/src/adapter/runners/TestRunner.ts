export interface TestRunner {
    run(pathsToScenarios: string[]): Promise<void>;
}
