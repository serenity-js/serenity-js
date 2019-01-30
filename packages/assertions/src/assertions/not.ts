import { AnswersQuestions, AssertionError } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Assertion } from './Assertion';

export function not<Expected, Actual>(assertion: Assertion<Expected, Actual>): Assertion<Expected, Actual> {
    return new Not<Expected, Actual>(assertion);
}

class Not<Expected, Actual> extends Assertion<Expected, Actual> {
    constructor(private readonly assertion: Assertion<Expected, Actual>) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<void> {

        return (actual: any) =>
            this.assertion.answeredBy(actor)(actual)
                .then(
                    () => {
                        throw new AssertionError(
                            `Expected ${ formatted `${ actual }` } to not ${ this.assertion.toString() }`,
                            void 0,
                            actual,
                        );
                    },
                    error => {
                        if (error instanceof AssertionError) {
                            return void 0;
                        }

                        throw error;
                    },
                );
    }

    toString(): string {
        return `not ${ this.assertion.toString() }`;
    }
}
