import { ElementArrayFinder, ElementFinder, Locator } from 'protractor';

export interface ProtractorNativeElementRoot {
    element(selector: Locator): ElementFinder;
    all(selector: Locator): ElementArrayFinder;
}
