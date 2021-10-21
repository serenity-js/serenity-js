import { Page } from '@serenity-js/web';
import * as wdio from 'webdriverio';

export class WebdriverIOPage extends Page {
    constructor(
        private readonly browser: wdio.Browser<'async'>,
        handle: string
    ) {
        super(handle);
    }

    title(): Promise<string> {
        return this.browser.getTitle();
    }

    viewportSize(): Promise<{ width: number, height: number }> {
        return this.browser.getWindowSize();
    }

    setViewportSize(size: { width: number, height: number }): Promise<void> {
        return this.browser.setWindowSize(size.width, size.height);
    }
}
