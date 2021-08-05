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
     *  Loads test scenarios.
     *
     * @type {function(pathsToScenarios: string[]): Promise<void>}
     */
    load: (pathsToScenarios: string[]) => Promise<void>;

    /**
     * @desc
     *  Returns the number of loaded scenarios
     *
     * @throws {LogicError}
     *  If called before `load`
     *
     * @type {function(): number}
     */
    scenarioCount: () => number;

    /**
     * @desc
     *  Runs loaded test scenarios.
     *
     * @throws {LogicError}
     *  If called before `load`
     *
     * @abstract
     * @type {function(): Promise<void>}
     */
    run: () => Promise<void>;

    /**
     * @desc
     *  Scenario success threshold for this test runner.
     *
     * @abstract
     * @type {Outcome | { Code: number }}
     */
    successThreshold: () => Outcome | { Code: number };
}
