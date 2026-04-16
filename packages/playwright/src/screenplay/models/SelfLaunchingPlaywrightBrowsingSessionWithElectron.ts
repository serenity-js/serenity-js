import type { Initialisable } from '@serenity-js/core';
import type { BrowserCapabilities } from '@serenity-js/web';
import * as playwright from 'playwright-core';

import type { ExtraBrowserContextOptions } from '../../ExtraBrowserContextOptions.js';
import type { ElectronLaunchOptions } from './ElectronLaunchOptions.js';
import { PlaywrightBrowsingSession } from './PlaywrightBrowsingSession.js';
import { PlaywrightBrowsingSessionWithElectron } from './PlaywrightBrowsingSessionWithElectron.js';
import type { PlaywrightPage } from './PlaywrightPage.js';

/**
 * Self-launching implementation of [`PlaywrightBrowsingSession`](https://serenity-js.org/api/playwright/class/PlaywrightBrowsingSession/)
 * for Electron applications.
 *
 * This class launches the Electron application on first use and closes it when discarded.
 * Use this for test runners like Mocha or Jasmine that don't manage Electron lifecycle.
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
 *
 * const actor = actorCalled('Tester').whoCan(
 *     BrowseTheWebWithPlaywright.launchingElectronApp({
 *         args: ['path/to/main.js'],
 *         cwd: 'path/to/app',
 *     })
 * );
 *
 * // The app is automatically closed when the actor is dismissed
 * ```
 *
 * @group Models
 */
export class SelfLaunchingPlaywrightBrowsingSessionWithElectron
    extends PlaywrightBrowsingSession
    implements Initialisable
{
    private electronApp: playwright.ElectronApplication | undefined;
    private delegate: PlaywrightBrowsingSessionWithElectron | undefined;

    constructor(
        private readonly launchOptions: ElectronLaunchOptions,
        private readonly extraOptions: Partial<ExtraBrowserContextOptions>,
        private readonly playwrightSelectors: playwright.Selectors,
    ) {
        super(extraOptions, playwrightSelectors);
    }

    /**
     * Launches the Electron application using the configured launch options.
     *
     * This method is idempotent - calling it multiple times will only launch
     * the application once.
     */
    async initialise(): Promise<void> {
        if (this.electronApp) {
            return;
        }

        this.electronApp = await playwright._electron.launch(this.launchOptions);
        this.delegate = new PlaywrightBrowsingSessionWithElectron(
            this.electronApp,
            this.extraOptions,
            this.playwrightSelectors,
        );
    }

    /**
     * Returns `true` if the Electron application has been launched.
     */
    isInitialised(): boolean {
        return this.electronApp !== undefined;
    }

    protected override async createBrowserContext(): Promise<playwright.BrowserContext> {
        await this.ensureInitialised();
        return this.electronApp!.context();
    }

    protected override async registerCurrentPage(): Promise<PlaywrightPage> {
        await this.ensureInitialised();
        return this.delegate!.currentPage();
    }

    override async currentPage(): Promise<PlaywrightPage> {
        await this.ensureInitialised();
        return this.delegate!.currentPage();
    }

    override async allPages(): Promise<PlaywrightPage[]> {
        await this.ensureInitialised();
        return this.delegate!.allPages();
    }

    /**
     * Closes all Electron windows but does NOT close the Electron application itself.
     */
    override async closeAllPages(): Promise<void> {
        if (this.delegate) {
            await this.delegate.closeAllPages();
        }
    }

    /**
     * Returns [basic meta-data](https://serenity-js.org/api/web/interface/BrowserCapabilities/) about the Electron application.
     */
    override async browserCapabilities(): Promise<BrowserCapabilities> {
        await this.ensureInitialised();
        return this.delegate!.browserCapabilities();
    }

    /**
     * Closes the Electron application that was launched by this session.
     * Called when the ability is discarded.
     */
    async closeElectronApp(): Promise<void> {
        if (this.electronApp) {
            await this.electronApp.close();
            this.electronApp = undefined;
            this.delegate = undefined;
        }
    }

    private async ensureInitialised(): Promise<void> {
        if (!this.isInitialised()) {
            await this.initialise();
        }
    }
}
