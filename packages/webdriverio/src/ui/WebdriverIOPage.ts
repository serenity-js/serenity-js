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
}
