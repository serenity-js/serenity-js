import { Page } from '@serenity-js/web';
import { ProtractorBrowser } from 'protractor';
import { URL } from 'url';

import { promiseOf } from '../../promiseOf';

export class ProtractorPage extends Page {
    constructor(
        private readonly browser: ProtractorBrowser,
        handle: string
    ) {
        super(handle);
    }

    title(): Promise<string> {
        return promiseOf(this.browser.getTitle());
    }

    async url(): Promise<URL> {
        return new URL(await promiseOf(this.browser.getCurrentUrl()));
    }

    async viewportSize(): Promise<{ width: number, height: number }> {

        const calculatedViewportSize = await promiseOf(this.browser.executeScript(
            `return {
                width:  Math.max(document.documentElement.clientWidth,  window.innerWidth || 0),
                height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
            };`
        )) as { width: number, height: number };

        if (calculatedViewportSize.width > 0 && calculatedViewportSize.height > 0) {
            return calculatedViewportSize;
        }

        // Chrome headless hard-codes window.innerWidth and window.innerHeight to 0
        return promiseOf(this.browser.manage().window().getSize());
    }

    async setViewportSize(size: { width: number, height: number }): Promise<void> {
        const desiredWindowSize: { width: number, height: number } = await promiseOf(this.browser.executeScript(`
            var currentViewportWidth  = Math.max(document.documentElement.clientWidth,  window.innerWidth || 0)
            var currentViewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
            
            return {
                width:  Math.max(window.outerWidth  - currentViewportWidth  + ${ size.width },  ${ size.width }),
                height: Math.max(window.outerHeight - currentViewportHeight + ${ size.height }, ${ size.height }),
            };
        `));

        return promiseOf(this.browser.manage().window().setSize(desiredWindowSize.width, desiredWindowSize.height));
    }
}
