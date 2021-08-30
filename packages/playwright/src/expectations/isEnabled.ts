import { and } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import { ElementHandleAnswer } from '../answerTypes/ElementHandleAnswer';
import { isVisible } from '.';
import { ElementHandleExpectation } from './ElementHandleExpectation';

const isEnabledFunction = (): Expectation<any, ElementHandleAnswer> => {
    return ElementHandleExpectation.forElementToBe('enabled', (actual) =>
        actual.isEnabled(),
    );
};

export const isEnabled = (): Expectation<any, ElementHandleAnswer> => {
    return Expectation.to<ElementHandleAnswer>('be enabled').soThatActual(
        and(isVisible(), isEnabledFunction()),
    );
};