import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import type { BrowseTheWeb } from '@serenity-js/web';
import * as playwright from 'playwright';

import type { Config } from './Config.js';

export class BrowserConnection {

    private browserInstance: playwright.Browser;

    constructor(private readonly config: Config['browser']) {
    }

    async browseTheWeb(): Promise<BrowseTheWeb> {
        if (! this.isConnected()) {
            const browser = await this.launch();
            browser.on('disconnected', () => {
                this.browserInstance = undefined;
            });
            this.browserInstance = browser;
        }

        return BrowseTheWebWithPlaywright.using(this.browserInstance);
    }

    isConnected(): boolean {
        return this.browserInstance
            && this.browserInstance.isConnected();
    }

    private launch(): Promise<playwright.Browser> {
        return playwright[this.config.browserName].launch({
            ...this.config.launchOptions,
            handleSIGINT: false,
            handleSIGTERM: false,
        });
    }

    async close(): Promise<void> {
        if (this.isConnected()) {
            for (const context of this.browserInstance.contexts()) {
                await context.close();
            }
            await this.browserInstance.close();
            this.browserInstance = undefined;
        }
    }
}
