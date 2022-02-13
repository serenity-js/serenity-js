import { Page } from '@serenity-js/web';
import { ProtractorBrowser } from 'protractor';
import { URL } from 'url';

import { promised } from '../promised';

export class ProtractorPage extends Page {
    constructor(
        private readonly browser: ProtractorBrowser,
        handle: string
    ) {
        super(handle);
    }

    title(): Promise<string> {
        return this.switchToAndPerform(async browser => {
            return promised(browser.getTitle());
        });
    }

    name(): Promise<string> {
        return this.switchToAndPerform(async browser => {
            return promised(browser.executeScript('return window.name'));
        });
    }

    url(): Promise<URL> {
        return this.switchToAndPerform(async browser => {
            return new URL(await promised(browser.getCurrentUrl()));
        });
    }

    async viewportSize(): Promise<{ width: number, height: number }> {
        return this.switchToAndPerform(async browser => {
            const calculatedViewportSize = await promised(browser.executeScript(
                `return {
                    width:  Math.max(document.documentElement.clientWidth,  window.innerWidth || 0),
                    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                };`
            )) as { width: number, height: number };

            if (calculatedViewportSize.width > 0 && calculatedViewportSize.height > 0) {
                return calculatedViewportSize;
            }

            // Chrome headless hard-codes window.innerWidth and window.innerHeight to 0
            return promised(browser.manage().window().getSize());
        });
    }

    async setViewportSize(size: { width: number, height: number }): Promise<void> {
        return this.switchToAndPerform(async browser => {
            const desiredWindowSize: { width: number, height: number } = await promised(browser.executeScript(`
                var currentViewportWidth  = Math.max(document.documentElement.clientWidth,  window.innerWidth || 0)
                var currentViewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                
                return {
                    width:  Math.max(window.outerWidth  - currentViewportWidth  + ${ size.width },  ${ size.width }),
                    height: Math.max(window.outerHeight - currentViewportHeight + ${ size.height }, ${ size.height }),
                };
            `));

            return promised(browser.manage().window().setSize(desiredWindowSize.width, desiredWindowSize.height));
        });
    }

    async close(): Promise<void> {
        return this.switchToAndPerform(browser => promised(browser.close()));
    }

    async closeOthers(): Promise<void> {
        const windowHandles = await this.browser.getAllWindowHandles();

        for (const handle of windowHandles) {
            if (handle !== this.handle) {
                await this.browser.switchTo().window(handle);
                await this.browser.close();
            }
        }

        await this.browser.switchTo().window(this.handle);
    }

    async isPresent(): Promise<boolean> {
        const currentPageHandle = await this.browser.getWindowHandle();
        const desiredPageHandle = this.handle;

        const isOpen = await this.browser.switchTo().window(desiredPageHandle).then(() => true, _error => false);

        await this.browser.switchTo().window(currentPageHandle);

        return isOpen;
    }

    async switchTo(): Promise<{ switchBack(): Promise<void> }> {
        const originalWindowHandle = await this.browser.getWindowHandle();

        await this.browser.switchTo().window(this.handle);

        return {
            switchBack: async (): Promise<void> => {
                await this.browser.switchTo().window(originalWindowHandle);
            }
        }
    }

    private async switchToAndPerform<T>(action: (browser: ProtractorBrowser) => Promise<T> | T): Promise<T> {
        const originalPageHandle  = await this.browser.getWindowHandle();
        const desiredPageHandle   = this.handle;
        const shouldSwitch        = originalPageHandle !== desiredPageHandle;

        if (shouldSwitch) {
            await this.browser.switchTo().window(desiredPageHandle);
        }

        const result = await action(this.browser);

        if (shouldSwitch) {
            await this.browser.switchTo().window(originalPageHandle);
        }

        return result;
    }
}
