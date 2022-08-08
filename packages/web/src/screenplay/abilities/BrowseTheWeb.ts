import { Ability, UsesAbilities } from '@serenity-js/core';

import { BrowserCapabilities, BrowsingSession, Page } from '../models';

/**
 * The {@link Ability|ability} to `BrowseTheWeb` enables an {@link Actor|actor}
 * to {@link Interaction|interact with} and {@link Question|retrieve information from} Web-based user interfaces.
 *
 * `BrowseTheWeb` wraps test integration tools such as [Playwright](/api/playwright),
 * [Protractor](/api/protractor), or [WebdriverIO](/api/webdriverio),
 * and together with Serenity/JS Web models, such as {@link Page} or {@link PageElement} - offers a standardised way
 * to write Web-based tests following the Screenplay Pattern.
 *
 * The consistent and portable design of abstractions provided by the [`@serenity-js/web` module](/api/web)
 * also helps to make your tests portable across the various test integration tools and helps to make your test
 * code easier to reuse across projects and teams.
 *
 * ## Giving the actors an ability to `BrowseTheWeb`
 *
 * To give an {@link Actor|actor} an ability to `BrowseTheWeb`, provide the **integration tool-specific implementation**
 * via [[Actor.whoCan]] in [[Cast.prepare]], or via [[Cast.whereEveryoneCan]].
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
 * - {@link BrowseTheWebWithPlaywright}
 * - {@link BrowseTheWebWithProtractor}
 * - {@link BrowseTheWebWithWebdriverIO}
 *
 * ## Using the ability to `BrowseTheWeb`
 *
 * To use the ability to `BrowseTheWeb` in a custom {@link Interaction} or {@link Question}, use the **generic** method [[BrowseTheWeb.as]]
 * to retrieve it.
 *
 * This generic method retrieves the integration tool-specific implementation of {@link BrowseTheWeb} present on the {@link Actor},
 * such as {@link BrowseTheWebWithPlaywright} or {@link BrowseTheWebWethWebdriverIO}, using [[Actor.abilityTo]].
 *
 * This decoupling mechanism helps to make your test code portable across test integration tools,
 * since the only part of your test suite that needs to know about the test integration tool used are the actors.
 * The rest of your test code, so {@link Task|tasks}, {@link Interaction|interactions}, and {@link Question|questions},
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
 * - [[Ability]]
 * - [[Actor.whoCan]]
 * - [[Cast.whereEveryoneCan]]
 * - [[Cast.prepare]]
 *
 * @group Abilities
 */
export abstract class BrowseTheWeb<Native_Element_Type = any> implements Ability {

    /**
     * Used to access the {@link Actor}'s {@link Ability|ability} to {@link BrowseTheWeb}
     * from within the {@link Interaction|interactions}, such as {@link Click},
     * and {@link Question|questions}, such as {@link Attribute}.
     *
     * @param actor
     */
    static as<NET = any>(actor: UsesAbilities): BrowseTheWeb<NET> {
        return actor.abilityTo(BrowseTheWeb) as BrowseTheWeb<NET>;
    }

    protected constructor(protected readonly session: BrowsingSession<Page<Native_Element_Type>>) {
    }

    /**
     * Returns {@link BrowserCapabilities|basic meta-data} about the browser associated with this ability.
     */
    abstract browserCapabilities(): Promise<BrowserCapabilities>;

    /**
     * Returns a {@link Page} representing the currently active browser tab.
     */
    async currentPage(): Promise<Page<Native_Element_Type>> {
        return this.session.currentPage();
    }

    /**
     * Returns an array of {@link Page|pages} representing all the browser tabs
     * available in the current {@link BrowsingSession}.
     */
    allPages(): Promise<Array<Page<Native_Element_Type>>> {
        return this.session.allPages();
    }
}
