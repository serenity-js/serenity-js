import { AnswersQuestions, AssertionError, KnowableUnknown, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

/**
 * todo: document usage examples
 * todo: rename to expectation?
 * todo: introduce ExpectationMet | ExpectationNotMet
 * todo: move AssertionError construction to Ensure
 */
export abstract class Assertion<Expected, Actual = Expected> implements Question<(actual: Actual) => Promise<void>> {
    static thatActualShould<E, A>(relationshipName: string, expectedValue: KnowableUnknown<E>): {
        soThat: (statement: (actual: A, expected: E) => boolean) => Assertion<E, A>,
    } {
        return ({
            soThat: (statement: (actual: A, expected: E) => boolean): Assertion<E, A> => {
                return new DynamicallyGeneratedAssertion<E, A>(relationshipName, statement, expectedValue);
            },
        });
    }

    abstract answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<void>;

    abstract toString(): string;
}

class DynamicallyGeneratedAssertion<Expected, Actual> extends Assertion<Expected, Actual> {

    constructor(
        private readonly description: string,
        private readonly statement: (actual: Actual, expected: Expected) => boolean,
        private readonly expectedValue: KnowableUnknown<Expected>,
    ) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<void> {

        return (actual: Actual) => actor.answer(this.expectedValue)
            .then(expected => {
                if (this.statement(actual, expected)) {
                    return void 0;
                }

                throw new AssertionError(
                    formatted `Expected ${ actual } to ${ this }`,
                    expected,
                    actual,
                );
            });
    }

    toString(): string {
        return `${ this.description } ${ formatted `${this.expectedValue}` }`;
    }
}
