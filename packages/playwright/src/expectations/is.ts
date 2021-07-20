import { and } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';

import { ElementHandleAnswer } from '../answerTypes/ElementHandleAnswer';
import { ElementHandleExpectation } from './ElementHandleExpectation';

const isAttachedFunction = (actual) => actual.isExisting();
const isVisibleFunction = (actual) => isAttachedFunction(actual) && actual.isVisible();

const isDisabled = (): Expectation<any, ElementHandleAnswer> => {
    return ElementHandleExpectation.forElementToBe('disabled', (actual) =>
        actual.isDisabled()
    );
};

const isEnabledFunction = (): Expectation<any, ElementHandleAnswer> => {
    return ElementHandleExpectation.forElementToBe('enabled', (actual) =>
        actual.isEnabled()
    );
};

const isEditable = (): Expectation<any, ElementHandleAnswer> => {
    return ElementHandleExpectation.forElementToBe('editable', (actual) =>
        actual.isEditable()
    );
};

const isChecked = (): Expectation<any, ElementHandleAnswer> => {
    return ElementHandleExpectation.forElementToBe('checked', (actual) =>
        actual.isChecked()
    );
};

// TODO: isActive
// TODO: isSelected

export const isPresent = (): ElementHandleExpectation =>
    ElementHandleExpectation.forElementToBe('attached', async (actual) =>
        actual.isExisting()
    );

export const isVisible = (): ElementHandleExpectation => {
    return ElementHandleExpectation.forElementToBe('visible', isVisibleFunction);
};

export const isEnabled = (): Expectation<any, ElementHandleAnswer> => {
    return Expectation.to<ElementHandleAnswer>('be enabled').soThatActual(
        and(isVisible(), isEnabledFunction())
    );
};

export const isClickable = (): Expectation<any, ElementHandleAnswer> => {
    return Expectation.to<ElementHandleAnswer>('be clickable').soThatActual(
        and(isVisible(), isEnabled())
    );
};
