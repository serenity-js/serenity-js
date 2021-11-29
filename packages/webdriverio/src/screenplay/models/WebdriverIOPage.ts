import { Page } from '@serenity-js/web';
import { URL } from 'url';
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

    async url(): Promise<URL> {
        return new URL(await this.browser.getUrl());
    }

    async viewportSize(): Promise<{ width: number, height: number }> {
        if (! this.browser.isDevTools) {
            const calculatedViewportSize = await this.browser.execute(`
                return {
                    width:  Math.max(document.documentElement.clientWidth,  window.innerWidth || 0),
                    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                }
            `) as { width: number, height: number };

            // Chrome headless hard-codes window.innerWidth and window.innerHeight to 0
            if (calculatedViewportSize.width > 0 && calculatedViewportSize.height > 0) {
                return calculatedViewportSize;
            }
        }

        return this.browser.getWindowSize();
    }

    async setViewportSize(size: { width: number, height: number }): Promise<void> {
        let desiredWindowSize = size;

        if (! this.browser.isDevTools) {
            desiredWindowSize = await this.browser.execute(`
                var currentViewportWidth  = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
                var currentViewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                
                return {
                    width:  Math.max(window.outerWidth  - currentViewportWidth  + ${ size.width },  ${ size.width }),
                    height: Math.max(window.outerHeight - currentViewportHeight + ${ size.height }, ${ size.height }),
                };
            `);
        }

        return this.browser.setWindowSize(desiredWindowSize.width, desiredWindowSize.height);
    }
}
