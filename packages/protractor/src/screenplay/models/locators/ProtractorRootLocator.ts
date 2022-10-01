import { RootLocator } from '@serenity-js/web';
import * as protractor from 'protractor';

import { promised } from '../../promised';

/**
 * Protractor-specific implementation of {@apilink RootLocator}.
 *
 * @group Models
 */
export class ProtractorRootLocator extends RootLocator<protractor.ElementFinder> {
    constructor(private readonly browser: protractor.ProtractorBrowser) {
        super();
    }

    async isPresent(): Promise<boolean> {
        return true;
    }

    async nativeElement(): Promise<Pick<protractor.ElementFinder, 'element' | 'all'>> {
        return {
            element: this.browser.element.bind(this.browser),
            all:     this.browser.element.all.bind(this.browser),
        };
    }

    async switchToFrame(element: protractor.ElementFinder): Promise<void> {
        // https://github.com/angular/protractor/issues/1846#issuecomment-82634739;
        const webElement = await element.getWebElement();

        await promised(this.browser.switchTo().frame(webElement));
    }

    async switchToParentFrame(): Promise<void> {
        await promised(this.browser.driver.switchToParentFrame());
    }

    async switchToMainFrame(): Promise<void> {
        await promised(this.browser.driver.switchTo().defaultContent());
    }
}
