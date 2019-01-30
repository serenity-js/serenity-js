import { AnswersQuestions, AssertionError } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Assertion } from './Assertion';

export function or<Actual>(...assertions: Array<Assertion<any, Actual>>): Assertion<any, Actual> {
    return new Or(assertions);
}

interface FailedAssertion {
    error: AssertionError;
    message: string;
}

class Or<Actual> extends Assertion<any, Actual> {
    private static readonly Separator = ' or ';

    constructor(private readonly assertions: Array<Assertion<any, Actual>>) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<void> {

        return (actual: any) =>
            this.assertions.reduce(
                (previous, current) =>
                    previous.then((failuresSoFar: FailedAssertion[]) =>
                        current.answeredBy(actor)(actual)
                            .then(() => failuresSoFar)
                            .catch(error => failuresSoFar.concat({ error, message: current.toString() })),
                        ),
                Promise.resolve([]),
            ).
            then((failedAssertions: FailedAssertion[]) => {
                if (failedAssertions.length === this.assertions.length) {
                    const firstError = failedAssertions[0].error;

                    throw new AssertionError(
                        `Expected ${ formatted `${ actual }` } to ${ failedAssertions.map(fa => fa.message).join(Or.Separator) }`,
                        firstError.expected,
                        firstError.actual,
                        firstError,
                    );
                }

                return void 0;
            });
    }

    toString(): string {
        return this.assertions
            .map(assertion => assertion.toString())
            .join(Or.Separator);
    }
}
