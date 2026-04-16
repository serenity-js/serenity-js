import { CorrelationId } from '@serenity-js/core/model';
import type { BrowserCapabilities } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import type { ExtraBrowserContextOptions } from '../../ExtraBrowserContextOptions.js';
import { PlaywrightBrowsingSession } from './PlaywrightBrowsingSession.js';
import { PlaywrightPage } from './PlaywrightPage.js';

/**
 * Playwright-specific implementation of [`BrowsingSession`](https://serenity-js.org/api/web/class/BrowsingSession/)
 * for Electron applications.
 *
 * Use this class when you have an already-launched `ElectronApplication` instance,
 * typically in Playwright Test scenarios where the app is managed per-worker.
 *
 * ## Example
 *
 * ```typescript
 * import { _electron as electron } from 'playwright';
 * import { actorCalled } from '@serenity-js/core';
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
 *
 * const electronApp = await electron.launch({ args: ['main.js'] });
 *
 * const actor = actorCalled('Tester').whoCan(
 *     BrowseTheWebWithPlaywright.usingElectronApp(electronApp)
 * );
 *
 * // After tests, close the app manually
 * await electronApp.close();
 * ```
 *
 * @group Models
 */
export class PlaywrightBrowsingSessionWithElectron extends PlaywrightBrowsingSession {

    constructor(
        protected readonly electronApp: playwright.ElectronApplication,
        extraBrowserContextOptions: Partial<ExtraBrowserContextOptions>,
        selectors: playwright.Selectors,
    ) {
        super(extraBrowserContextOptions, selectors);
    }

    protected override async createBrowserContext(): Promise<playwright.BrowserContext> {
        return this.electronApp.context();
    }

    protected override async registerCurrentPage(): Promise<PlaywrightPage> {
        // Ensure browser context is initialized before accessing windows
        await this.browserContext();
        const windows = this.electronApp.windows();

        let targetPage: playwright.Page;

        if (windows.length === 0) {
            // Wait for the first window to open
            targetPage = await this.electronApp.firstWindow();
        } else {
            // Use the last opened window
            targetPage = windows.at(-1)!;
        }

        // Check if this window is already registered
        const allPages = await this.allPages();
        for (const page of allPages) {
            const nativePage = await page.nativePage();
            if (nativePage === targetPage) {
                return page;
            }
        }

        // Create and register a new PlaywrightPage
        const playwrightPage = new PlaywrightPage(
            this,
            targetPage,
            this.extraBrowserContextOptions,
            CorrelationId.create()
        );

        this.register(playwrightPage);

        // Set up close handler for automatic deregistration
        targetPage.on('close', () => {
            this.deregister(playwrightPage.id);
        });

        return playwrightPage;
    }

    /**
     * Closes all Electron windows but does NOT close the Electron application itself.
     * The application lifecycle is managed externally.
     */
    override async closeAllPages(): Promise<void> {
        const pages = await this.allPages();
        for (const page of pages) {
            await page.close();
        }
    }

    /**
     * Returns [basic meta-data](https://serenity-js.org/api/web/interface/BrowserCapabilities/) about the Electron application.
     *
     * **Please note** that since Playwright does not expose information about the operating system
     * the tests are running on, **Serenity/JS assumes that the tests are running locally**
     * and therefore returns the value of Node.js `process.platform` for `platformName`.
     */
    override async browserCapabilities(): Promise<BrowserCapabilities> {
        return {
            browserName: 'electron',
            platformName: process.platform,
            browserVersion: await this.getElectronVersion(),
        };
    }

    private async getElectronVersion(): Promise<string> {
        try {
            const version = await this.electronApp.evaluate(
                () => process.versions.electron
            );
            return version || 'unknown';
        } catch {
            return 'unknown';
        }
    }
}
