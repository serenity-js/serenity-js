import type * as playwright from 'playwright-core';

/**
 * Options for launching an Electron application via Playwright.
 *
 * This type re-exports Playwright's Electron launch options with additional documentation
 * for commonly used properties.
 *
 * ## Example
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core';
 * import { BrowseTheWebWithPlaywright, ElectronLaunchOptions } from '@serenity-js/playwright';
 *
 * const options: ElectronLaunchOptions = {
 *     executablePath: '/path/to/electron',
 *     args: ['main.js'],
 *     cwd: '/path/to/app',
 *     env: { NODE_ENV: 'test' },
 *     timeout: 30000,
 * };
 *
 * const actor = actorCalled('Tester').whoCan(
 *     BrowseTheWebWithPlaywright.launchingElectronApp(options)
 * );
 * ```
 *
 * ## Common Options
 *
 * - **executablePath**: Path to the Electron executable. If not specified, uses the default
 *   Electron installed in `node_modules/.bin/electron`.
 * - **args**: Command-line arguments passed to the application. Typically includes the path
 *   to the main script (e.g., `['main.js']`).
 * - **cwd**: Current working directory for the Electron process.
 * - **env**: Environment variables visible to the Electron process. Defaults to `process.env`.
 * - **timeout**: Maximum time in milliseconds to wait for the application to start.
 *   Defaults to 30000 (30 seconds). Pass 0 to disable timeout.
 *
 * ## Additional Options
 *
 * - **acceptDownloads**: Whether to automatically download all attachments. Defaults to `true`.
 * - **bypassCSP**: Toggles bypassing page's Content-Security-Policy. Defaults to `false`.
 * - **colorScheme**: Emulates `prefers-colors-scheme` media feature. Supported values are `'light'`, `'dark'`, and `'no-preference'`.
 * - **locale**: Specify user locale, for example `en-GB`, `de-DE`, etc.
 * - **offline**: Whether to emulate network being offline. Defaults to `false`.
 * - **recordVideo**: Enables video recording for all pages.
 * - **timezoneId**: Changes the timezone of the context.
 *
 * ## Learn more
 * - [Playwright Electron API](https://playwright.dev/docs/api/class-electron)
 * - [Electron Testing with Playwright](https://playwright.dev/docs/electron)
 *
 * @group Configuration
 */
export type ElectronLaunchOptions = Parameters<typeof playwright._electron.launch>[0];
