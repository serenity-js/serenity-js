import { RootLocator } from '@serenity-js/web';
import * as wdio from 'webdriverio';

/**
 * WebdriverIO-specific implementation of {@apilink RootLocator}.
 *
 * @group Models
 */
export class WebdriverIORootLocator extends RootLocator<wdio.Browser> {
    constructor(private readonly browser: wdio.Browser) {
        super();
    }

    async isPresent(): Promise<boolean> {
        return true;
    }

    async nativeElement(): Promise<Pick<wdio.Browser, '$' | '$$'>> {
        return this.browser;
    }

    async switchToFrame(frame: wdio.Element): Promise<void> {
        await this.browser.switchToFrame(frame);
    }

    async switchToParentFrame(): Promise<void> {
        await this.browser.switchToParentFrame();
    }

    async switchToMainFrame(): Promise<void> {
        await this.browser.switchToFrame(null); // eslint-disable-line unicorn/no-null
    }
}
