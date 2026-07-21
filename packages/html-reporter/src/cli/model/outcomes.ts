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

/**
 * Maps numeric outcome codes to their human-readable display strings.
 */
export const OUTCOME_CODE_DISPLAY_STRINGS: Record<number, string> = {
    [ExecutionSuccessful.Code]: 'SUCCESS',
    [ExecutionFailedWithAssertionError.Code]: 'FAILURE',
    [ExecutionFailedWithError.Code]: 'ERROR',
    [ExecutionCompromised.Code]: 'COMPROMISED',
    [ImplementationPending.Code]: 'PENDING',
    [ExecutionSkipped.Code]: 'SKIPPED',
};

/**
 * Converts a numeric outcome code to its display string representation.
 *
 * @param code - A numeric outcome code
 * @returns The display string (e.g. 'SUCCESS', 'FAILURE'), or 'ERROR' if unrecognised
 */
export function outcomeCodeToDisplayString(code: number): string {
    return OUTCOME_CODE_DISPLAY_STRINGS[code] || 'ERROR';
}

/**
 * Maps an outcome display string (e.g. 'SUCCESS') to its report key (e.g. 'passed').
 *
 * @param outcome - An outcome display string
 * @returns The corresponding report key, or 'error' if unrecognised
 */
export function mapOutcomeToKey(outcome: string): string {
    const map: Record<string, string> = { SUCCESS: 'passed', FAILURE: 'failed', ERROR: 'error', COMPROMISED: 'compromised', PENDING: 'pending', SKIPPED: 'skipped' };
    return map[outcome] || 'error';
}
