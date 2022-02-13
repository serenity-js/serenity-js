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
        return this.switchToAndPerform(async browser => {
            return browser.getTitle();
        });
    }

    name(): Promise<string> {
        return this.switchToAndPerform(async browser => {
            return browser.execute(`return window.name`);
        });
    }

    async url(): Promise<URL> {
        return this.switchToAndPerform(async browser => {
            return new URL(await browser.getUrl());
        });
    }

    async viewportSize(): Promise<{ width: number, height: number }> {
        return this.switchToAndPerform(async browser => {
            if (! browser.isDevTools) {
                const calculatedViewportSize = await browser.execute(`
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

            return browser.getWindowSize();
        });
    }

    setViewportSize(size: { width: number, height: number }): Promise<void> {
        return this.switchToAndPerform(async browser => {
            let desiredWindowSize = size;

            if (! browser.isDevTools) {
                desiredWindowSize = await browser.execute(`
                var currentViewportWidth  = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
                var currentViewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                
                return {
                    width:  Math.max(window.outerWidth  - currentViewportWidth  + ${ size.width },  ${ size.width }),
                    height: Math.max(window.outerHeight - currentViewportHeight + ${ size.height }, ${ size.height }),
                };
            `);
            }

            return browser.setWindowSize(desiredWindowSize.width, desiredWindowSize.height);
        });
    }

    async close(): Promise<void> {
        return this.switchToAndPerform(browser => browser.closeWindow());
    }

    async closeOthers(): Promise<void> {
        const windowHandles = await this.browser.getWindowHandles();

        for (const handle of windowHandles) {
            if (handle !== this.handle) {
                await this.browser.switchToWindow(handle);
                await this.browser.closeWindow();
            }
        }

        await this.browser.switchToWindow(this.handle);
    }

    async isPresent(): Promise<boolean> {
        const currentPageHandle = await this.browser.getWindowHandle();
        const desiredPageHandle = this.handle;

        const isOpen = await this.browser.switchToWindow(desiredPageHandle).then(() => true, _error => false);

        await this.browser.switchToWindow(currentPageHandle);

        return isOpen;
    }

    async switchTo(): Promise<{ switchBack(): Promise<void> }> {
        const originalWindowHandle = await this.browser.getWindowHandle();

        await this.browser.switchToWindow(this.handle);

        return {
            switchBack: async (): Promise<void> => {
                await this.browser.switchToWindow(originalWindowHandle);
            }
        }
    }

    private async switchToAndPerform<T>(action: (browser: wdio.Browser<'async'>) => Promise<T> | T): Promise<T> {
        const currentPageHandle = await this.browser.getWindowHandle();
        const desiredPageHandle = this.handle;
        const shouldSwitch      = currentPageHandle !== desiredPageHandle;

        if (shouldSwitch) {
            await this.browser.switchToWindow(desiredPageHandle);
        }

        const result = await action(this.browser);

        if (shouldSwitch) {
            await this.browser.switchToWindow(currentPageHandle);
        }

        return result;
    }
}
