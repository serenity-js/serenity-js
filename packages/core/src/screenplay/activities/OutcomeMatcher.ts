import { match } from 'tiny-types';

import { AssertionError, ImplementationPendingError, TestCompromisedError } from '../../errors';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ImplementationPending,
    ProblemIndication,
} from '../../model';

/** @package */
export class OutcomeMatcher {
    outcomeFor(error: Error | any): ProblemIndication {
        return match<Error, ProblemIndication>(error)
            .when(ImplementationPendingError, _ => new ImplementationPending(error))
            .when(TestCompromisedError, _ => new ExecutionCompromised(error))
            .when(AssertionError, _ => new ExecutionFailedWithAssertionError(error))
            .when(Error, _ =>
                /AssertionError/.test(error.constructor.name) // mocha
                    ? new ExecutionFailedWithAssertionError(error)
                    : new ExecutionFailedWithError(error))
            .else(_ => new ExecutionFailedWithError(error));
    }
}
