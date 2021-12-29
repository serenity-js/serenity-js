import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';

import { PageElement } from '../screenplay';

/**
 * @desc
 *  A convenience method to create a custom {@link PageElement}-related {@link @serenity-js/core/lib/screenplay/questions~Expectation}
 *
 * @example <caption>Defining an expectation</caption>
 *  import { Expectation } from '@serenity-js/core';
 *  import { ElementExpectation, PageElement } from '@serenity-js/web';
 *
 *  export function isPresent(): Expectation<boolean, PageElement> {
 *      return ElementExpectation.forElementTo('become present', actual => actual.isPresent());
 *  }
 *
 * @example <caption>Using an expectation in an assertion</caption>
 *  import { Ensure } from '@serenity-js/assertions';
 *  import { actorCalled } from '@serenity-js/core';
 *  import { By, PageElement } from '@serenity-js/web';
 *
 *  const submitButton = () =>
 *      PageElement.located(By.css('.submit')).describedAs('submit button');
 *
 *  actorCalled('Izzy').attemptsTo(
 *      Ensure.that(submitButton(), isPresent())
 *  );
 *
 * @example <caption>Using an expectation in a synchronisation statement</caption>
 *  import { actorCalled, Duration } from '@serenity-js/core';
 *  import { By, PageElement, Wait } from '@serenity-js/web';
 *
 *  const submitButton = () =>
 *      PageElement.located(By.css('.submit')).describedAs('submit button');
 *
 *  actorCalled('Izzy').attemptsTo(
 *      Wait.upTo(Duration.ofSeconds(2)).until(submitButton(), isPresent())
 *  );
 *
 * @public
 * @extends {@serenity-js/core/lib/screenplay/questions~Expectation}
 */
export class ElementExpectation extends Expectation<any, PageElement> {

    /**
     * @desc
     *  Creates an {@link @serenity-js/core/lib/screenplay/questions~Expectation}
     *
     * @example <caption>Defining an expectation</caption>
     *  import { Expectation } from '@serenity-js/core';
     *  import { ElementExpectation, PageElement } from '@serenity-js/web';
     *
     *  export function isPresent(): Expectation<boolean, PageElement> {
     *      return ElementExpectation.forElementTo('become present', actual => actual.isPresent());
     *  }
     *
     * @param {string} description
     *  A description of the expectation.
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
     *  - `has value greater than Y`.
     *
     *  Descriptions like "is present", "is active", "equals X", "is greater than Y" WILL NOT work well.
     *
     * @param {function(actual: PageElement): Promise<boolean>} fn
     *  An asynchronous callback function that receives a {@link PageElement} and returns a {@link Promise}
     *  that should resolve to `true` when the expectation is met, and `false` otherwise.
     *
     * @returns {ElementExpectation<any, PageElement>}
     */
    static forElementTo(description: string, fn: (actual: PageElement) => Promise<boolean>): Expectation<any, PageElement> {
        return new ElementExpectation(description, fn);
    }

    /**
     * @param {string} description
     * @param {function(actual: PageElement): Promise<boolean>} fn
     */
    constructor(
        description: string,
        private readonly fn: (actual: PageElement) => Promise<boolean>,
    ) {
        super(description);
    }

    /**
     * @param {@serenity-js/core/lib/screenplay/actor~AnswersQuestions} actor
     * @returns {function(actual: PageElement): Promise<ExpectationOutcome<boolean, PageElement>>}
     */
    answeredBy(actor: AnswersQuestions): (actual: PageElement) => Promise<ExpectationOutcome<boolean, PageElement>> {
        return (actual: PageElement) =>
            this.fn(actual)
                .then(expectationMet =>
                    expectationMet
                        ? new ExpectationMet(this.toString(), undefined, actual)
                        : new ExpectationNotMet(this.toString(), undefined, actual),
                )
                .catch(error => {
                    return new ExpectationNotMet(`${ this.toString() } (${ error.message })`, undefined, actual);
                });
    }
}
