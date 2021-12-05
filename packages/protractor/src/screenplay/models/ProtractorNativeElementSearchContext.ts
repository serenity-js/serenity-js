import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';

export interface ProtractorNativeElementSearchContext {
    element: (selector: Locator) => ElementFinder;
    all: (selector: Locator) => ElementArrayFinder;
}
