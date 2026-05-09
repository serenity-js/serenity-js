import type { Discardable, Initialisable } from '@serenity-js/core';
import * as playwright from 'playwright-core';

import type { ExtraBrowserContextOptions } from '../../ExtraBrowserContextOptions.js';
import type { ElectronLaunchOptions } from './ElectronLaunchOptions.js';
import { PlaywrightBrowsingSessionWithElectron } from './PlaywrightBrowsingSessionWithElectron.js';

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
    extends PlaywrightBrowsingSessionWithElectron
    implements Initialisable, Discardable
{
    constructor(
        private readonly launchOptions: ElectronLaunchOptions,
        extraBrowserContextOptions: Partial<ExtraBrowserContextOptions>,
        selectors: playwright.Selectors,
    ) {
        // setting electronApp to undefined since it's lazily initialised
        super(undefined, extraBrowserContextOptions, selectors);
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
        this.currentBrowserPage = await this.registerCurrentPage();
    }

    /**
     * Returns `true` if the Electron application has been launched.
     */
    isInitialised(): boolean {
        return this.electronApp !== undefined;
    }

    /**
     * Closes the Electron application that was launched by this session.
     * Called when the ability is discarded.
     */
    async closeElectronApp(): Promise<void> {
        if (this.electronApp) {
            await this.electronApp.close();
            this.electronApp = undefined;
        }
    }

    async discard(): Promise<void> {
        await this.closeElectronApp();

        this.pages.clear();
        this.currentBrowserPage = undefined;
    }
}
