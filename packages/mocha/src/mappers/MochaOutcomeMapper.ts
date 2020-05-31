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
import { Test } from 'mocha';

/**
 * @package
 */
export class MochaOutcomeMapper {
    public outcomeOf(test: Test): Outcome {
        switch (true) {
            case !! test.err && this.isAssertionError(test.err):
                return new ExecutionFailedWithAssertionError(test.err as AssertionError);

            case !! test.err && test.err instanceof TestCompromisedError:
                return new ExecutionCompromised(test.err as TestCompromisedError);

            case !! test.err:
                return new ExecutionFailedWithError(test.err);

            case test.isPending() && !! test.fn:
                return new ExecutionSkipped();

            case test.isPending() && ! test.fn:
                return new ImplementationPending(new ImplementationPendingError(`Scenario not implemented`));

            default:
                return new ExecutionSuccessful();
        }
    }

    private isAssertionError(error: Error): error is AssertionError {
        return error instanceof AssertionError
            || this.looksLikeAnAssertionError(error);
    }

    private looksLikeAnAssertionError(error: Error): error is AssertionError {
        return /^AssertionError$/.test(error.name)
            && error.hasOwnProperty('expected')
            && error.hasOwnProperty('actual')
    }
}
