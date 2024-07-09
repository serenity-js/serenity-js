import type { JasmineDoneInfo } from './JasmineDoneInfo.js';
import type { JasmineStartedInfo } from './JasmineStartedInfo.js';
import type { SpecResult } from './SpecResult.js';
import type { SuiteResult } from './SuiteResult.js';

/**
 * An interface representing an instance of a Jasmine Reporter object
 *
 * @see https://jasmine.github.io/api/edge/Reporter.html
 */
export interface JasmineReporter {

    /**
     * Called after all of the specs have been loaded, but just before execution starts.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#jasmineStarted
     */
    jasmineStarted?: (suiteInfo: JasmineStartedInfo) => Promise<void> | void;

    /**
     * Invoked when an `it` starts to run (including associated `beforeEach` functions)
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#specStarted
     */
    specStarted?: (result: SpecResult) => Promise<void> | void;

    /**
     * Invoked when an `it` and its associated `beforeEach` and `afterEach` functions have been run.
     *
     * While Jasmine doesn't require any specific functions, not defining a `specDone`
     * will make it impossible for a reporter to know when a spec has failed.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#specDone
     */
    specDone?: (result: SpecResult) => Promise<void> | void;

    /**
     * Invoked when a `describe` starts to run.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#suiteStarted
     */
    suiteStarted?: (result: SuiteResult) => Promise<void> | void;

    /**
     * Invoked when all the child specs and suites for a given suite have been run.
     * While Jasmine doesn't require any specific functions, not defining a `suiteDone`
     * will make it impossible for a reporter to know when a suite has failures in an `afterAll`.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#suiteDone
     */
    suiteDone?: (result: SuiteResult) => Promise<void> | void;

    /**
     * Called when the entire suite has finished execution.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#jasmineDone
     */
    jasmineDone?: (suiteInfo: JasmineDoneInfo) => Promise<void> | void;
}
