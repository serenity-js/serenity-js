import { Ability, UsesAbilities } from '@serenity-js/core';

import { Key } from '../../input';
import { Cookie, CookieData, ModalDialog, Page } from '../models';
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

    abstract navigateTo(destination: string): Promise<void>;
    abstract navigateBack(): Promise<void>;
    abstract navigateForward(): Promise<void>;
    abstract reloadPage(): Promise<void>;

    abstract browserCapabilities(): Promise<BrowserCapabilities>;

    abstract sendKeys(keys: Array<Key | string>): Promise<void>;

    abstract executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result>;

    abstract executeAsyncScript<Result, Parameters extends any[]>(
        script: string | ((...args: [ ...parameters: Parameters, callback: (result: Result) => void ]) => void),
        ...args: Parameters
    ): Promise<Result>;

    abstract lastScriptExecutionResult<R = any>(): R;

    abstract takeScreenshot(): Promise<string>;

    /**
     * @desc
     *  Returns a {@link Page} representing the currently active top-level browsing context.
     *
     * @returns {Promise<Page>}
     */
    abstract currentPage(): Promise<Page<Native_Element_Type>>;

    /**
     * @desc
     *  Returns an array of {@link Page} objects representing all the available
     *  top-level browsing context, e.g. all the open browser tabs.
     *
     * @returns {Promise<Array<Page>>}
     */
    abstract allPages(): Promise<Array<Page<Native_Element_Type>>>;

    abstract cookie(name: string): Promise<Cookie>;
    abstract setCookie(cookieData: CookieData): Promise<void>;
    abstract deleteAllCookies(): Promise<void>;

    abstract modalDialog(): Promise<ModalDialog>;
}

