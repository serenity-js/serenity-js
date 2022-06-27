import { BrowserCapabilities, BrowseTheWeb, ModalDialog } from '@serenity-js/web';
import type * as wdio from 'webdriverio';

import { WebdriverIOModalDialog, WebdriverIOPagesContext } from '../models';

/**
 * @desc
 *  An {@link @serenity-js/core/lib/screenplay~Ability} that enables the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  to interact with Web apps using [WebdriverIO](https://webdriver.io/).
 *
 * @example <caption>Using the WebdriverIO browser</caption>
 * import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio'
 *  import { By, Navigate, PageElement } from '@serenity-js/web'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const HomePage = {
 *      title: PageElement.located(By.css('h1')).describedAs('title')
 *  }
 *
 *  await actorCalled('Wendy')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))  // `browser` is global in WebdriverIO tests
 *      .attemptsTo(
 *          Navigate.to(`https://serenity-js.org`),
 *          Ensure.that(Text.of(HomePage.title), equals('Serenity/JS')),
 *      );
 *
 * @extends {@serenity-js/web/lib/screenplay/abilities~BrowseTheWeb}
 *
 * @public
 *
 * @see https://webdriver.io/
 * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
 */
export class BrowseTheWebWithWebdriverIO extends BrowseTheWeb<wdio.Element<'async'>> {
    /**
     * @param {@wdio/types~Browser} browserInstance
     * @returns {BrowseTheWebWithWebdriverIO}
     */
    static using(browserInstance: wdio.Browser<'async'>): BrowseTheWebWithWebdriverIO {
        return new BrowseTheWebWithWebdriverIO(browserInstance);
    }

    /**
     * @param {@wdio/types~Browser} browser
     */
    constructor(protected readonly browser: wdio.Browser<'async'>) {
        super(new WebdriverIOPagesContext(browser));
    }

    browserCapabilities(): Promise<BrowserCapabilities> {
        return Promise.resolve(this.browser.capabilities as BrowserCapabilities);
    }

    async modalDialog(): Promise<ModalDialog> {
        return new WebdriverIOModalDialog(this.browser);
    }
}
