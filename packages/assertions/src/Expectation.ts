import { Answerable, AnswersQuestions, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ExpectationMet, ExpectationNotMet, Outcome } from './outcomes';

/**
 * @public
 *
 * @typedef {function(actual: A, expected: E) => boolean} Predicate<A,E>
 */
export type Predicate<A, E> = (actual: A, expected: E) => boolean;

/**
 * @desc
 *  Defines an expectation to be used with:
 *  - {@link Ensure} - to perform a verification
 *  - {@link Check} - to control the execution flow
 *
 * @implements {@serenity-js/core/lib/screenplay~Question}
 *
 * @see {@link Ensure}
 * @see {@link Check}
 */
export abstract class Expectation<Expected, Actual = Expected>
    extends Question<(actual: Actual) => Promise<Outcome<Expected, Actual>>>
{

    /**
     * @desc
     *  Used to define a simple {@link Expectation}
     *
     * @example
     *  import { actorCalled } from '@serenity-js/core';
     *  import { Expectation, Ensure } from '@serenity-js/assertions';
     *
     *  function isDivisibleBy(expected: Answerable<number>): Expectation<number> {
     *      return Expectation.thatActualShould<number, number>('have value divisible by', expected)
     *          .soThat((actualValue, expectedValue) => actualValue % expectedValue === 0);
     *  }
     *
     *  actorCalled('Erica').attemptsTo(
     *      Ensure.that(4, isDivisibleBy(2)),
     *  );
     *
     * @param {string} relationshipName
     * @param {@serenity-js/core/lib/screenplay~Answerable<E>} expectedValue
     *
     * @returns {"soThat": function(predicate: Predicate<A,E>): Expectation<E, A>}
     */
    static thatActualShould<E, A>(relationshipName: string, expectedValue: Answerable<E>): {
        soThat: (predicate: Predicate<A, E>) => Expectation<E, A>,
    } {
        return ({
            soThat: (predicate: Predicate<A, E>): Expectation<E, A> => {
                return new DynamicallyGeneratedExpectation<E, A>(relationshipName, predicate, expectedValue);
            },
        });
    }

    /**
     * @desc
     *  Used to compose {@link Expectation}s.
     *
     * @example
     *  import { actorCalled } from '@serenity-js/core';
     *  import { Expectation, Ensure, and, or, isGreaterThan, isLessThan, equals  } from '@serenity-js/assertions';
     *
     *  function isWithin(lowerBound: number, upperBound: number) {
     *      return Expectation
     *          .to(`have value within ${ lowerBound } and ${ upperBound }`)
     *          .soThatActual(and(
     *              or(isGreaterThan(lowerBound), equals(lowerBound)),
     *              or(isLessThan(upperBound), equals(upperBound)),
     *          ));
     *  }
     *
     *  actorCalled('Erica').attemptsTo(
     *      Ensure.that(5, isWithin(3, 6)),
     *  );
     *
     * @param {string} relationshipName
     *
     * @returns {"soThat": function(...expectations: Array<Expectation<any, A>>): Expectation<any, A>}
     */
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
}

/**
 * @package
 */
class DynamicallyGeneratedExpectation<Expected, Actual> extends Expectation<Expected, Actual> {

    constructor(
        private readonly description: string,
        private readonly predicate: Predicate<Actual, Expected>,
        private readonly expectedValue: Answerable<Expected>,
    ) {
        super(`${ description } ${ formatted `${ expectedValue }` }`);
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<Expected, Actual>> {

        return (actual: Actual) => actor.answer(this.expectedValue)
            .then(expected => {
                return this.predicate(actual, expected)
                    ? new ExpectationMet(this.toString(), expected, actual)
                    : new ExpectationNotMet(this.toString(), expected, actual);
            });
    }
}

/**
 * @package
 */
class ExpectationAlias<Actual> extends Expectation<any, Actual> {

    constructor(
        subject: string,
        private readonly expectation: Expectation<any, Actual>,
    ) {
        super(subject);
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<any, Actual>> {

        return (actual: Actual) =>
            this.expectation.answeredBy(actor)(actual).then(_ => _ instanceof ExpectationMet
                ? new ExpectationMet(this.subject, _.expected, _.actual)
                : new ExpectationNotMet(_.message, _.expected, _.actual));
    }
}
