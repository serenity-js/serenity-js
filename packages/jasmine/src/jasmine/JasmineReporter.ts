import { JasmineDoneInfo } from './JasmineDoneInfo';
import { JasmineStartedInfo } from './JasmineStartedInfo';
import { SpecResult } from './SpecResult';
import { SuiteResult } from './SuiteResult';

/**
 * @desc
 *  An interface representing an instance of a Jasmine Reporter object
 *
 * @see https://jasmine.github.io/api/edge/Reporter.html
 * @interface
 */
export interface JasmineReporter {

    /**
     * @desc
     *  Called after all of the specs have been loaded, but just before execution starts.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#jasmineStarted
     *
     * @type {function(suiteInfo: JasmineStartedInfo): Promise<void> | void}
     * @public
     */
    jasmineStarted?: (suiteInfo: JasmineStartedInfo) => Promise<void> | void;

    /**
     * @desc
     *  Invoked when an `it` starts to run (including associated `beforeEach` functions)
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#specStarted
     *
     * @type {function(result: SpecResult): Promise<void> | void}
     * @public
     */
    specStarted?: (result: SpecResult) => Promise<void> | void;

    /**
     * @desc
     *  Invoked when an `it` and its associated `beforeEach` and `afterEach` functions have been run.
     *
     *  While Jasmine doesn't require any specific functions, not defining a `specDone`
     *  will make it impossible for a reporter to know when a spec has failed.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#specDone
     *
     * @type {function(result: SpecResult): Promise<void> | void}
     * @public
     */
    specDone?: (result: SpecResult) => Promise<void> | void;

    /**
     * @desc
     *  Invoked when a `describe` starts to run.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#suiteStarted
     *
     * @type {function(result: SuiteResult): Promise<void> | void}
     * @public
     */
    suiteStarted?: (result: SuiteResult) => Promise<void> | void;

    /**
     * @desc
     *  Invoked when all of the child specs and suites for a given suite have been run.
     *
     *  While Jasmine doesn't require any specific functions, not defining a `suiteDone`
     *  will make it impossible for a reporter to know when a suite has failures in an `afterAll`.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#suiteDone
     *
     * @type {function(result: SuiteResult): Promise<void> | void}
     * @public
     */
    suiteDone?: (result: SuiteResult) => Promise<void> | void;

    /**
     * @desc
     *  Called when the entire suite has finished execution.
     *
     * @see https://jasmine.github.io/api/edge/Reporter.html#jasmineDone
     *
     * @type {function(suiteInfo: JasmineDoneInfo): Promise<void> | void}
     * @public
     */
    jasmineDone?: (suiteInfo: JasmineDoneInfo) => Promise<void> | void;
}
