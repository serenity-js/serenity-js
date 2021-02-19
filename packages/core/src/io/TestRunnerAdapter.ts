/**
 * @desc
 *  Describes an adapter needed to run a given type of tests programmatically
 *
 * @interface
 */
export interface TestRunnerAdapter {

    /**
     * @desc
     *  Runs test scenarios at pathsToScenarios using the given test runner.
     *
     * @abstract
     * @type {function(pathsToScenarios: string[]): Promise<void>}
     */
    run: (pathsToScenarios: string[]) => Promise<void>;
}
