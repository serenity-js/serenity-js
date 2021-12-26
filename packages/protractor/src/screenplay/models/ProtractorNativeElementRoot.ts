import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';

export interface ProtractorNativeElementRoot {
    element: {
        (selector: Locator): ElementFinder;
        all?: (selector: Locator) => ElementArrayFinder;    // ProtractorBrowser implementation
    }
    all?: (selector: Locator) => ElementArrayFinder;        // ElementFinder implementation
}
