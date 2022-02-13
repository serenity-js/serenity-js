import { LogicError } from '@serenity-js/core';
import { Frame, Locator } from '@serenity-js/web';
import * as wdio from 'webdriverio';

export class WebdriverIOFrame extends Frame<wdio.Element<'async'>> {
    constructor(
        private readonly browser: wdio.Browser<'async'>,
        locator: Locator<wdio.Element<'async'>>
    ) {
        super(locator);
    }

    async isPresent(): Promise<boolean> {
        const element = await this.locator.nativeElement();
        return element.isExisting();
    }

    async switchTo(): Promise<{ switchBack(): Promise<void> }> {
        const element: wdio.Element<'async'> = await this.locator.nativeElement()

        if (element.error) {
            throw new LogicError(`Couldn't locate frame ${ this.locator }`, element.error);
        }

        try {
            await this.browser.switchToFrame(element);

            return {
                switchBack: async (): Promise<void> => {
                    await this.browser.switchToParentFrame();
                }
            }
        }
        catch (error) {
            throw new LogicError(`Couldn't switch to a frame located ${ this.locator }`, error);
        }
    }
}
