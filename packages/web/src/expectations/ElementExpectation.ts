import { Answerable, AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet } from '@serenity-js/core';

import { PageElement } from '../screenplay';

/**
 * A factory method to that makes defining custom {@apilink PageElement}-related {@apilink Expectation|expectations} easier
 *
 * ## Defining a custom expectation
 *
 * ```ts
 * import { Expectation } from '@serenity-js/core'
 * import { ElementExpectation, PageElement } from '@serenity-js/web'
 *
 * export function isEmpty(): Expectation<boolean, PageElement> {
 *   return ElementExpectation.forElementTo('have an empty value', async actual => {
 *     const value = await actual.value();
 *     return value.length === 0;
 *   })
 * }
 * ```
 *
 * ## Using an expectation in an assertion
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
 * ## Using an expectation in a control flow statement
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
 * ## Using an expectation in a synchronisation statement
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
 * ## Learn more
 * - {@apilink Expectation}
 * - {@apilink Ensure}
 * - {@apilink Check}
 * - {@apilink Wait}
 *
 * @group Expectations
 */
export class ElementExpectation extends Expectation<PageElement> {

    /**
     * Instantiates a custom {@apilink PageElement}-specific {@apilink Expectation}
     *
     * #### Defining a custom expectation
     * ```ts
     * import { Expectation } from '@serenity-js/core'
     * import { ElementExpectation, PageElement } from '@serenity-js/web'
     *
     * export function isEmpty(): Expectation<boolean, PageElement> {
     *   return ElementExpectation.forElementTo('have an empty value', async actual => {
     *     const value = await actual.value();
     *     return value.length === 0;
     *   })
     * }
     * ```
     *
     * @param description
     *  A description of the expectation.
     *
     *  Please note that Serenity/JS will use it to describe your expectation in sentences like these:
     *  - `actor ensures that <something> does <description>`
     *  - `actor ensures that <something> does not <description>`
     *  - `actor waits until <something> does <description>`
     *  - `actor waits until <something> does not <description>`
     *
     *  To work with the above templates, the description should be similar to
     *  - `become present`,
     *  - `become active`,
     *  - `equal X`,
     *  - `have value greater than Y`,
     *  - `have an empty value`
     *
     *  **DO NOT** use descriptions like "is present", "is active", "equals X", "is greater than Y"
     *  as they won't read well in your test reports.
     *
     * @param fn
     *  An asynchronous callback function that receives a {@apilink PageElement} and returns a {@apilink Promise}
     *  that should resolve to `true` when the expectation is met, or `false` otherwise.
     */
    static forElementTo(description: string, fn: (actual: PageElement) => Promise<boolean>): Expectation<PageElement> {
        return new ElementExpectation(description, fn);
    }

    constructor(
        description: string,
        private readonly fn: (actual: PageElement) => Promise<boolean>,
    ) {
        super(
            description,
            async (actor: AnswersQuestions, actual: Answerable<PageElement>) => {
                const pageElement = await actor.answer(actual);

                const result = await fn(pageElement);

                return result
                    ? new ExpectationMet(this.toString(), undefined, pageElement)
                    : new ExpectationNotMet(this.toString(), undefined, pageElement);
            }
        );
    }
}
