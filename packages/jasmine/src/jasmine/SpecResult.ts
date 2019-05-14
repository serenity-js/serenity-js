import { Expectation } from './Expectation';
import { Location } from './Location';

export interface SpecResult {
    /** The unique id of this spec. */
    id: string;

    /** The description passed to the 'it' that created this spec. */
    description: string;

    /** The full description including all ancestors of this spec. */
    fullName: string;

    /** The list of expectations that failed during execution of this spec. */
    failedExpectations: Expectation[];

    /** The list of expectations that passed during execution of this spec. */
    passedExpectations: Expectation[];

    /** The list of deprecation warnings that occurred during execution this spec. */
    deprecationWarnings: Expectation[];

    /** If the spec is pending, this will be the reason. */
    pendingReason: string;

    /** Once the spec has completed, this string represents the pass/fail status of this spec. */
    status?: string;

    /** The time in ms used by the spec execution, including any before/afterEach. */
    duration: number | null;

    location: Location;
}
