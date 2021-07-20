import {
    AnswersQuestions,
    Expectation,
    ExpectationMet,
    ExpectationNotMet,
    ExpectationOutcome,
} from '@serenity-js/core';

import { ElementHandleAnswer } from '../answerTypes/ElementHandleAnswer';

/**
 * @access private
 */

type ElementEvent = 'attached' | 'visible' | 'hidden';

type ElementState = 'visible' | 'disabled' | 'enabled' | 'editable' | 'checked' | 'attached' | 'clickable';

const expectedEvents = new Map<ElementState, ElementEvent>([
    ['visible', 'visible'],
    ['disabled', 'visible'],
    ['enabled', 'visible'],
    ['editable', 'visible'],
    ['checked', 'visible'],
    ['attached', 'attached'],
    ['clickable', 'visible'],
]);

export interface ElementHandleEvent {
    expectedEvent(): ElementEvent;
}

export class ElementHandleExpectation extends Expectation<any, ElementHandleAnswer> implements ElementHandleEvent {
    static forElementToBe(
        message: ElementState,
        fn: (actual: ElementHandleAnswer) => PromiseLike<boolean>
    ): ElementHandleExpectation {
        return new ElementHandleExpectation(message, fn);
    }

    protected constructor(
        protected readonly state: ElementState,
        private readonly fn: (actual: ElementHandleAnswer) => PromiseLike<boolean>
    ) {
        super(`be ${state}`);
    }

    expectedEvent(): ElementEvent {
        return expectedEvents.get(this.state);
    }

    answeredBy(
        actor: AnswersQuestions
    ): (actual: ElementHandleAnswer) => Promise<ExpectationOutcome<boolean, ElementHandleAnswer>> {
        return async (actual: ElementHandleAnswer) => {
            const checkResult = await this.fn(actual);
            return checkResult
                ? new ExpectationMet(this.toString(), undefined, actual)
                : new ExpectationNotMet(this.toString(), undefined, actual);
        };
    }
}
