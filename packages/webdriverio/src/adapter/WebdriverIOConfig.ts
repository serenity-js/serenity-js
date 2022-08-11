import { SerenityConfig } from '@serenity-js/core';
import type { Options } from '@wdio/types';

/**
 * [WebdriverIO configuration object](https://webdriver.io/docs/configurationfile/)
 * with Serenity/JS-specific {@apilink SerenityConfig|additions}.
 *
 * ## Configuring WebdriverIO with Serenity/JS and Cucumber
 *
 * ```ts
 * // wdio.conf.ts
 * import { ConsoleReporter } from '@serenity-js/console-reporter'
 * import { ArtifactArchiver } from '@serenity-js/core'
 * import { SerenityBDDReporter } from '@serenity-js/serenity-bdd'
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio'
 *
 * export const config: WebdriverIOConfig = {
 *
 *   framework: '@serenity-js/webdriverio',
 *
 *   serenity: {
 *     runner: 'cucumber',
 *     crew: [
 *       ConsoleReporter.forDarkTerminals(),
 *       new SerenityBDDReporter(),
 *       ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *     ]
 *   },
 *
 *   cucumberOpts: {
 *     // ...
 *   },
 *
 *   specs: [
 *     './features/*.feature',
 *   ],
 * }
 * ```
 *
 * ## Configuring WebdriverIO with Serenity/JS and Mocha
 *
 * ```ts
 * // wdio.conf.ts
 * import { ConsoleReporter } from '@serenity-js/console-reporter'
 * import { ArtifactArchiver } from '@serenity-js/core'
 * import { SerenityBDDReporter } from '@serenity-js/serenity-bdd'
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio'
 *
 * export const config: WebdriverIOConfig = {
 *
 *   framework: '@serenity-js/webdriverio',
 *
 *   serenity: {
 *     runner: 'mocha',
 *     crew: [
 *       ConsoleReporter.forDarkTerminals(),
 *       new SerenityBDDReporter(),
 *       ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *     ]
 *   },
 *
 *   mochaOpts: {
 *     // ...
 *   },
 *
 *   specs: [
 *     './spec/*.spec.*',
 *   ],
 * }
 * ```
 *
 * ## Configuring WebdriverIO with Serenity/JS and Jasmine
 *
 * ```ts
 * // wdio.conf.ts
 * import { ConsoleReporter } from '@serenity-js/console-reporter'
 * import { ArtifactArchiver } from '@serenity-js/core'
 * import { SerenityBDDReporter } from '@serenity-js/serenity-bdd'
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio'
 *
 * export const config: WebdriverIOConfig = {
 *
 *   framework: '@serenity-js/webdriverio',
 *
 *   serenity: {
 *     runner: 'jasmine',
 *     crew: [
 *       ConsoleReporter.forDarkTerminals(),
 *       new SerenityBDDReporter(),
 *       ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *     ]
 *   },
 *
 *   jasmineOpts: {
 *     // ...
 *   },
 *
 *   specs: [
 *     './spec/*.spec.*',
 *   ],
 * }
 * ```
 *
 * ## Learn more
 *
 * - [WebdriverIO configuration file](https://webdriver.io/docs/configurationfile/)
 * - {@apilink CucumberConfig}
 * - {@apilink JasmineConfig}
 * - {@apilink MochaConfig}
 *
 * @group Configuration
 */
export interface WebdriverIOConfig extends Options.Testrunner {

    /**
     * Serenity/JS configuration with an additional `runner` entry
     * allowing to specify the test runner, such as `cucumber`, `mocha`, or `jasmine`.
     *
     * #### Learn more
     *
     * - [WebdriverIO configuration file](https://webdriver.io/docs/configurationfile/)
     * - {@apilink CucumberConfig}
     * - {@apilink JasmineConfig}
     * - {@apilink MochaConfig}
     */
    serenity?: SerenityConfig & { runner?: string };
}
