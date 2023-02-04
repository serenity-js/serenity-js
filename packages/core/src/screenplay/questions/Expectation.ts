import { JSONValue } from 'tiny-types';

import { asyncMap, d } from '../../io';
import { Answerable, AnswersQuestions, ExpectationDetails, ExpectationMet, ExpectationNotMet, Question, QuestionAdapter } from '../';
import { ExpectationOutcome } from './expectations';

/**
 * @group Expectations
 */
export type Predicate<Actual> = (actor: AnswersQuestions, actual: Answerable<Actual>) =>
    Promise<ExpectationOutcome> | ExpectationOutcome;     // eslint-disable-line @typescript-eslint/indent

type AnswerableArguments<Arguments extends Array<unknown>> = { [Index in keyof Arguments]: Answerable<Arguments[Index]> };

/**
 * Defines an expectation to be used with {@apilink @apilink Wait.until}, {@apilink Check.whether}, {@apilink Ensure.that}
 * and as part of the Page Element Query Language with {@apilink PageElements.where} and {@apilink List.where}.
 *
 * @group Expectations
 */
export class Expectation<Actual> {

    /**
     * A factory method to that makes defining custom {@apilink Expectation|expectations} easier
     *
     * #### Defining a custom expectation
     *
     * ```ts
     * import { Expectation } from '@serenity-js/core'
     * import { PageElement } from '@serenity-js/web'
     *
     * const isEmpty = Expectation.define(
     *   'isEmpty',         // name of the expectation function to be used when producing an AssertionError
     *   'become empty',    // human-readable description of the relationship between expected and actual values
     *   async (actual: PageElement) => {
     *     const value = await actual.value();
     *     return value.length === 0;
     *   }
     * )
     * ```
     *
     * #### Using a custom expectation in an assertion
     *
     * ```ts
     * import { Ensure } from '@serenity-js/assertions'
     * import { actorCalled } from '@serenity-js/core'
     * import { By, Clear, PageElement } from '@serenity-js/web'
     *
     * const nameField = () =>
     *   PageElement.located(By.css('[data-test-id="name"]')).describedAs('name field');
     *
     * await actorCalled('Izzy').attemptsTo(
     *   Clear.the(nameField()),
     *   Ensure.that(nameField(), isEmpty())
     * )
     * ```
     *
     * #### Using a custom expectation in a control flow statement
     *
     * ```ts
     * import { not } from '@serenity-js/assertions'
     * import { actorCalled, Check, Duration, Wait } from '@serenity-js/core'
     * import { By, PageElement } from '@serenity-js/web'
     *
     * const nameField = () =>
     *   PageElement.located(By.css('[data-test-id="name"]')).describedAs('name field');
     *
     * await actorCalled('Izzy').attemptsTo(
     *   Check.whether(nameField(), isEmpty())
     *     .andIfSo(
     *       Enter.theValue(actorInTheSpotlight().name).into(nameField()),
     *     ),
     * )
     * ```
     *
     * #### Using a custom expectation in a synchronisation statement
     *
     * ```ts
     * import { not } from '@serenity-js/assertions'
     * import { actorCalled, Duration, Wait } from '@serenity-js/core'
     * import { By, PageElement } from '@serenity-js/web'
     *
     * const nameField = () =>
     *   PageElement.located(By.css('[data-test-id="name"]')).describedAs('name field');
     *
     * await actorCalled('Izzy').attemptsTo(
     *   Enter.theValue(actorInTheSpotlight().name).into(nameField()),
     *
     *   Wait.upTo(Duration.ofSeconds(2))
     *     .until(nameField(), not(isEmpty())),
     * )
     * ```
     *
     * #### Learn more
     * - {@apilink Ensure}
     * - {@apilink Check}
     * - {@apilink Wait}
     *
     * @param functionName
     *  Name of the expectation function to be used when producing an {@apilink AssertionError}
     *
     * @param relationship
     *  Human-readable description of the relationship between the `expected` and the `actual` values.
     *  Used when reporting {@apilink Activity|activities} performed by an {@apilink Actor|actor}
     *
     * @param predicate
     */
    static define<Actual_Type, PredicateArguments extends Array<unknown>>(
        functionName: string,
        relationship: ((...answerableArguments: AnswerableArguments<PredicateArguments>) => string) | string,
        predicate: (actual: Actual_Type, ...predicateArguments: PredicateArguments) => Promise<boolean> | boolean,
    ): (...answerableArguments: AnswerableArguments<PredicateArguments>) => Expectation<Actual_Type>
    {
        return Object.defineProperty(function(...answerableArguments: AnswerableArguments<PredicateArguments>): Expectation<Actual_Type> {
            const description = typeof relationship === 'function' ? relationship(...answerableArguments)
                : (answerableArguments.length === 1 ? relationship.trim() + d` ${answerableArguments[0]}`
                    : relationship);

            return new Expectation<Actual_Type>(
                functionName,
                description,
                async (actor: AnswersQuestions, actualValue: Answerable<Actual_Type>): Promise<ExpectationOutcome> => {
                    const predicateArguments = await asyncMap(answerableArguments, answerableArgument =>
                        actor.answer(answerableArgument as Answerable<JSONValue>)
                    );

                    const actual    = await actor.answer(actualValue);

                    const result    = await predicate(actual, ...predicateArguments as PredicateArguments);

                    const expectationDetails = ExpectationDetails.of(functionName, ...predicateArguments);

                    const expected = predicateArguments.length > 0
                        ? predicateArguments[0]
                        : true;     // the only parameter-less expectations are boolean ones like `isPresent`, `isActive`, etc.

                    return result
                        ? new ExpectationMet(description, expectationDetails, expected, actual)
                        : new ExpectationNotMet(description, expectationDetails, expected, actual);
                }
            )
        }, 'name', {value: functionName, writable: false});
    }

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
                const message = relationshipName + ' ' + d`${expectedValue}`;

                return new Expectation<Actual_Type>(
                    'unknown',
                    message,
                    async (actor: AnswersQuestions, actualValue: Answerable<Actual_Type>): Promise<ExpectationOutcome> => {
                        const expected  = await actor.answer(expectedValue);
                        const actual    = await actor.answer(actualValue);

                        const result    = await simplifiedPredicate(actual, expected);
                        const expectationDetails = ExpectationDetails.of('unknown');

                        return result
                            ? new ExpectationMet(message, expectationDetails, expected, actual)
                            : new ExpectationNotMet(message, expectationDetails, expected, actual);
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
    static to<Actual_Type>(relationshipName: string): {
        soThatActual: (expectation: Expectation<Actual_Type>) => Expectation<Actual_Type>,
    } {
        return {
            soThatActual: (expectation: Expectation<Actual_Type>): Expectation<Actual_Type> => {
                return new Expectation<Actual_Type>(
                    'unknown',
                    relationshipName,
                    async (actor: AnswersQuestions, actualValue: Answerable<Actual_Type>): Promise<ExpectationOutcome> => {
                        return await actor.answer(expectation.isMetFor(actualValue));
                    }
                );
            },
        };
    }

    protected constructor(
        private readonly functionName: string,
        private description: string,
        private readonly predicate: Predicate<Actual>
    ) {
    }

    /**
     * Returns a {@apilink QuestionAdapter} that resolves to {@apilink ExpectationOutcome}
     * indicating that the {@apilink ExpectationMet|expectation was met}
     * or that the {@apilink ExpectationNotMet|expectation was not met}
     *
     * @param actual
     */
    isMetFor(actual: Answerable<Actual>): QuestionAdapter<ExpectationOutcome> {
        return Question.about(this.description, actor => this.predicate(actor, actual));
    }

    /**
     * @inheritDoc
     */
    describedAs(subject: string): this {
        this.description = subject;
        return this;
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return this.description;
    }
}
