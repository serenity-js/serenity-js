import 'webdriverio';

import { RootLocator } from '@serenity-js/web';

/**
 * WebdriverIO-specific implementation of [`RootLocator`](https://serenity-js.org/api/web/class/RootLocator/).
 *
 * @group Models
 */
export class WebdriverIORootLocator extends RootLocator<WebdriverIO.Element> {
    constructor(private readonly browser: WebdriverIO.Browser) {
        super();
    }

    async isPresent(): Promise<boolean> {
        return true;
    }

    async nativeElement(): Promise<Pick<WebdriverIO.Browser, '$' | '$$'>> {
        return this.browser;
    }

    async switchToFrame(frame: WebdriverIO.Element): Promise<void> {
        await this.browser.switchFrame(frame);
    }

    async switchToParentFrame(): Promise<void> {
        await this.browser.switchToParentFrame();
    }

    async switchToMainFrame(): Promise<void> {
        await this.browser.switchFrame(null); // eslint-disable-line unicorn/no-null
    }
}
