import { CorrelationId } from '@serenity-js/core/lib/model';
import { PagesContext } from '@serenity-js/web';
import * as protractor from 'protractor';

import { ProtractorPage } from '../models';
import { promised } from '../promised';

/**
 * @desc
 *  Protractor-specific implementation of the {@link @serenity-js/web/lib/screenplay/models~PagesContext}.
 *
 * @see {@link @serenity-js/web/lib/screenplay/models~Page}
 */
export class ProtractorPagesContext extends PagesContext<ProtractorPage> {

    constructor(protected readonly browser: protractor.ProtractorBrowser) {
        super();
    }

    async allPages(): Promise<Array<ProtractorPage>> {
        // scan all the active window handles and add any newly opened windows if needed
        const windowHandles: string[]            = await promised(this.browser.getAllWindowHandles());

        // remove pages that are no longer open
        const closedPageIds = this.registeredPageIds()
            .filter(id => ! windowHandles.includes(id.value));

        this.deregister(...closedPageIds);

        // add any new pages that might have been opened (e.g. popup windows)
        const registeredWindowHandles   = new Set(this.registeredPageIds().map(id => id.value));
        const newlyOpenedWindowHandles  = windowHandles.filter(windowHandle => ! registeredWindowHandles.has(windowHandle));

        this.register(
            ...newlyOpenedWindowHandles.map(handle => new ProtractorPage(this, this.browser, new CorrelationId(handle)))
        )

        return super.allPages();
    }

    /**
     * @override
     * @param {ProtractorPage} page
     * @returns {Promise<void>}
     */
    async changeCurrentPageTo(page: ProtractorPage): Promise<void> {
        await this.browser.switchTo().window(page.id.value);

        super.changeCurrentPageTo(page);
    }

    protected async registerCurrentPage(): Promise<ProtractorPage> {
        const windowHandle = await this.browser.getWindowHandle();

        const page = new ProtractorPage(this, this.browser, new CorrelationId(windowHandle));

        this.register(page)

        return page;
    }
}
