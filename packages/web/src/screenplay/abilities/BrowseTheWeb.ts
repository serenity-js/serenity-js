import { Ability, UsesAbilities } from '@serenity-js/core';

import { BrowsingSession, Page } from '../models';
import { BrowserCapabilities } from './BrowserCapabilities';

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
