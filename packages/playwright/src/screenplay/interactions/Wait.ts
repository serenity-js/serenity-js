import { Ensure } from '@serenity-js/assertions';
import {
    AnswersQuestions,
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

interface TimeoutBuilder {
    seconds(): Timeout;
    milliseconds(): Timeout;
    minutes(): Timeout;
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

    public static for(timeToWait: number): TimeoutBuilder {
        return {
            seconds: () => new Timeout(timeToWait, TimeMeasures.SEC),
            milliseconds: () => new Timeout(timeToWait, TimeMeasures.MS),
            minutes: () => new Timeout(timeToWait, TimeMeasures.MIN),
        };
    }
}

class Timeout extends Interaction {
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
