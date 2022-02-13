import { LogicError } from '@serenity-js/core';
import { Frame, Locator } from '@serenity-js/web';
import { ElementFinder, ProtractorBrowser, WebElement } from 'protractor';

export class ProtractorFrame extends Frame<ElementFinder> {
    constructor(
        private readonly browser: ProtractorBrowser,
        locator: Locator<ElementFinder>
    ) {
        super(locator);
    }

    async isPresent(): Promise<boolean> {
        const element: ElementFinder = await this.locator.nativeElement();

        return element.isPresent();
    }

    async switchTo(): Promise<{ switchBack(): Promise<void> }> {
        const element: ElementFinder = await this.locator.nativeElement()

        let webElement: WebElement;

        try {
            // https://github.com/angular/protractor/issues/1846#issuecomment-82634739;
            webElement = await element.getWebElement();
        } catch (error) {
            throw new LogicError(`Couldn't locate frame ${ this.locator }`, error);
        }

        try {
            await this.browser.switchTo().frame(webElement);

            return {
                switchBack: async (): Promise<void> => {
                    await this.browser.driver.switchToParentFrame();
                }
            }
        }
        catch (error) {
            throw new LogicError(`Couldn't switch to a frame located ${ this.locator }`, error);
        }
    }
}
