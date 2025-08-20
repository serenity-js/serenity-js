import type * as playwright from 'playwright';

export interface Config {
    /**
     * The browser to use.
     */
    browser?: {

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
    },

    // /**
    //  * List of enabled tool capabilities. Possible values:
    //  *   - 'core': Core browser automation features.
    //  *   - 'tabs': Tab management features.
    //  *   - 'pdf': PDF generation and manipulation.
    //  *   - 'history': Browser history access.
    //  *   - 'wait': Wait and timing utilities.
    //  *   - 'files': File upload/download support.
    //  *   - 'install': Browser installation utilities.
    //  */
    // capabilities?: ToolCapability[];

    /**
     * The directory to save output files.
     */
    outputDir?: string;

    network?: {
        /**
         * List of origins to allow the browser to request.
         * Default is to allow all. Origins matching both `allowedOrigins` and `blockedOrigins` will be blocked.
         */
        allowedOrigins?: string[];

        /**
         * List of origins to block the browser to request.
         * Origins matching both `allowedOrigins` and `blockedOrigins` will be blocked.
         */
        blockedOrigins?: string[];
    };
}
