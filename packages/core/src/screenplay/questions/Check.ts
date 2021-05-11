import { formatted } from '../../io';
import { Activity } from '../Activity';
import { AnswersQuestions, PerformsActivities } from '../actor';
import { Answerable } from '../Answerable';
import { Task } from '../Task';
import { Expectation } from './Expectation';
import { ExpectationMet } from './expectations';

/**
 * @desc
 *  A control flow statement that enables the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  either to choose whether or not to perform a series of activities,
 *  or to choose which of the two provided series of activities to perform.
 *
 * @example <caption>Choose from two alternatives</caption>
 *  import { equals } from '@serenity-js/assertions';
 *  import { Check } from '@serenity-js/core';
 *
 *  actor.attemptsTo(
 *      Check.whether(process.env.MODE, equals('prod'))
 *          .andIfSo(
 *              LogInAsProdUser(),
 *          )
 *          .otherwise(
 *              LogInAsTestUser(),
 *          )
 *  );
 *
 * @example <caption>Choose whether or not to perform an activity</caption>
 *  import { equals } from '@serenity-js/assertions';
 *  import { Check } from '@serenity-js/core';
 *  import { isDisplayed } from '@serenity-js/protractor';
 *
 *  actor.attemptsTo(
 *      Check.whether(NewsletterModal(), isDisplayed())
 *          .andIfSo(
 *              DismissModal(),
 *          )
 *  );
 *
 * @extends {@serenity-js/core/lib/screenplay~Task}
 *
 * @see https://en.wikipedia.org/wiki/Control_flow
 */
export class Check<Actual> extends Task {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static whether<A>(actual: Answerable<A>, expectation: Expectation<any, A>) {
        return {
            andIfSo: (...activities: Activity[]) => new Check(actual, expectation, activities),
        };
    }

    /**
     *
     * @param actual
     * @param expectation
     * @param activities
     * @param alternativeActivities
     */
    constructor(
        private readonly actual: Answerable<Actual>,
        private readonly expectation: Expectation<any, Actual>,
        private readonly activities: Activity[],
        private readonly alternativeActivities: Activity[] = [],
    ) {
        super();
    }

    /**
     * @param {...@serenity-js/core/lib/screenplay~Activity[]} alternativeActivities
     * @return {@serenity-js/core/lib/screenplay~Task}
     */
    otherwise(...alternativeActivities: Activity[]): Task {
        return new Check<Actual>(this.actual, this.expectation, this.activities, alternativeActivities);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Task}.
     *
     * @param {AnswersQuestions & PerformsActivities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~PerformsActivities}
     */
    performAs(actor: AnswersQuestions & PerformsActivities): PromiseLike<void> {
        return Promise.all([
            actor.answer(this.actual),
            actor.answer(this.expectation),
        ]).then(([actual, expectation]) =>
            expectation(actual).then(outcome =>
                outcome instanceof ExpectationMet
                    ? actor.attemptsTo(...this.activities)
                    : actor.attemptsTo(...this.alternativeActivities),
            ),
        );
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor checks whether ${ this.actual } does ${ this.expectation }`;
    }
}
