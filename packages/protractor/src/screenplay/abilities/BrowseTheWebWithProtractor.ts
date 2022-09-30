import { ConfigurationError } from '@serenity-js/core';
import { BrowserCapabilities, BrowseTheWeb } from '@serenity-js/web';
import * as protractor from 'protractor';

import { ProtractorBrowsingSession } from '../models';
import { promised } from '../promised';

/**
 * This implementation of the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
 * enables the {@apilink Actor} to interact with web front-ends using [Protractor](http://www.protractortest.org/#/).
 *
 * ## Using Protractor to `BrowseTheWeb`
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithProtractor } from '@serenity-js/protractor
 * import { By, Navigate, PageElement, Text } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { protractor } from 'protractor'
 *
 * const HomePage = {
 *   title: () =>
 *     PageElement.located(By.css('h1')).describedAs('title')
 * }
 *
 *  await actorCalled('Wendy')
 *    .whoCan(BrowseTheWebWithProtractor.using(protractor.browser))
 *    .attemptsTo(
 *      Navigate.to(`https://serenity-js.org`),
 *      Ensure.that(Text.of(HomePage.title()), equals('Serenity/JS')),
 *    )
 * ```
 *
 * ## Learn more
 * - [Protractor website](https://www.protractortest.org/)
 * - {@apilink BrowseTheWeb}
 * - {@apilink Ability}
 * - {@apilink Actor}
 *
 * @group Abilities
 */
export class BrowseTheWebWithProtractor extends BrowseTheWeb<protractor.ElementFinder> {

    /**
     * Ability to interact with web front-ends using
     * provided protractor browser instance.
     *
     * @param {protractor~ProtractorBrowser} browser
     *
     * #### Learn more
     * - [Protractor Browser API docs](http://www.protractortest.org/#/api?view=ProtractorBrowser)
     */
    static using(browser: protractor.ProtractorBrowser): BrowseTheWebWithProtractor {
        return new BrowseTheWebWithProtractor(browser);
    }

    /**
     * @param browser
     *  An instance of a protractor browser
     */
    constructor(protected browser: protractor.ProtractorBrowser) {
        super(new ProtractorBrowsingSession(browser));
    }

    async browserCapabilities(): Promise<BrowserCapabilities> {
        const capabilities = await promised(this.browser.getCapabilities());

        return {
            platformName:   capabilities.get('platform'),
            browserName:    capabilities.get('browserName'),
            browserVersion: capabilities.get('version'),
        };
    }

    /**
     * Returns Protractor configuration parameter at `path`.
     *
     * #### Configuring a custom parameter
     *
     * ```js
     * // protractor.conf.js
     * exports.config = {
     *   params: {
     *     login: {
     *       username: 'jane@example.org'
     *       password: process.env.PASSWORD
     *     }
     *   }
     *   // ...
     * }
     * ```
     *
     * #### Retrieving config param by name
     * ```js
     * BrowseTheWebWithProtractor.as(actor).param('login')
     *  // returns object with username and password
     * ```
     *
     * #### Retrieving config param by path
     * ```js
     * BrowseTheWeb.as(actor).param('login.username')
     *  // returns string 'jane@example.org'
     *
     * @param path
     *  Either a name or a dot-delimited path to the param.
     *
     * @throws {@apilink ConfigurationError}
     *  Throws a `ConfigurationError` if the parameter is `undefined`
     */
    param<T = any>(path: string): T {
        return path.split('.')
            .reduce((config, segment) => {
                if (! (config && config[segment] !== undefined)) {
                    throw new ConfigurationError(`Protractor param '${ path }' is undefined`);
                }

                return config[segment];
            }, this.browser.params);
    }
}
