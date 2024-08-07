import type { Outcome } from '../model';

/**
 * Describes an adapter needed to run a given type of tests programmatically
 *
 * @group Integration
 */
export interface TestRunnerAdapter {

    /**
     * Loads test scenarios.
     */
    load(pathsToScenarios: string[]): Promise<void>;

    /**
     * Returns the number of loaded scenarios
     *
     * @throws [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
     *  If called before `load`
     */
    scenarioCount(): number;

    /**
     * Runs loaded test scenarios.
     *
     * @throws [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
     *  If called before `load`
     */
    run(): Promise<void>;

    /**
     * Scenario success threshold for this test runner.
     */
    successThreshold(): Outcome | { Code: number };
}
