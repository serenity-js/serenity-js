import { Ability, Duration, UsesAbilities } from '@serenity-js/core';

import { Key } from '../../input';
import { Cookie, ModalDialog, Page, PageElement, PageElementList, PageElementLocation } from '../models';
import { BrowserCapabilities } from './BrowserCapabilities';

export abstract class BrowseTheWeb implements Ability {
    /**
     * @desc
     *  Used to access the Actor's ability to {@link BrowseTheWeb}
     *  from within the {@link @serenity-js/core/lib/screenplay~Interaction} classes,
     *  such as {@link Click}.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~UsesAbilities} actor
     * @return {BrowseTheWeb}
     */
    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    abstract navigateTo(destination: string): Promise<void>;

    abstract navigateBack(): Promise<void>;

    abstract navigateForward(): Promise<void>;

    abstract reloadPage(): Promise<void>;

    abstract waitFor(duration: Duration): Promise<void>;

    abstract waitUntil(condition: () => boolean | Promise<boolean>, timeout: Duration): Promise<void>;

    abstract locateElementAt(location: PageElementLocation): Promise<PageElement>;

    abstract locateAllElementsAt(location: PageElementLocation): Promise<PageElementList>;

    abstract title(): Promise<string>;

    abstract currentUrl(): Promise<string>;

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
    abstract deleteAllCookies(): Promise<void>;

    abstract modalDialog(): Promise<ModalDialog>;

    // todo: remove
    abstract switchToWindow(nameOrHandleOrIndex: string | number): Promise<void>;
    abstract switchToOriginalWindow(): Promise<void>;
    abstract getCurrentWindowHandle(): Promise<string>;
    abstract getAllWindowHandles(): Promise<string[]>;
    abstract closeCurrentWindow(): Promise<void>;

    // todo: remove
    abstract switchToFrame(targetOrIndex: PageElement | number | string): Promise<void>;
    abstract switchToParentFrame(): Promise<void>;
    abstract switchToDefaultContent(): Promise<void>;
}

