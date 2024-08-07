import { ConfigurationError } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/web';
import type * as protractor from 'protractor';

import { ProtractorBrowsingSession } from '../models';

/**
 * This implementation of the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * enables the [`Actor`](https://serenity-js.org/api/core/class/Actor/) to interact with web front-ends using [Protractor](http://www.protractortest.org/#/).
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
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`Ability`](https://serenity-js.org/api/core/class/Ability/)
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
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
     * @throws [`ConfigurationError`](https://serenity-js.org/api/core/class/ConfigurationError/)
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
