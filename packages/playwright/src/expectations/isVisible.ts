import { ElementHandleExpectation } from './ElementHandleExpectation';

const isAttachedFunction = (actual) => actual.isExisting();
const isVisibleFunction = (actual) => isAttachedFunction(actual) && actual.isVisible();

export const isVisible = (): ElementHandleExpectation => {
    return ElementHandleExpectation.forElementToBe('visible', isVisibleFunction);
};