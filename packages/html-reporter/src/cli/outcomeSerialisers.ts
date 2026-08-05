import type { SerialisedOutcome } from '@serenity-js/core/model';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    ProblemIndication,
} from '@serenity-js/core/model';

import type { ActivityRecord, ErrorRecord, OutcomeCounts } from './model/RunData.js';

export function findErrorInActivities(activities: ActivityRecord[]): ErrorRecord | undefined {
    for (const activity of activities) {
        if (activity.error) {
            return activity.error;
        }
        if (activity.children) {
            const childError = findErrorInActivities(activity.children);
            if (childError) return childError;
        }
    }
    return undefined;
}

const OUTCOME_CODE_LABELS: Record<number, keyof OutcomeCounts> = {
    [ExecutionSuccessful.Code]: 'passed',
    [ExecutionFailedWithAssertionError.Code]: 'failed',
    [ExecutionFailedWithError.Code]: 'error',
    [ExecutionCompromised.Code]: 'compromised',
    [ImplementationPending.Code]: 'pending',
    [ExecutionSkipped.Code]: 'skipped',
};

export function outcomeCodeToLabel(code: number): keyof OutcomeCounts {
    return OUTCOME_CODE_LABELS[code] || 'error';
}

export function errorFrom(outcome: ProblemIndication): ErrorRecord {
    return {
        name: outcome.error.name,
        message: outcome.error.message,
        stack: outcome.error.stack || '',
    };
}

/**
 * Safely extracts the outcome code without calling `ProblemIndication.toJSON()`.
 *
 * `ProblemIndication.toJSON()` calls `ErrorSerialiser.serialise(this.error)`, which invokes
 * `TinyType.toJSON()` on RuntimeError instances. TinyType serialises ALL own properties —
 * including `multiple`, a property that Mocha attaches to errors as a self-referencing
 * circular array (`error.multiple = [error]`). This causes a stack overflow.
 *
 * The html-reporter only needs the outcome code (error details are extracted separately
 * via `errorFrom()`), so we bypass `toJSON()` entirely and use static Code constants.
 */
const outcomeCodeMap = [
    { type: ExecutionFailedWithAssertionError, code: ExecutionFailedWithAssertionError.Code },
    { type: ExecutionFailedWithError, code: ExecutionFailedWithError.Code },
    { type: ExecutionCompromised, code: ExecutionCompromised.Code },
    { type: ExecutionSkipped, code: ExecutionSkipped.Code },
    { type: ImplementationPending, code: ImplementationPending.Code },
] as const;

export function serialiseOutcome(outcome: ProblemIndication | { toJSON(): SerialisedOutcome }): SerialisedOutcome {
    for (const entry of outcomeCodeMap) {
        if (outcome instanceof entry.type) {
            return { code: entry.code };
        }
    }
    return { code: ExecutionSuccessful.Code };
}
