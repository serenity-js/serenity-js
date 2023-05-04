import { RootLocator } from '@serenity-js/web';
import type { Browser, Element } from 'webdriverio';

/**
 * WebdriverIO-specific implementation of {@apilink RootLocator}.
 *
 * @group Models
 */
export class WebdriverIORootLocator extends RootLocator<Browser> {
    constructor(private readonly browser: Browser) {
        super();
    }

    async isPresent(): Promise<boolean> {
        return true;
    }

    async nativeElement(): Promise<Pick<Browser, '$' | '$$'>> {
        return this.browser;
    }

    async switchToFrame(frame: Element): Promise<void> {
        await this.browser.switchToFrame(frame);
    }

    async switchToParentFrame(): Promise<void> {
        await this.browser.switchToParentFrame();
    }

    async switchToMainFrame(): Promise<void> {
        await this.browser.switchToFrame(null); // eslint-disable-line unicorn/no-null
    }
}
