import { Page, PageElement, PageElements, Selector, SwitchableOrigin } from '@serenity-js/web';
import * as playwright from 'playwright-core';
import { URL } from 'url';

import { PlaywrightLocator } from './locators';
import { PlaywrightPageElement } from './PlaywrightPageElement';

export class PlaywrightPage extends Page<playwright.ElementHandle> {
    constructor(
        private readonly context: playwright.BrowserContext,
        private readonly page: playwright.Page,
    ) {
        super('playwright');
    }

    locate(selector: Selector): PageElement<playwright.ElementHandle> {
        return new PlaywrightPageElement(
            new PlaywrightLocator(() => this.page, selector)
        )
    }

    locateAll(selector: Selector): PageElements<playwright.ElementHandle> {
        return new PageElements(
            new PlaywrightLocator(() => this.page, selector)
        );
    }

    title(): Promise<string> {
        return this.page.title();
    }

    name(): Promise<string> {
        return this.page.evaluate(() => window.name);
    }

    async url(): Promise<URL> {
        return new URL(this.page.url());
    }

    async viewportSize(): Promise<{ width: number, height: number }> {
        return this.page.viewportSize();
    }

    setViewportSize(size: { width: number, height: number }): Promise<void> {
        return this.page.setViewportSize(size);
    }

    async close(): Promise<void> {
        return this.page.close();
    }

    async closeOthers(): Promise<void> {
        for (const page of this.context.pages()) {
            if (page !== this.page) {
                await page.close();
            }
        }
    }

    async isPresent(): Promise<boolean> {
        return ! this.page.isClosed();
    }

    async switchTo(): Promise<SwitchableOrigin> {
        // const originalWindowHandle = await this.context.getWindowHandle();
        //
        // await this.context.switchToWindow(this.handle);

        return {
            switchBack: async (): Promise<void> => {
                // await this.context.switchToWindow(originalWindowHandle);
            }
        }
    }
}
