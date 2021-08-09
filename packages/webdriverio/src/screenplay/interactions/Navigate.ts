import { Answerable, AnswersQuestions, Interaction, TestCompromisedError, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { BrowseTheWeb } from '../';

/**
 * @desc
 *  Allows the {@link @serenity-js/core/lib/screenplay/actor~Actor} to navigate
 *  to a specific destination, as well as back and forth in the browser history,
 *  or reload the current page.
 */
export class Navigate {

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to navigate to a given URL.
     *
     *  The URL can be:
     *  - absolute, i.e. `https://example.org/search`
     *  - relative, i.e. `/search`
     *
     *  If the URL is relative, WebdriverIO will append it to `baseUrl` specified in
     *  the [configuration file](https://webdriver.io/docs/configurationfile/).
     *
     * @example <caption>wdio.conf.ts</caption>
     *  export const config = {
     *      baseUrl: 'https://example.org',
     *      // ...
     *  }
     *
     * @example <caption>Navigate to path relative to baseUrl</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Navigate } from '@serenity-js/webdriverio';
     *
     *  actorCalled('Hannu')
     *      .whoCan(BrowseTheWeb.using(browser))
     *      .attemptsTo(
     *          Navigate.to('/search'),
     *      );
     *
     * @example <caption>Navigate to an absolute URL (overrides baseUrl)</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Navigate } from '@serenity-js/webdriverio';
     *
     *  actorCalled('Hannu')
     *      .whoCan(BrowseTheWeb.using(browser))
     *      .attemptsTo(
     *          Navigate.to('https://mycompany.org/login'),
     *      );
     *
     * @param {Answerable<string>} url
     *  An absolute URL or path an {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  should navigate to
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link BrowseTheWeb}
     */
    static to(url: Answerable<string>): Interaction {
        return new NavigateToUrl(url);
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
     *  navigate back one page in the joint session history of the current top-level browsing context.
     *
     * @example <caption>Navigate to path relative to baseUrl</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { Ensure, endsWith } from '@serenity-js/assertions';
     *  import { BrowseTheWeb, Navigate } from '@serenity-js/webdriverio';
     *
     *  actorCalled('Hannu')
     *      .whoCan(BrowseTheWeb.using(browser))
     *      .attemptsTo(
     *          Navigate.to('/first'),
     *          Navigate.to('/second'),
     *
     *          Navigate.back(),
     *
     *          Ensure.that(Website.url(), endsWith('/first')),
     *      );
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see https://webdriver.io/docs/api/webdriver/#back
     * @see {@link BrowseTheWeb}
     * @see {@link @serenity-js/assertions~Ensure}
     * @see {@link @serenity-js/assertions/lib/expectations~endsWith}
     */
    static back(): Interaction {
        return Interaction.where(`#actor navigates back in the browser history`, actor =>
            BrowseTheWeb.as(actor).browser.back(),
        );
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
     *  navigate forward one page in the session history.
     *
     * @example <caption>Navigate to path relative to baseUrl</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { Ensure, endsWith } from '@serenity-js/assertions';
     *  import { BrowseTheWeb, Navigate } from '@serenity-js/webdriverio';
     *
     *  actorCalled('Hannu')
     *      .whoCan(BrowseTheWeb.using(browser))
     *      .attemptsTo(
     *          Navigate.to('/first'),
     *          Navigate.to('/second'),
     *
     *          Navigate.back(),
     *          Navigate.forward(),
     *
     *          Ensure.that(Website.url(), endsWith('/second')),
     *      );
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link BrowseTheWeb}
     * @see {@link @serenity-js/assertions~Ensure}
     * @see {@link @serenity-js/assertions/lib/expectations~endsWith}
     * @see https://webdriver.io/docs/api/webdriver/#forward
     */
    static forward(): Interaction {
        return Interaction.where(`#actor navigates forward in the browser history`, actor =>
            BrowseTheWeb.as(actor).browser.forward(),
        );
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
     *  reload the current page.
     *
     * @example <caption>Navigate to path relative to baseUrl</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { Ensure, endsWith } from '@serenity-js/assertions';
     *  import { Navigate, BrowseTheWeb, DeleteCookies } from '@serenity-js/webdriverio';
     *
     *  actorCalled('Hannu')
     *      .whoCan(BrowseTheWeb.using(browser))
     *      .attemptsTo(
     *          Navigate.to('/login'),
     *          DeleteCookies.called('session_id'),
     *          Navigate.reloadPage(),
     *      );
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link BrowseTheWeb}
     * @see {@link DeleteCookies}
     * @see {@link @serenity-js/assertions~Ensure}
     * @see {@link @serenity-js/assertions/lib/expectations~endsWith}
     */
    static reloadPage(): Interaction {
        return Interaction.where(`#actor reloads the page`, actor =>
            BrowseTheWeb.as(actor).browser.refresh(),
        );
    }
}

/**
 * @package
 */
class NavigateToUrl extends Interaction {
    constructor(private readonly url: Answerable<string>) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     *  An {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to perform this {@link @serenity-js/core/lib/screenplay~Interaction}
     *
     * @returns {PromiseLike<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.url)
            .then(url =>
                BrowseTheWeb.as(actor)
                    .get(url)
                    .catch(error => {
                        throw new TestCompromisedError(`Couldn't navigate to ${ url }`, error);
                    })
            )
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor navigates to ${ this.url }`;
    }
}
