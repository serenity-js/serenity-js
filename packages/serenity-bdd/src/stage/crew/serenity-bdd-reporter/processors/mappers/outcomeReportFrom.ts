import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ImplementationPending,
    Outcome,
} from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';

import { ErrorDetails } from '../../SerenityBDDJsonSchema';
import { errorReportFrom } from './errorReportFrom';

/**
 * @package
 */
export function outcomeReportFrom(outcome: Outcome): { result: string, error?: ErrorDetails }  {
    return match<Outcome, { result: string, error?: ErrorDetails }>(outcome).
        when(ExecutionCompromised, ({ error }: ExecutionCompromised) =>
            ({ result: 'COMPROMISED', error: errorReportFrom(error) })
        ).
        when(ExecutionFailedWithError, ({ error }: ExecutionFailedWithError) =>
            ({ result: 'ERROR', error: errorReportFrom(error) })
        ).
        when(ExecutionFailedWithAssertionError, ({ error }: ExecutionFailedWithAssertionError) =>
            ({ result: 'FAILURE', error: errorReportFrom(error) })
        ).
        when(ExecutionSkipped,      _ =>
            ({ result: 'SKIPPED' })
        ).
        when(ExecutionIgnored,      _ =>
            ({ result: 'IGNORED' })
        ).
        when(ImplementationPending, _ =>
            ({ result: 'PENDING' })
        ).
        else(/* ExecutionSuccessful */ _ =>
            ({ result: 'SUCCESS' })
        );
}
