import type { Answerable, AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { Interaction, TestCompromisedError, the } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to navigate to a specific destination, as well as back and forth in the browser history,
 * or reload the current page.
 *
 * ## Learn more
 *
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 *
 * @group Activities
 */
export class Navigate {

    /**
     * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
     * to navigate to a given URL.
     *
     * The URL can be:
     * - absolute, e.g. `https://example.org/search`
     * - relative, e.g. `/search`
     *
     * If the URL is relative, your Web test integration tool will append it to any base URL
     * specified in its respective configuration file.
     *
     *
     * #### Navigate to path relative to baseUrl
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Navigate } from '@serenity-js/web'
     *
     * await actorCalled('Hannu')
     *   .attemptsTo(
     *     Navigate.to('/search'),
     *   )
     * ```
     *
     * ## Navigate to an absolute URL (overrides baseUrl)
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Navigate } from '@serenity-js/web'
     *
     * await actorCalled('Hannu')
     *   .whoCan(BrowseTheWeb.using(browser))
     *   .attemptsTo(
     *     Navigate.to('https://mycompany.org/login'),
     *   )
     * ```
     *
     * #### Learn more
     *
     * - [`Page.navigateTo`](https://serenity-js.org/api/web/class/Page/#navigateTo)
     * - [WebdriverIO: Configuration Options](https://webdriver.io/docs/options/#baseurl)
     * - [Playwright: Browser](https://playwright.dev/docs/api/class-browser#browser-new-context)
     * - [Playwright: Test Options](https://playwright.dev/docs/api/class-testoptions#test-options-base-url)
     * - [Protractor: Configuration](https://github.com/angular/protractor/blob/master/lib/config.ts)
     *
     * @param url
     *  An absolute URL or path an [`Actor`](https://serenity-js.org/api/core/class/Actor/)
     *  should navigate to
     */
    static to(url: Answerable<string>): Interaction {
        return new NavigateToUrl(url);
    }

    /**
     * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
     * to navigate back one page in the joint session history of the current top-level browsing context.
     *
     * #### Navigate back in browsing history
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Ensure, endsWith } from '@serenity-js/assertions'
     * import { Navigate, Page } from '@serenity-js/web'
     *
     * await actorCalled('Hannu')
     *   .whoCan(BrowseTheWeb.using(browser))
     *   .attemptsTo(
     *     Navigate.to('/first'),
     *     Navigate.to('/second'),
     *
     *     Navigate.back(),
     *
     *     Ensure.that(Page.current().url().href, endsWith('/first')),
     *   )
     * ```
     */
    static back(): Interaction {
        return Interaction.where(`#actor navigates back in the browser history`, async actor => {
            const page = await BrowseTheWeb.as(actor).currentPage();

            await page.navigateBack();
        });
    }

    /**
     * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
     * to navigate forward one page in the joint session history of the current top-level browsing context.
     *
     * #### Navigate forward in browsing history
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Ensure, endsWith } from '@serenity-js/assertions'
     * import { Navigate, Page } from '@serenity-js/web'
     *
     * await actorCalled('Hannu')
     *   .whoCan(BrowseTheWeb.using(browser))
     *   .attemptsTo(
     *     Navigate.to('/first'),
     *     Navigate.to('/second'),
     *
     *     Navigate.back(),
     *     Navigate.forward(),
     *
     *     Ensure.that(Page.current().url().href, endsWith('/second')),
     *   )
     * ```
     */
    static forward(): Interaction {
        return Interaction.where(`#actor navigates forward in the browser history`, async actor => {
            const page = await BrowseTheWeb.as(actor).currentPage();

            await page.navigateForward();
        });
    }

    /**
     * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
     * to reload the current page.
     *
     * #### Navigate to path relative to baseUrl
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Ensure, endsWith } from '@serenity-js/assertions'
     * import { Navigate, Cookie } from '@serenity-js/web'
     * import { browser } from '@wdio/globals'
     *
     * await actorCalled('Hannu')
     *   .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
     *   .attemptsTo(
     *     Navigate.to('/login'),
     *     Cookie.called('session_id').delete(),
     *     Navigate.reloadPage(),
     *   )
     * ```
     */
    static reloadPage(): Interaction {
        return Interaction.where(`#actor reloads the page`, async actor => {
            const page = await BrowseTheWeb.as(actor).currentPage();

            await page.reload();
        });
    }
}

/**
 * @package
 */
class NavigateToUrl extends Interaction {
    constructor(private readonly url: Answerable<string>) {
        super(the`#actor navigates to ${ url }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const url = await actor.answer(this.url);
        const page = await BrowseTheWeb.as(actor).currentPage();

        return page.navigateTo(url).catch(error => {
            throw new TestCompromisedError(`Couldn't navigate to ${ url }`, error);
        });
    }
}
