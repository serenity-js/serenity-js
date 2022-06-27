import { LogicError } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model';
import { PagesContext } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIOPage } from '../models';

/**
 * @desc
 *  WebdriverIO-specific implementation of the {@link @serenity-js/web/lib/screenplay/models~PagesContext}.
 *
 * @see {@link @serenity-js/web/lib/screenplay/models~PagesContext}
 */
export class WebdriverIOPagesContext extends PagesContext<WebdriverIOPage> {

    constructor(protected readonly browser: wdio.Browser<'async'>) {
        super();

        if (! browser.$ || ! browser.$$) {
            throw new LogicError(`WebdriverIO browser object is not initialised yet, so can't be assigned to an actor. Are you trying to instantiate an actor outside of a test or a test hook?`)
        }
    }

    async allPages(): Promise<Array<WebdriverIOPage>> {
        // scan all the active window handles and add any newly opened windows if needed
        const windowHandles: string[]            = await this.browser.getWindowHandles();

        // remove pages that are no longer open
        const closedPageIds = this.registeredPageIds()
            .filter(id => ! windowHandles.includes(id.value));

        this.deregister(...closedPageIds);

        // add any new pages that might have been opened (e.g. popup windows)
        const registeredWindowHandles   = new Set(this.registeredPageIds().map(id => id.value));
        const newlyOpenedWindowHandles  = windowHandles.filter(windowHandle => ! registeredWindowHandles.has(windowHandle));

        this.register(
            ...newlyOpenedWindowHandles.map(handle => new WebdriverIOPage(this, this.browser, new CorrelationId(handle)))
        )

        return super.allPages();
    }

    /**
     * @override
     * @param {ProtractorPage} page
     * @returns {Promise<void>}
     */
    async changeCurrentPageTo(page: WebdriverIOPage): Promise<void> {
        await this.browser.switchToWindow(page.id.value);

        super.changeCurrentPageTo(page);
    }

    protected async registerCurrentPage(): Promise<WebdriverIOPage> {
        const windowHandle = await this.browser.getWindowHandle();

        const page = new WebdriverIOPage(this, this.browser, new CorrelationId(windowHandle));

        this.register(page)

        return page;
    }
}
