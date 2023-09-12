import type { SerenityConfig } from '@serenity-js/core';
import type { Options } from '@wdio/types';

/**
 * [WebdriverIO configuration object](https://webdriver.io/docs/configurationfile/),
 * with Serenity/JS-specific {@apilink SerenityConfig|additions}.
 *
 * ## Integrating WebdriverIO with Serenity/JS
 *
 * ```ts
 * // wdio.conf.ts
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio'
 *
 * export const config: WebdriverIOConfig = {
 *
 *   framework: '@serenity-js/webdriverio',
 *
 *   serenity: {
 *     runner: 'cucumber',
 *     // runner: 'mocha',
 *     // runner: 'jasmine',
 *
 *     crew: [
 *       // Optional, print test execution results to standard output
 *       '@serenity-js/console-reporter',
 *
 *       // Optional, produce Serenity BDD reports
 *       // and living documentation (HTML)
 *       '@serenity-js/serenity-bdd',
 *       [ '@serenity-js/core:ArtifactArchiver', {
 *           outputDirectory: 'target/site/serenity'
 *       } ],
 *
 *       // Optional, automatically capture screenshots
 *       // upon interaction failure
 *       [ '@serenity-js/web:Photographer', {
 *           strategy: 'TakePhotosOfFailures'
 *       } ],
 *     ]
 *   },
 *
 *   // Configure your Cucumber runner
 *   cucumberOpts: {
 *     // see Cucumber configuration options below
 *   },
 *
 *   // ... or Jasmine runner
 *   jasmineOpts: {
 *     // see Jasmine configuration options below
 *   },
 *
 *   // ... or Mocha runner
 *   mochaOpts: {
 *      // see Mocha configuration options below
 *   },
 *
 *   runner: 'local',
 *
 *   specs: [
 *     './features/*.feature',
 *
 *     // or for Mocha/Jasmine
 *     // './*.spec.ts'
 *   ],
 *
 *   // Any other WebdriverIO configuration
 * }
 * ```
 *
 * ## Using Serenity/JS WebdriverIO Cucumber framework
 *
 * To simplify your setup, you might want to install the Serenity/JS WebdriverIO Cucumber framework,
 * which bundles Cucumber.js and the Serenity/JS modules responsible for integrating it with WebdriverIO.
 *
 * ```sh
 * npm install --save-dev @serenity-js/wdio-cucumber-framework
 * ```
 *
 * ```ts
 * // wdio.conf.ts
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio-cucumber-framework'
 *
 * export const config: WebdriverIOConfig = {
 *
 *   framework: '@serenity-js/webdriverio-cucumber-framework',
 *
 *   serenity: {
 *     crew: [
 *       // Optional, print test execution results to standard output
 *       '@serenity-js/console-reporter',
 *
 *       // Optional, produce Serenity BDD reports
 *       // and living documentation (HTML)
 *       '@serenity-js/serenity-bdd',
 *       [ '@serenity-js/core:ArtifactArchiver', {
 *           outputDirectory: 'target/site/serenity'
 *       } ],
 *
 *       // Optional, automatically capture screenshots
 *       // upon interaction failure
 *       [ '@serenity-js/web:Photographer', {
 *           strategy: 'TakePhotosOfFailures'
 *       } ],
 *     ]
 *   },
 *
 *   // Configure your Cucumber runner
 *   cucumberOpts: {
 *     // see Cucumber configuration options below
 *   },
 *
 *   runner: 'local',
 *
 *   specs: [
 *     './features/*.feature',
 *   ],
 *
 *   // Any other WebdriverIO configuration
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
