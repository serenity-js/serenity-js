import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
} from '@serenity-js/core/model';

/**
 * All valid outcome codes recognised by the html-reporter.
 */
export const VALID_OUTCOME_CODES = [
    ExecutionSuccessful.Code,
    ExecutionFailedWithAssertionError.Code,
    ExecutionFailedWithError.Code,
    ExecutionCompromised.Code,
    ImplementationPending.Code,
    ExecutionSkipped.Code,
] as const;

/**
 * Union of all valid numeric outcome codes.
 */
export type ValidOutcomeCode = typeof VALID_OUTCOME_CODES[number];

/**
 * Type guard: checks whether a numeric code is a recognised outcome code.
 *
 * @param code - A numeric value that may or may not be a valid outcome code
 * @returns `true` if `code` is one of the recognised outcome codes
 */
export function isValidOutcomeCode(code: number): code is ValidOutcomeCode {
    return (VALID_OUTCOME_CODES as readonly number[]).includes(code);
}
