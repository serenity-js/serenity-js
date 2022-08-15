import { d } from '../../io';
import { Answerable, AnswersQuestions, ExpectationMet, ExpectationNotMet, Question, QuestionAdapter } from '../';
import { ExpectationOutcome } from './expectations';

/**
 * @group Expectations
 */
export type Predicate<Actual> = (actor: AnswersQuestions, actual: Answerable<Actual>) =>
    Promise<ExpectationOutcome<unknown, Actual>> | ExpectationOutcome<unknown, Actual>;     // eslint-disable-line @typescript-eslint/indent

/**
 * Defines an expectation to be used with {@apilink @apilink Wait.until}, {@apilink Check.whether}, {@apilink Ensure.that}
 * and as part of the Page Element Query Language with {@apilink PageElements.where} and {@apilink List.where}.
 *
 * @group Expectations
 */
export class Expectation<Actual> {

    /**
     * Used to define a simple {@apilink Expectation}
     *
     * #### Simple parameterised expectation
     *
     * ```ts
     *  import { actorCalled, Expectation } from '@serenity-js/core'
     *  import { Ensure } from '@serenity-js/assertions'
     *
     *  function isDivisibleBy(expected: Answerable<number>): Expectation<number> {
     *      return Expectation.thatActualShould<number, number>('have value divisible by', expected)
     *          .soThat((actualValue, expectedValue) => actualValue % expectedValue === 0);
     *  }
     *
     *  await actorCalled('Erica').attemptsTo(
     *      Ensure.that(4, isDivisibleBy(2)),
     *  )
     * ```
     *
     * @param relationshipName
     *  Name of the relationship between the `actual` and the `expected`. Use format `have value <adjective>`
     *  so that the description works in both positive and negative contexts, e.g. `Waited until 5 does have value greater than 2`,
     *  `Expected 5 to not have value greater than 2`.
     *
     * @param expectedValue
     */
    static thatActualShould<Expected_Type, Actual_Type>(relationshipName: string, expectedValue?: Answerable<Expected_Type>): {
        soThat: (simplifiedPredicate: (actualValue: Actual_Type, expectedValue: Expected_Type) => Promise<boolean> | boolean) => Expectation<Actual_Type>,
    } {
        return ({
            soThat: (simplifiedPredicate: (actualValue: Actual_Type, expectedValue: Expected_Type) => Promise<boolean> | boolean): Expectation<Actual_Type> => {
                const subject = relationshipName + ' ' + d`${expectedValue}`;

                return new Expectation<Actual_Type>(
                    subject,
                    async (actor: AnswersQuestions, actualValue: Answerable<Actual_Type>): Promise<ExpectationOutcome<Expected_Type, Actual_Type>> => {
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
     * Used to compose {@apilink Expectation|expectations}.
     *
     * #### Composing {@apilink Expectation|expectations}
     *
     * ```ts
     * import { actorCalled, Expectation } from '@serenity-js/core'
     * import { Ensure, and, or, isGreaterThan, isLessThan, equals  } from '@serenity-js/assertions'
     *
     * function isWithin(lowerBound: number, upperBound: number) {
     *   return Expectation
     *     .to(`have value within ${ lowerBound } and ${ upperBound }`)
     *     .soThatActual(
     *       and(
     *         or(isGreaterThan(lowerBound), equals(lowerBound)),
     *         or(isLessThan(upperBound), equals(upperBound)),
     *       )
     *     )
     *  }
     *
     *  await actorCalled('Erica').attemptsTo(
     *      Ensure.that(5, isWithin(3, 6)),
     *  )
     * ```
     *
     * @param relationshipName
     *  Name of the relationship between the `actual` and the `expected`. Use format `have value <adjective>`
     *  so that the description works in both positive and negative contexts, e.g. `Waited until 5 does have value greater than 2`,
     *  `Expected 5 to not have value greater than 2`.
     */
    static to<Expected_Type, Actual_Type>(relationshipName: string): {
        soThatActual: (expectation: Expectation<Actual_Type>) => Expectation<Actual_Type>,
    } {
        return {
            soThatActual: (expectation: Expectation<Actual_Type>): Expectation<Actual_Type> => {
                return new Expectation<Actual_Type>(
                    relationshipName,
                    async (actor: AnswersQuestions, actualValue: Answerable<Actual_Type>): Promise<ExpectationOutcome<Expected_Type, Actual_Type>> => {
                        const outcome  = await actor.answer(expectation.isMetFor(actualValue));

                        return outcome as ExpectationOutcome<Expected_Type, Actual_Type>;
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

    /**
     * Returns a {@apilink QuestionAdapter} that resolves to {@apilink ExpectationOutcome}
     * indicating that the {@apilink ExpectationMet|expectation was met}
     * or that the {@apilink ExpectationNotMet|expectation was not met}
     *
     * @param actual
     */
    isMetFor(actual: Answerable<Actual>): QuestionAdapter<ExpectationOutcome<unknown, Actual>> {
        return Question.about(this.subject, actor => this.predicate(actor, actual));
    }

    /**
     * @inheritDoc
     */
    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return this.subject;
    }
}
