import { SerenityConfig } from '@serenity-js/core';
import type { Options } from '@wdio/types';

/**
 * @desc
 *  [WebdriverIO configuration object](https://webdriver.io/docs/configurationfile/)
 *  with Serenity/JS-specific additions.
 *
 * @see {@link @serenity-js/cucumber/lib/cli~CucumberConfig}
 * @see {@link @serenity-js/jasmine/lib/adapter~JasmineConfig}
 * @see {@link @serenity-js/mocha/lib/adapter~MochaConfig}
 *
 * @see https://webdriver.io/docs/configurationfile/
 * @see {@link @wdio/types~Options.TestRunner}
 *
 * @public
 *
 * @extends {@wdio/types~Options.TestRunner}
 *
 * @example <caption>WebdriverIO with Serenity/JS and Cucumber</caption>
 *
 *  import { ConsoleReporter } from '@serenity-js/console-reporter';
 *  import { ArtifactArchiver } from '@serenity-js/core';
 *  import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
 *  import { WebdriverIOConfig } from '@serenity-js/webdriverio';
 *
 *  export const config: WebdriverIOConfig = {
 *
 *    framework: '@serenity-js/webdriverio',
 *
 *    serenity: {
 *        runner: 'cucumber',
 *        crew: [
 *            ConsoleReporter.forDarkTerminals(),
 *            new SerenityBDDReporter(),
 *            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *        ]
 *    },
 *
 *    cucumberOpts: {
 *        // ...
 *    },
 *
 *    specs: [
 *        './features/*.feature',
 *    ],
 * };
 *
 * @example <caption>WebdriverIO with Serenity/JS and Mocha</caption>
 *
 *  import { ConsoleReporter } from '@serenity-js/console-reporter';
 *  import { ArtifactArchiver } from '@serenity-js/core';
 *  import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
 *  import { WebdriverIOConfig } from '@serenity-js/webdriverio';
 *
 *  export const config: WebdriverIOConfig = {
 *
 *    framework: '@serenity-js/webdriverio',
 *
 *    serenity: {
 *        runner: 'mocha',
 *        crew: [
 *            ConsoleReporter.forDarkTerminals(),
 *            new SerenityBDDReporter(),
 *            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *        ]
 *    },
 *
 *    mochaOpts: {
 *        // ...
 *    },
 *
 *    specs: [
 *        './spec/*.spec.*',
 *    ],
 * };
 *
 * @example <caption>WebdriverIO with Serenity/JS and Jasmine</caption>
 *
 *  import { ConsoleReporter } from '@serenity-js/console-reporter';
 *  import { ArtifactArchiver } from '@serenity-js/core';
 *  import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
 *  import { WebdriverIOConfig } from '@serenity-js/webdriverio';
 *
 *  export const config: WebdriverIOConfig = {
 *
 *    framework: '@serenity-js/webdriverio',
 *
 *    serenity: {
 *        runner: 'jasmine',
 *        crew: [
 *            ConsoleReporter.forDarkTerminals(),
 *            new SerenityBDDReporter(),
 *            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
 *        ]
 *    },
 *
 *    jasmineOpts: {
 *        // ...
 *    },
 *
 *    specs: [
 *        './spec/*.spec.*',
 *    ],
 * };
 */
export interface WebdriverIOConfig extends Options.Testrunner {

    /**
     * @desc
     *  Serenity/JS configuration with an additional `runner` entry
     *  allowing to specify the test runner, such as `cucumber`, `mocha`, or `jasmine`.
     *
     * @see {@link @serenity-js/cucumber/lib/cli~CucumberConfig}
     * @see {@link @serenity-js/jasmine/lib/adapter~JasmineConfig}
     * @see {@link @serenity-js/mocha/lib/adapter~MochaConfig}
     *
     * @type {@serenity-js/core~SerenityConfig}
     * @public
     */
    serenity?: SerenityConfig & { runner?: string };
}
