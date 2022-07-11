import { CorrelationId } from '@serenity-js/core/lib/model';
import { BrowsingSession } from '@serenity-js/web';
import * as protractor from 'protractor';

import { ProtractorPage } from '../models';
import { promised } from '../promised';
import { ProtractorErrorHandler } from './ProtractorErrorHandler';
import { ProtractorModalDialogHandler } from './ProtractorModalDialogHandler';

/**
 * @desc
 *  Protractor-specific implementation of the {@link @serenity-js/web/lib/screenplay/models~BrowsingSession}.
 *
 * @see {@link @serenity-js/web/lib/screenplay/models~Page}
 * @extends {@serenity-js/web/lib/screenplay/models~BrowsingSession}
 */
export class ProtractorBrowsingSession extends BrowsingSession<ProtractorPage> {

    constructor(protected readonly browser: protractor.ProtractorBrowser) {
        super();
    }

    async allPages(): Promise<Array<ProtractorPage>> {
        // scan all the active window handles and add any newly opened windows if needed
        const windowHandles: string[] = await promised(this.browser.getAllWindowHandles());

        // remove pages that are no longer open
        const closedPageIds = this.registeredPageIds()
            .filter(id => ! windowHandles.includes(id.value));

        this.deregister(...closedPageIds);

        // add any new pages that might have been opened (e.g. popup windows)
        const registeredWindowHandles   = new Set(this.registeredPageIds().map(id => id.value));
        const newlyOpenedWindowHandles  = windowHandles.filter(windowHandle => ! registeredWindowHandles.has(windowHandle));

        for (const newlyOpenedWindowHandle of newlyOpenedWindowHandles) {
            const errorHandler = new ProtractorErrorHandler();
            this.register(
                new ProtractorPage(
                    this,
                    this.browser,
                    new ProtractorModalDialogHandler(this.browser, errorHandler),
                    errorHandler,
                    new CorrelationId(newlyOpenedWindowHandle))
            );
        }

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

        const errorHandler = new ProtractorErrorHandler();

        const page = new ProtractorPage(
            this,
            this.browser,
            new ProtractorModalDialogHandler(this.browser, errorHandler),
            errorHandler,
            new CorrelationId(windowHandle)
        );

        this.register(page)

        return page;
    }
}
