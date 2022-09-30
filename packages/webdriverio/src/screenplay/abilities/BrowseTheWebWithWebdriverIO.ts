import { BrowserCapabilities, BrowseTheWeb } from '@serenity-js/web';
import type * as wdio from 'webdriverio';

import { WebdriverIOBrowsingSession } from '../models';

/**
 * This implementation of the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
 * enables the {@apilink Actor} to interact with web front-ends using [WebdriverIO](https://webdriver.io/).
 *
 * ## Using WebdriverIO to `BrowseTheWeb`
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio'
 * import { By, Navigate, PageElement, Text } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * const HomePage = {
 *   title: () =>
 *     PageElement.located(By.css('h1')).describedAs('title')
 * }
 *
 * await actorCalled('Wendy')
 *   .whoCan(BrowseTheWebWithWebdriverIO.using(browser))  // `browser` is global in WebdriverIO tests
 *   .attemptsTo(
 *     Navigate.to(`https://serenity-js.org`),
 *     Ensure.that(Text.of(HomePage.title()), equals('Serenity/JS')),
 *   );
 * ```
 *
 * ## Learn more
 * - [WebdriverIO website](https://webdriver.io/)
 * - {@apilink BrowseTheWeb}
 * - {@apilink Ability}
 * - {@apilink Actor}
 *
 * @group Abilities
 */
export class BrowseTheWebWithWebdriverIO extends BrowseTheWeb<wdio.Element<'async'>> {

    static using(browserInstance: wdio.Browser<'async'>): BrowseTheWebWithWebdriverIO {
        return new BrowseTheWebWithWebdriverIO(browserInstance);
    }

    constructor(protected readonly browser: wdio.Browser<'async'>) {
        super(new WebdriverIOBrowsingSession(browser));
    }

    browserCapabilities(): Promise<BrowserCapabilities> {
        return Promise.resolve(this.browser.capabilities as BrowserCapabilities);
    }
}
