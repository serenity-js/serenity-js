import { AssertionError, ImplementationPendingError, TestCompromisedError } from '@serenity-js/core';
import type {
    Outcome} from '@serenity-js/core/lib/model';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending
} from '@serenity-js/core/lib/model';
import type { Test } from 'mocha';

/**
 * @package
 */
export class MochaOutcomeMapper {
    public outcomeOf(test: Test, maybeError?: Error): Outcome {
        const error = maybeError || test.err;

        switch (true) {
            case !! error && this.isGoingToBeRetried(test):
                return new ExecutionIgnored(error);

            case !! error && this.isAssertionError(error):
                return new ExecutionFailedWithAssertionError(error as AssertionError);

            case !! error && error instanceof TestCompromisedError:
                return new ExecutionCompromised(error as TestCompromisedError);

            case !! error:
                return new ExecutionFailedWithError(error);

            case test.isPending() && !! test.fn:
                return new ExecutionSkipped();

            case test.isPending() && ! test.fn:
                return new ImplementationPending(new ImplementationPendingError(`Scenario not implemented`));

            default:
                return new ExecutionSuccessful();
        }
    }

    private isGoingToBeRetried(test: Test) {
        return ! test.isPassed()
            && ! test.isFailed()
            && ! test.isPending()
            && (test as any).currentRetry() < test.retries();
    }

    private isAssertionError(error: Error): error is AssertionError {
        return error instanceof AssertionError
            || this.looksLikeAnAssertionError(error);
    }

    private looksLikeAnAssertionError(error: Error): error is AssertionError {
        return /^AssertionError/.test(error.name)   // eslint-disable-line unicorn/prefer-string-starts-ends-with
            && Object.prototype.hasOwnProperty.call(error, 'expected')
            && Object.prototype.hasOwnProperty.call(error, 'actual')
    }
}
