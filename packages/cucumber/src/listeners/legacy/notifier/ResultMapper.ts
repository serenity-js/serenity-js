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
                    case error instanceof AssertionError:
                        return new ExecutionFailedWithAssertionError(error as AssertionError);
                    // non-Serenity/JS assertion errors
                    case error instanceof Error && error.name === 'AssertionError' && error.message && hasOwnProperty(error, 'expected') && hasOwnProperty(error, 'actual'):
                        return new ExecutionFailedWithAssertionError(new AssertionError(error.message, (error as any).expected, (error as any).actual, error));
                    case error instanceof TestCompromisedError:
                        return new ExecutionCompromised(error as TestCompromisedError);
                    default:
                        return new ExecutionFailedWithError(error);
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

/**
 * @private
 */
function hasOwnProperty(value: any, fieldName: string): boolean {
    return Object.prototype.hasOwnProperty.call(value, fieldName);
}
