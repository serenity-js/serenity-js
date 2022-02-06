import { d } from '../../io';
import { Answerable, AnswersQuestions, ExpectationMet, ExpectationNotMet, Question, QuestionAdapter } from '../';
import { ExpectationOutcome } from './expectations';

/**
 * @public
 *
 * @typedef {function(actual: Answerable<Actual>) => Promise<ExpectationOutcome<Expected, Actual>> | ExpectationOutcome<unknown, Actual>} Predicate<Actual>
 */
export type Predicate<Actual> = (actor: AnswersQuestions, actual: Answerable<Actual>) =>
    Promise<ExpectationOutcome<unknown, Actual>> | ExpectationOutcome<unknown, Actual>;     // eslint-disable-line @typescript-eslint/indent

/**
 * @desc
 *  Defines an expectation to be used with [assertions](/modules/assertions)
 *  and {@link Question}s like {@link List}.
 *
 * @extends {Question}
 */
export class Expectation<Actual> {

    /**
     * @desc
     *  Used to define a simple {@link Expectation}
     *
     * @example
     *  import { actorCalled, Expectation } from '@serenity-js/core';
     *  import { Ensure } from '@serenity-js/assertions';
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
     * @returns {"soThat": function(predicate: Predicate<Expected, Actual>): Expectation<Expected, Actual>}
     */
    static thatActualShould<E, A>(relationshipName: string, expectedValue?: Answerable<E>): {
        soThat: (simplifiedPredicate: (actualValue: A, expectedValue: E) => Promise<boolean> | boolean) => Expectation<A>,
    } {
        return ({
            soThat: (simplifiedPredicate: (actualValue: A, expectedValue: E) => Promise<boolean> | boolean): Expectation<A> => {
                const subject = relationshipName + ' ' + d`${expectedValue}`;

                return new Expectation<A>(
                    subject,
                    async (actor: AnswersQuestions, actualValue: Answerable<A>): Promise<ExpectationOutcome<E, A>> => {
                        const expected = await actor.answer(expectedValue);
                        const actual   = await actor.answer(actualValue);

                        const result   = await simplifiedPredicate(actual, expected);

                        return result
                            ? new ExpectationMet(subject, expected, actual)
                            : new ExpectationNotMet(subject, expected, actual);
                    }
                );
            },
        });
    }

    /**
     * @desc
     *  Used to compose {@link Expectation}s.
     *
     * @example
     *  import { actorCalled, Expectation } from '@serenity-js/core';
     *  import { Ensure, and, or, isGreaterThan, isLessThan, equals  } from '@serenity-js/assertions';
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
    static to<E, A>(relationshipName: string): {
        soThatActual: (...expectations: Array<Expectation<A>>) => Expectation<A>,
    } {
        return {
            soThatActual: (expectation: Expectation<A>): Expectation<A> => {
                return new Expectation<A>(
                    relationshipName,
                    async (actor: AnswersQuestions, actualValue: Answerable<A>): Promise<ExpectationOutcome<E, A>> => {
                        const outcome  = await actor.answer(expectation.isMetFor(actualValue));

                        return outcome as ExpectationOutcome<E, A>;
                    }
                );
            },
        };
    }

    protected constructor(
        private subject: string,
        private readonly predicate: Predicate<Actual>,
    ) {
    }

    isMetFor(actual: Answerable<Actual>): QuestionAdapter<ExpectationOutcome<unknown, Actual>> {
        return Question.about(this.subject, actor => this.predicate(actor, actual));
    }

    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    toString(): string {
        return this.subject;
    }
}
