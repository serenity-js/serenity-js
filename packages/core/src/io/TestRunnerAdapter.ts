import { Outcome } from '../model';

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

    /**
     * @desc
     *  Scenario success threshold for this test runner.
     *
     * @abstract
     * @type {Outcome | { Code: number }}
     */
    successThreshold: () => Outcome | { Code: number };
}
