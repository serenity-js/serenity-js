import { match } from 'tiny-types';
import { AssertionFailed, ErrorOccurred, ExecutionCompromised, ProblemIndication } from '../../domain/model/outcomes';
import { TestCompromisedError } from '../../errors';

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
