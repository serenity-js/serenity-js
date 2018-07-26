import { match } from 'tiny-types';
import { TestCompromisedError } from '../../errors';
import { AssertionFailed, ErrorOccurred, ExecutionCompromised, ProblemIndication } from '../../model';

export class OutcomeMatcher {
    outcomeFor(error: Error | any): ProblemIndication {
        return match<Error, ProblemIndication>(error)
            .when(TestCompromisedError, _ => new ExecutionCompromised(error))
            .when(Error, _ => /AssertionError/.test(error.constructor.name)
                    ? new AssertionFailed(error)
                    : new ErrorOccurred(error))
            .else(_ => new ErrorOccurred(error));
    }
}
