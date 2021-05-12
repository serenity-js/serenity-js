import { AssertionError, ImplementationPendingError, TestCompromisedError } from '@serenity-js/core';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Outcome,
} from '@serenity-js/core/lib/model';

import { AmbiguousStepDefinitionError } from '../../../errors';

/**
 * @package
 */
export class ResultMapper {
    outcomeFor(status: string, maybeError: Error | string | undefined): Outcome {
        const error = this.errorFrom(maybeError);

        if (error && /timed out/.test(error.message)) {
            return new ExecutionFailedWithError(error);
        }

        switch (true) {
            case status === 'undefined':
                return new ImplementationPending(new ImplementationPendingError('Step not implemented'));

            case status === 'ambiguous':
                if (! error) {
                    // Only the step result contains the "ambiguous step def error", the scenario itself doesn't
                    return new ExecutionFailedWithError(new AmbiguousStepDefinitionError('Multiple step definitions match'));
                }

                return new ExecutionFailedWithError(error);

            case status === 'failed':
                switch (true) {
                    case error instanceof AssertionError:       return new ExecutionFailedWithAssertionError(error as AssertionError);
                    case error instanceof TestCompromisedError: return new ExecutionCompromised(error as TestCompromisedError);
                    default:                                    return new ExecutionFailedWithError(error);
                }

            case status === 'pending':
                return new ImplementationPending(new ImplementationPendingError('Step not implemented'));

            case status === 'passed':
                return new ExecutionSuccessful();

            case status === 'skipped':
                return new ExecutionSkipped();
        }

    }

    errorFrom(error: Error | string | undefined): Error | undefined {
        switch (typeof error) {
            case 'string':   return new Error(error as string);
            case 'object':   return error as Error;
            case 'function': return error as Error;
            default:         return void 0;
        }
    }
}
