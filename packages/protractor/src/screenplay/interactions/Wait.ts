import { Expectation, ExpectationMet, Outcome } from '@serenity-js/assertions';
import { Answerable, AnswersQuestions, AssertionError, Duration, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { BrowseTheWeb } from '../abilities';

export class Wait {
    static Default_Timeout = Duration.ofSeconds(5);

    static for(duration: Answerable<Duration>): Interaction {
        return new WaitFor(duration);
    }

    static upTo(duration: Duration) {
        return {    // esdoc doesn't understand the fat arrow notation with generics, hence this 'function' here
            until: function until<Actual>(actual: Answerable<Actual>, expectation: Expectation<any, Actual>): Interaction {
                return new WaitUntil(actual, expectation, duration);
            },
        };
    }

    static until<Actual>(actual: Answerable<Actual>, expectation: Expectation<any, Actual>): Interaction {
        return new WaitUntil(actual, expectation, Wait.Default_Timeout);
    }
}

/**
 * @package
 */
class WaitFor extends Interaction {
    constructor(private readonly duration: Answerable<Duration>) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.duration).then(duration => BrowseTheWeb.as(actor).sleep(duration.inMilliseconds()));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted`#actor waits for ${ this.duration }`;
    }
}

/**
 * @package
 */
class WaitUntil<Actual> extends Interaction {
    constructor(
        private readonly actual: Answerable<Actual>,
        private readonly expectation: Expectation<any, Actual>,
        private readonly timeout: Duration,
    ) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        const
            actual      = this.actual,
            expectation = this.expectation.answeredBy(actor);

        let expectationOutcome: Outcome<any, Actual>;

        return BrowseTheWeb.as(actor)
            .wait(function () {
                    return actor.answer(actual)
                        .then(act => expectation(act))
                        .then(outcome => {
                            expectationOutcome = outcome;

                            return outcome instanceof ExpectationMet;
                        });
                },
                this.timeout.inMilliseconds(),
            )
            .then(_ => void 0)
            .catch(error => {
                if (!! expectationOutcome) {
                    throw new AssertionError(
                        `Waited ${ this.timeout.toString() } for ${ formatted `${ this.actual }` } to ${ this.expectation.toString() }`,
                        expectationOutcome.expected,
                        expectationOutcome.actual,
                        error,
                    );
                }

                throw error;
            });
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted`#actor waits up to ${ this.timeout } until ${ this.actual } does ${ this.expectation }`;
    }
}
