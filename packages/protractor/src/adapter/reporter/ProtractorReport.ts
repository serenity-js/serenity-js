import { SpecResult } from 'protractor/built/plugins';

/**
 * @desc
 *  A JSON object which needs to be returned to Protractor when {@link ProtractorFrameworkAdapter}
 *  is done with executing the test scenarios.
 *
 * @see https://github.com/angular/protractor/blob/master/lib/frameworks/README.md
 *
 * @private
 */
export interface ProtractorReport {
    /**
     * Total number of failed scenarios
     */
    failedCount: number;

    /**
     * Results per scenario
     *
     * Note: duration is not part of the SpecResult, but is being used by the Jasmine reporter
     * https://github.com/angular/protractor/blob/4f74a4ec753c97adfe955fe468a39286a0a55837/lib/frameworks/jasmine.js#L32
     */
    specResults: Array<SpecResult & { duration: number }>;
}
