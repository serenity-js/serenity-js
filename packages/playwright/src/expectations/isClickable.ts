import { and } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import { ElementHandleAnswer } from '../answerTypes/ElementHandleAnswer';
import { isEnabled, isVisible } from '.';

export const isClickable = (): Expectation<any, ElementHandleAnswer> => {
    return Expectation.to<ElementHandleAnswer>('be clickable').soThatActual(
        and(isVisible(), isEnabled()),
    );
};