import { AnswersQuestions, KnowableUnknown, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ExpectationMet, ExpectationNotMet, Outcome } from './outcomes';

/**
 * todo: document usage examples
 */
export abstract class Expectation<Expected, Actual = Expected>
    implements Question<(actual: Actual) => Promise<Outcome<Expected, Actual>>>
{
    static thatActualShould<E, A>(relationshipName: string, expectedValue: KnowableUnknown<E>): {
        soThat: (statement: (actual: A, expected: E) => boolean) => Expectation<E, A>,
    } {
        return ({
            soThat: (statement: (actual: A, expected: E) => boolean): Expectation<E, A> => {
                return new DynamicallyGeneratedExpectation<E, A>(relationshipName, statement, expectedValue);
            },
        });
    }

    abstract answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<Expected, Actual>>;

    abstract toString(): string;
}

class DynamicallyGeneratedExpectation<Expected, Actual> extends Expectation<Expected, Actual> {

    constructor(
        private readonly description: string,
        private readonly statement: (actual: Actual, expected: Expected) => boolean,
        private readonly expectedValue: KnowableUnknown<Expected>,
    ) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<Expected, Actual>> {

        return (actual: Actual) => actor.answer(this.expectedValue)
            .then(expected => {
                return this.statement(actual, expected)
                    ? new ExpectationMet(this.toString(), expected, actual)
                    : new ExpectationNotMet(this.toString(), expected, actual);
            });
    }

    toString(): string {
        return `${ this.description } ${ formatted `${this.expectedValue}` }`;
    }
}
