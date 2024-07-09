import type { SerenityConfig } from '@serenity-js/core';
import type { Options } from '@wdio/types';

/**
 * [WebdriverIO configuration object](https://webdriver.io/docs/configurationfile/),
 * with [Serenity/JS-specific additions](https://serenity-js.orgapi/core/class/SerenityConfig/).
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
 *           // strategy: 'TakePhotosOfInteractions'
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
 * ## Learn more
 *
 * - [WebdriverIO configuration file](https://webdriver.io/docs/configurationfile/)
 * - [`CucumberConfig`](https://serenity-js.org/api/cucumber-adapter/interface/CucumberConfig/)
 * - [`JasmineConfig`](https://serenity-js.org/api/jasmine-adapter/interface/JasmineConfig/)
 * - [`MochaConfig`](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/)
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
     * - [`CucumberConfig`](https://serenity-js.org/api/cucumber-adapter/interface/CucumberConfig/)
     * - [`JasmineConfig`](https://serenity-js.org/api/jasmine-adapter/interface/JasmineConfig/)
     * - [`MochaConfig`](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/)
     */
    serenity?: SerenityConfig & { runner?: string };
}
