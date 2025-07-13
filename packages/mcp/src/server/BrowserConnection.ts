import * as playwright from 'playwright';

import type { Config } from '../config/Config.js';

export class BrowserConnection {

    private browserInstance: playwright.Browser;

    constructor(private readonly config: Config['browser']) {
    }

    private launch(): Promise<playwright.Browser> {
        return playwright[this.config.browserName].launch({
            ...this.config.launchOptions,
            handleSIGINT: false,
            handleSIGTERM: false,
        });
    }

    async browser(): Promise<playwright.Browser> {
        if (! this.browserInstance) {
            const browser = await this.launch();
            browser.on('disconnected', () => {
                this.browserInstance = undefined;
            });
            this.browserInstance = browser;
        }

        return this.browserInstance;
    }

    async close(): Promise<void> {
        if (this.browserInstance) {
            for (const context of this.browserInstance.contexts()) {
                await context.close();
            }
            await this.browserInstance.close();
            this.browserInstance = undefined;
        }
    }
}
