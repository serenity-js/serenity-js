import { Answerable, AnswersQuestions, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ExpectationMet, ExpectationNotMet, Outcome } from './outcomes';

/**
 * todo: document usage examples
 */
export abstract class Expectation<Expected, Actual = Expected>
    implements Question<(actual: Actual) => Promise<Outcome<Expected, Actual>>>
{
    static thatActualShould<E, A>(relationshipName: string, expectedValue: Answerable<E>): {
        soThat: (statement: (actual: A, expected: E) => boolean) => Expectation<E, A>,
    } {
        return ({
            soThat: (statement: (actual: A, expected: E) => boolean): Expectation<E, A> => {
                return new DynamicallyGeneratedExpectation<E, A>(relationshipName, statement, expectedValue);
            },
        });
    }

    static to<A>(relationshipName: string): {
        soThatActual: (...expectations: Array<Expectation<any, A>>) => Expectation<any, A>,
    } {
        return {
            soThatActual: (expectation: Expectation<any, A>): Expectation<any, A> => {
                return new ExpectationAlias<A>(relationshipName, expectation);
            },
        };
    }

    abstract answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<Expected, Actual>>;

    abstract toString(): string;
}

/**
 * @package
 */
class DynamicallyGeneratedExpectation<Expected, Actual> implements Expectation<Expected, Actual> {

    constructor(
        private readonly description: string,
        private readonly statement: (actual: Actual, expected: Expected) => boolean,
        private readonly expectedValue: Answerable<Expected>,
    ) {
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

/**
 * @package
 */
class ExpectationAlias<Actual> implements Expectation<any, Actual> {

    constructor(
        private readonly description: string,
        private readonly expectation: Expectation<any, Actual>,
    ) {
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<any, Actual>> {

        return (actual: Actual) =>
            this.expectation.answeredBy(actor)(actual).then(_ => _ instanceof ExpectationMet
                ? new ExpectationMet(this.description, _.expected, _.actual)
                : new ExpectationNotMet(_.message, _.expected, _.actual));
    }

    toString(): string {
        return this.description;
    }
}
