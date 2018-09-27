import { match } from 'tiny-types';
import { AssertionError, TestCompromisedError } from '../../errors';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ProblemIndication,
} from '../../model';

/** @access package */
export class OutcomeMatcher {
    outcomeFor(error: Error | any): ProblemIndication {
        return match<Error, ProblemIndication>(error)
            .when(TestCompromisedError, _ => new ExecutionCompromised(error))
            .when(AssertionError, _ => new ExecutionFailedWithAssertionError(error))
            .when(Error, _ => /AssertionError/.test(error.constructor.name) // mocha
                    ? new ExecutionFailedWithAssertionError(error)
                    : new ExecutionFailedWithError(error))
            .else(_ => new ExecutionFailedWithError(error));
    }
}
