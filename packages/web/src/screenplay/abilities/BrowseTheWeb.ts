import { Ability } from '@serenity-js/core';

import type { BrowserCapabilities, BrowsingSession, Page } from '../models';

/**
 * The [ability](https://serenity-js.org/api/core/class/Ability/) to `BrowseTheWeb` enables an [actor](https://serenity-js.org/api/core/class/Actor/)
 * to [interact with](https://serenity-js.org/api/core/class/Interaction/) and [retrieve information from](https://serenity-js.org/api/core/class/Question/) Web-based user interfaces.
 *
 * `BrowseTheWeb` wraps test integration tools such as [Playwright](https://serenity-js.org/api/playwright),
 * [Protractor](https://serenity-js.org/api/protractor), or [WebdriverIO](https://serenity-js.org/api/webdriverio),
 * and together with Serenity/JS Web models, such as [`Page`](https://serenity-js.org/api/web/class/Page/) or [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) - offers a standardised way
 * to write Web-based tests following the Screenplay Pattern.
 *
 * The consistent and portable design of abstractions provided by the [`@serenity-js/web` module](https://serenity-js.org/api/web)
 * also helps to make your tests portable across the various test integration tools and helps to make your test
 * code easier to reuse across projects and teams.
 *
 * ## Giving the actors an ability to `BrowseTheWeb`
 *
 * To give an [actor](https://serenity-js.org/api/core/class/Actor/) an ability to `BrowseTheWeb`, provide the **integration tool-specific implementation**
 * via [`Actor.whoCan`](https://serenity-js.org/api/core/class/Actor/#whoCan) in [`Cast.prepare`](https://serenity-js.org/api/core/class/Cast/#prepare), or via [`Cast.where`](https://serenity-js.org/api/core/class/Cast/#where).
 *
 * ```ts
 * import { beforeEach } from 'mocha'
 * import { engage, Actor, Cast } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { Browser, chromium } from 'playwright'
 *
 * beforeEach(async () => {
 *   const browser = await chromium.launch({ headless: true })
 *
 *   engage(
 *     BrowseTheWebWithPlaywright.using(browser),
 *   )
 * })
 * ```
 *
 * ### Learn more
 *
 * To learn more about using Serenity/JS with your chosen test integration tool, follow their respective documentation:
 *
 * - [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/)
 * - [`BrowseTheWebWithProtractor`](https://serenity-js.org/api/protractor/class/BrowseTheWebWithProtractor/)
 * - [`BrowseTheWebWithWebdriverIO`](https://serenity-js.org/api/webdriverio/class/BrowseTheWebWithWebdriverIO/)
 *
 * ## Using the ability to `BrowseTheWeb`
 *
 * To use the ability to `BrowseTheWeb` in a custom [`Interaction`](https://serenity-js.org/api/core/class/Interaction/)
 * or [`Question`](https://serenity-js.org/api/core/class/Question/), use the **generic** method [`BrowseTheWeb.as`](https://serenity-js.org/api/core/class/Ability/#as)
 * to retrieve it.
 *
 * This generic method retrieves the integration tool-specific implementation of [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) present on the [`Actor`](https://serenity-js.org/api/core/class/Actor/),
 * such as [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/)
 * or [`BrowseTheWebWithWebdriverIO`](https://serenity-js.org/api/webdriverio/class/BrowseTheWebWithWebdriverIO/), using [`Actor.abilityTo`](https://serenity-js.org/api/core/class/Actor/#abilityTo).
 *
 * This decoupling mechanism helps to make your test code portable across test integration tools,
 * since the only part of your test suite that needs to know about the test integration tool used are the actors.
 * The rest of your test code, so [tasks](https://serenity-js.org/api/core/class/Task/), [interactions](https://serenity-js.org/api/core/class/Interaction/), and [questions](https://serenity-js.org/api/core/class/Question/),
 * remain fully agnostic of the underlying tool.
 *
 * ```ts
 * import { BrowseTheWeb, Question } from '@serenity-js/web'
 *
 * const BrowserDetails = () =>
 *  Question.about('browser details', async actor => {
 *    const capabilities = await BrowseTheWeb.as(actor).browserCapabilities();
 *    return ${ capabilities.browserName } ${ capabilities.browserVersion }`;
 *  })
 * ```
 *
 * **Pro tip:** Use the specific `BrowseTheWebWith<test integration tool name>` to give the actor the ability,
 * and generic `BrowseTheWeb.as(actor)` to retrieve it.
 *
 * ### Learn more
 *
 * - [`Ability`](https://serenity-js.org/api/core/class/Ability/)
 * - [`Actor.whoCan`](https://serenity-js.org/api/core/class/Actor/#whoCan)
 * - [`Cast.where`](https://serenity-js.org/api/core/class/Cast/#where)
 * - [`Cast.prepare`](https://serenity-js.org/api/core/class/Cast/#prepare)
 *
 * @group Abilities
 */
export abstract class BrowseTheWeb<Native_Element_Type = any> extends Ability {

    constructor(protected readonly session: BrowsingSession<Page<Native_Element_Type>>) {
        super();
    }

    /**
     * Returns a [`Page`](https://serenity-js.org/api/web/class/Page/) representing the currently active browser tab.
     */
    async currentPage(): Promise<Page<Native_Element_Type>> {
        return this.session.currentPage();
    }

    /**
     * Returns an array of [pages](https://serenity-js.org/api/web/class/Page/) representing all the browser tabs
     * available in the current [`BrowsingSession`](https://serenity-js.org/api/web/class/BrowsingSession/).
     */
    allPages(): Promise<Array<Page<Native_Element_Type>>> {
        return this.session.allPages();
    }

    /**
     * Returns [basic meta-data](https://serenity-js.org/api/web/interface/BrowserCapabilities/) about the browser associated with this ability.
     */
    async browserCapabilities(): Promise<BrowserCapabilities> {
        return this.session.browserCapabilities();
    }
}
