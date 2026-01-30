import type { Expectation } from './Expectation.js';
import type { Location } from './Location.js';
import type { Result } from './Result.js';

/**
 * @package
 * @see https://jasmine.github.io/api/edge/global.html#SuiteResult
 */
export interface SuiteResult extends Result {
    /** The unique id of this suite. */
    id: string;

    /** The description text passed to the `describe` that made this suite. */
    description: string;

    /** The full description including all ancestors of this suite. */
    fullName: string;

    /** The list of expectations that failed in an afterAll for this suite. */
    failedExpectations:	Expectation[];

    /** The list of deprecation warnings that occurred on this suite. */
    deprecationWarnings: Expectation[];

    /** Once the suite has completed, this string represents the pass/fail status of this suite. */
    status?:	string;

    /** The time in ms for Suite execution, including any before/afterAll, before/afterEach. */
    duration: number | null;

    /**
     * The file system location of the suite.
     * Available in Jasmine 5.x and earlier when monkey-patched by Serenity/JS.
     */
    location?: Location;

    /**
     * The filename where the suite is defined.
     * Available in Jasmine 6.x and later.
     */
    filename?: string;
}
