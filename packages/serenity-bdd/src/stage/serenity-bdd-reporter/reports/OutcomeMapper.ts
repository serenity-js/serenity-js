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
import { ErrorDetails } from '../SerenityBDDJsonSchema';
import { ErrorRenderer } from './ErrorRenderer';

/** @package */
export class OutcomeMapper {
    private static errorRenderer = new ErrorRenderer();

    public mapOutcome(outcome: Outcome, mapAs: (result: string, error?: ErrorDetails) => void) {
        const render = OutcomeMapper.errorRenderer;

        return match<Outcome, void>(outcome).
            when(ExecutionCompromised,              ({ error }: ExecutionCompromised)               => mapAs('COMPROMISED', render.render(error))).
            when(ExecutionFailedWithError,          ({ error }: ExecutionFailedWithError)           => mapAs('ERROR', render.render(error))).
            when(ExecutionFailedWithAssertionError, ({ error }: ExecutionFailedWithAssertionError)  => mapAs('FAILURE', render.render(error))).
            when(ExecutionSkipped,      _ => mapAs('SKIPPED')).
            when(ExecutionIgnored,      _ => mapAs('IGNORED')).
            when(ImplementationPending, _ => mapAs('PENDING')).
            else(/* ExecutionSuccessful */ _ => /* ignore */ mapAs('SUCCESS'));
    }
}
