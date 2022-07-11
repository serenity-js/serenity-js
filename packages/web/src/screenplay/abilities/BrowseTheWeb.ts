import { Ability, UsesAbilities } from '@serenity-js/core';

import { BrowsingSession, Page } from '../models';
import { BrowserCapabilities } from './BrowserCapabilities';

export abstract class BrowseTheWeb<Native_Element_Type = any> implements Ability {

    /**
     * @desc
     *  Used to access the Actor's ability to {@link BrowseTheWeb}
     *  from within the {@link @serenity-js/core/lib/screenplay~Interaction} classes,
     *  such as {@link Click}.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~UsesAbilities} actor
     * @return {BrowseTheWeb}
     */
    static as<NET = any>(actor: UsesAbilities): BrowseTheWeb<NET> {
        return actor.abilityTo(BrowseTheWeb) as BrowseTheWeb<NET>;
    }

    /**
     * @param {BrowsingSession<Page>} session
     *
     * @protected
     */
    protected constructor(protected readonly session: BrowsingSession<Page<Native_Element_Type>>) {
    }

    /**
     * @desc
     *  Returns basic meta-data about the browser associated with this ability.
     *
     * @returns {Promise<BrowserCapabilities>}
     */
    abstract browserCapabilities(): Promise<BrowserCapabilities>;

    /**
     * @desc
     *  Returns a {@link Page} representing the currently active top-level browsing context.
     *
     * @returns {Promise<Page>}
     */
    async currentPage(): Promise<Page<Native_Element_Type>> {
        return this.session.currentPage();
    }

    /**
     * @desc
     *  Returns an array of {@link Page} objects representing all the available
     *  top-level browsing context, e.g. all the open browser tabs.
     *
     * @returns {Promise<Array<Page>>}
     */
    allPages(): Promise<Array<Page<Native_Element_Type>>> {
        return this.session.allPages();
    }
}
