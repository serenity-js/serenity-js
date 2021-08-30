import { ElementHandleExpectation } from './ElementHandleExpectation';

export const isPresent = (): ElementHandleExpectation =>
    ElementHandleExpectation.forElementToBe('attached', async (actual) =>
        actual.isExisting(),
    );