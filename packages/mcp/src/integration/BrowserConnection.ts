import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import type { BrowseTheWeb } from '@serenity-js/web';
import * as playwright from 'playwright';

export interface BrowserConnectionConfig {
    /**
     * The type of browser to use.
     */
    browserName?: 'chromium' | 'firefox' | 'webkit';

    /**
     * Keep the browser profile in memory, do not save it to disk.
     */
    isolated?: boolean;

    /**
     * Path to a user data directory for browser profile persistence.
     * Temporary directory is created by default.
     */
    userDataDir?: string;

    /**
     * Launch options passed to
     * @see https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context
     *
     * This is useful for settings options like `channel`, `headless`, `executablePath`, etc.
     */
    launchOptions?: playwright.LaunchOptions;

    /**
     * McpSessionContext options for the browser context.
     *
     * This is useful for settings options like `viewport`.
     */
    contextOptions?: playwright.BrowserContextOptions;
}

export class BrowserConnection {

    private browserInstance: playwright.Browser;

    constructor(private readonly config: BrowserConnectionConfig) {
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
