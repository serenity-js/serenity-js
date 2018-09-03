import { match } from 'tiny-types';

import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ImplementationPending,
    Outcome,
} from '../../../../model';
import { ErrorDetails } from '../SerenityBDDJsonSchema';
import { ErrorParser } from './ErrorParser';

/** @access package */
export class OutcomeMapper {
    private static errorParser = new ErrorParser();

    public mapOutcome(outcome: Outcome, mapAs: (result: string, error?: ErrorDetails) => void) {
        const parse = OutcomeMapper.errorParser.parse;

        return match<Outcome, void>(outcome).
            when(ExecutionCompromised,              ({ error }: ExecutionCompromised)               => mapAs('COMPROMISED', parse(error))).
            when(ExecutionFailedWithError,          ({ error }: ExecutionFailedWithError)           => mapAs('ERROR', parse(error))).
            when(ExecutionFailedWithAssertionError, ({ error }: ExecutionFailedWithAssertionError)  => mapAs('FAILURE', parse(error))).
            when(ExecutionSkipped,      _ => mapAs('SKIPPED')).
            when(ExecutionIgnored,      _ => mapAs('IGNORED')).
            when(ImplementationPending, _ => mapAs('PENDING')).
            else(/* ExecutionSuccessful */ _ => /* ignore */ mapAs('SUCCESS'));
    }
}
