import { Expectation, ExpectationMet, Outcome } from '@serenity-js/assertions';
import { AnswersQuestions, Duration, Interaction, KnowableUnknown, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { BrowseTheWeb } from '../abilities';

export class Wait {
    static Default_Timeout = Duration.ofSeconds(5);

    static for(duration: KnowableUnknown<Duration>): Interaction {
        return new WaitFor(duration);
    }

    static upTo(duration: Duration) {
        return {    // esdoc doesn't understand the fat arrow notation with generics, hence this 'function' here
            until: function until<Actual>(actual: KnowableUnknown<Actual>, expectation: Expectation<any, Actual>): Interaction {
                return new WaitUntil(actual, expectation, duration);
            },
        };
    }

    static until<Actual>(actual: KnowableUnknown<Actual>, expectation: Expectation<any, Actual>): Interaction {
        return new WaitUntil(actual, expectation, Wait.Default_Timeout);
    }
}

class WaitFor implements Interaction {
    constructor(private readonly duration: KnowableUnknown<Duration>) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.duration).then(duration => BrowseTheWeb.as(actor).sleep(duration.milliseconds));
    }

    toString(): string {
        return formatted`#actor waits for ${ this.duration }`;
    }
}

class WaitUntil<Actual> implements Interaction {
    constructor(
        private readonly actual: KnowableUnknown<Actual>,
        private readonly expectation: Expectation<any, Actual>,
        private readonly timeout: Duration,
    ) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        const
            actual = this.actual,
            expectation = this.expectation.answeredBy(actor);

        return BrowseTheWeb.as(actor).wait(function() {
                return actor.answer(actual)
                    .then(act => {
                        return expectation(act).then(outcome => outcome instanceof ExpectationMet);
                    });
            },
            this.timeout.milliseconds,
        ).then(_ => void 0);
    }

    toString(): string {
        return formatted`#actor waits until ${ this.actual } does ${ this.expectation }`;
    }
}
