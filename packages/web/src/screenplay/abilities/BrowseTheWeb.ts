import { Ability, Duration, f, LogicError, UsesAbilities } from '@serenity-js/core';

import { Key } from '../../input';
import { Cookie, CookieData, Frame, Locator, ModalDialog, Page, Selector } from '../models';
import { BrowserCapabilities } from './BrowserCapabilities';

export abstract class BrowseTheWeb<Native_Element_Type = any, Native_Root_Element_Type = unknown> implements Ability {

    /**
     * @desc
     *  Used to access the Actor's ability to {@link BrowseTheWeb}
     *  from within the {@link @serenity-js/core/lib/screenplay~Interaction} classes,
     *  such as {@link Click}.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~UsesAbilities} actor
     * @return {BrowseTheWeb}
     */
    static as<NET = any, NRET = unknown>(actor: UsesAbilities): BrowseTheWeb<NET, NRET> {
        return actor.abilityTo(BrowseTheWeb) as BrowseTheWeb<NET, NRET>;
    }

    protected constructor(
        protected locators: Map<new (...args: unknown[]) => Selector, (selector: Selector) => Locator<Native_Element_Type, Native_Root_Element_Type>>
    ) {
    }

    abstract navigateTo(destination: string): Promise<void>;
    abstract navigateBack(): Promise<void>;
    abstract navigateForward(): Promise<void>;
    abstract reloadPage(): Promise<void>;

    abstract waitFor(duration: Duration): Promise<void>;

    abstract waitUntil(condition: () => boolean | Promise<boolean>, timeout: Duration): Promise<void>;

    locate(selector: Selector): Locator<Native_Element_Type, Native_Root_Element_Type> {
        for (const [ type, locatorFactory ] of this.locators) {
            if (selector instanceof type) {
                return locatorFactory(selector);
            }
        }

        throw new LogicError(f `${ selector } is not supported by ${ this.constructor.name }`);
    }

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

    abstract frame(bySelector: Selector): Promise<Frame>;

    /**
     * @desc
     *  Returns a {@link Page} representing the currently active top-level browsing context.
     *
     * @returns {Promise<Page>}
     */
    abstract currentPage(): Promise<Page>;

    /**
     * @desc
     *  Returns an array of {@link Page} objects representing all the available
     *  top-level browsing context, e.g. all the open browser tabs.
     *
     * @returns {Promise<Array<Page>>}
     */
    abstract allPages(): Promise<Array<Page>>;

    abstract cookie(name: string): Promise<Cookie>;
    abstract setCookie(cookieData: CookieData): Promise<void>;
    abstract deleteAllCookies(): Promise<void>;

    abstract modalDialog(): Promise<ModalDialog>;
}

