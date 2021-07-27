import { Ensure } from '@serenity-js/assertions';
import {
    AnswersQuestions,
    Duration,
    Expectation,
    Interaction,
    PerformsActivities,
    UsesAbilities,
} from '@serenity-js/core';

import { ElementHandleAnswer } from '../../answerTypes/ElementHandleAnswer';
import { ElementHandleEvent } from '../../expectations/ElementHandleExpectation';
import { BrowseTheWeb } from '../abilities';
import { TargetElement } from '../questions/targets/TargetElement';

enum TimeMeasures {
    MIN = 60000,
    SEC = 1000,
    MS = 1,
}

export class Wait {
    static until(
        target: TargetElement,
        state: ElementHandleEvent & Expectation<boolean, ElementHandleAnswer>
    ): Interaction {
        return {
            performAs: async (
                actor: UsesAbilities & AnswersQuestions & PerformsActivities
            ): Promise<void> => {
                const targetInState = await target.whichShouldBecome(state);
                const answeredTarget = await actor.answer(targetInState);
                await actor.attemptsTo(Ensure.that(answeredTarget, state));
            },
        };
    }

    static for(duration: Duration): Interaction {
        return Timeout.of(duration);
    }
}

class Timeout extends Interaction {
    static of(duration: Duration) {
        return new this(duration.inMilliseconds(), TimeMeasures.MS);
    }

    constructor(
        private readonly timeout: number,
        private readonly measure: TimeMeasures
    ) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor
      .abilityTo(BrowseTheWeb)
      .waitForTimeout(this.timeout * this.measure);
    }
}
