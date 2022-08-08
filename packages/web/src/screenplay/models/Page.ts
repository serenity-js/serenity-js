import { Expectation, ExpectationMet, ExpectationOutcome, LogicError, Optional, Question, QuestionAdapter } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model';
import { ensure, isDefined } from 'tiny-types';
import { URL } from 'url';

import { Key } from '../../models';
import { BrowseTheWeb } from '../abilities';
import { BrowsingSession } from './BrowsingSession';
import { Cookie } from './Cookie';
import { CookieData } from './CookieData';
import { ModalDialogHandler } from './dialogs';
import { PageElement } from './PageElement';
import { PageElements } from './PageElements';
import { RootLocator } from './RootLocator';
import { Selector } from './selectors';
import { Switchable } from './Switchable';
import { SwitchableOrigin } from './SwitchableOrigin';

export abstract class Page<Native_Element_Type = any> implements Optional, Switchable {
    static current(): QuestionAdapter<Page> {
        return Question.about<Page>('current page', actor => {
            return BrowseTheWeb.as(actor).currentPage();
        });
    }

    static whichName(expectation: Expectation<string>): QuestionAdapter<Page> {
        return Question.about(`page which name does ${ expectation }`, async actor => {
            const pages     = await BrowseTheWeb.as(actor).allPages();

            return Page.findMatchingPage(
                `name does ${ expectation }`,
                pages,
                page => actor.answer(expectation.isMetFor(page.name())),
            );
        });
    }

    static whichTitle(expectation: Expectation<string>): QuestionAdapter<Page> {
        return Question.about(`page which title does ${ expectation }`, async actor => {
            const pages     = await BrowseTheWeb.as(actor).allPages();

            return Page.findMatchingPage(
                `title does ${ expectation }`,
                pages,
                page => actor.answer(expectation.isMetFor(page.title())),
            );
        });
    }

    static whichUrl(expectation: Expectation<string>): QuestionAdapter<Page> {
        return Question.about(`page which URL does ${ expectation }`, async actor => {
            const pages     = await BrowseTheWeb.as(actor).allPages();

            return Page.findMatchingPage(
                `url does ${ expectation }`,
                pages,
                page => actor.answer(expectation.isMetFor(
                    page.url().then(url => url.toString()))
                )
            );
        });
    }

    private static async findMatchingPage(expectationDescription: string, pages: Page[], matcher: (page: Page) => Promise<ExpectationOutcome<any, any>>): Promise<Page> {
        for (const page of pages) {
            const outcome  = await matcher(page);

            if (outcome instanceof ExpectationMet) {
                return page;
            }
        }

        throw new LogicError(`Couldn't find a page which ${ expectationDescription }`);
    }

    constructor(
        protected readonly session: BrowsingSession<Page<Native_Element_Type>>,
        protected readonly rootLocator: RootLocator<Native_Element_Type>,
        protected modalDialogHandler: ModalDialogHandler,
        public readonly id: CorrelationId,
    ) {
        ensure('session', session, isDefined());
        ensure('rootLocator', rootLocator, isDefined());
        ensure('modalDialogHandler', modalDialogHandler, isDefined());
        ensure('id', id, isDefined());
    }

    /**
     * @desc
     *  Creates a {@link PageElement}, located by `selector`.
     *
     * @param {Selector} selector
     * @returns {PageElement<Native_Element_Type>}
     */
    abstract locate(selector: Selector): PageElement<Native_Element_Type>;

    /**
     * @desc
     *  Creates {@link PageElements}, located by `selector`.
     *
     * @param {Selector} selector
     * @returns {PageElements<Native_Element_Type>}
     */
    abstract locateAll(selector: Selector): PageElements<Native_Element_Type>;

    /**
     * @desc
     *  Navigate to a given destination, specified as an absolute URL
     *  or a path relative to any base URL configured in your web integration tool.
     *
     * @param {string} destination
     * @returns {Promise<void>}
     *
     * @see https://webdriver.io/docs/options/#baseurl
     * @see https://playwright.dev/docs/api/class-browser#browser-new-context
     * @see https://playwright.dev/docs/api/class-testoptions#test-options-base-url
     * @see https://github.com/angular/protractor/blob/master/lib/config.ts
     */
    abstract navigateTo(destination: string): Promise<void>;

    /**
     * @desc
     *  Causes the browser to traverse one step backward in the joint session history
     *  of the current {@link Page} (the current top-level browsing context).
     *
     *  This is equivalent to pressing the back button in the browser UI,
     *  or calling {@link window.history.back}
     *
     * @returns {Promise<void>}
     */
    abstract navigateBack(): Promise<void>;

    /**
     * @desc
     *  Causes the browser to traverse one step forward in the joint session history
     *  of the current {@link Page} (the current top-level browsing context).
     *
     *  This is equivalent to pressing the back button in the browser UI,
     *  or calling {@link window.history.forward}
     *
     * @returns {Promise<void>}
     */
    abstract navigateForward(): Promise<void>;

    /**
     * @desc
     *  causes the browser to reload the {@link Page} in current top-level browsing context.
     *
     * @returns {Promise<void>}
     */
    abstract reload(): Promise<void>;

    /**
     * @desc
     *  Send a sequence of {@link Key} strokes to the active element.
     *
     * @param {Array<Key | string>} keys
     *  Keys to enter
     *
     * @returns {Promise<void>}
     */
    abstract sendKeys(keys: Array<Key | string>): Promise<void>;

    /**
     * @desc
     *  Schedules a command to execute JavaScript in the context of the currently selected frame or window.
     *
     *  The script fragment will be executed as the body of an anonymous function.
     *  If the script is provided as a function object, that function will be converted to a string for injection
     *  into the target window.
     *
     *  Any arguments provided in addition to the script will be included as script arguments and may be referenced
     *  using the `arguments` object. Arguments may be a `boolean`, `number`, `string` or `WebElement`.
     *  Arrays and objects may also be used as script arguments as long as each item adheres
     *  to the types previously mentioned.
     *
     *  The script may refer to any variables accessible from the current window.
     *  Furthermore, the script will execute in the window's context, thus `document` may be used to refer
     *  to the current document. Any local variables will not be available once the script has finished executing,
     *  though global variables will persist.
     *
     *  If the script has a return value (i.e. if the script contains a `return` statement),
     *  then the following steps will be taken for resolving this functions return value:
     *
     *  For a HTML element, the value will resolve to a WebElement
     *  - Null and undefined return values will resolve to null
     *  - Booleans, numbers, and strings will resolve as is
     *  - Functions will resolve to their string representation
     *  - For arrays and objects, each member item will be converted according to the rules above
     *
     * @example <caption>Perform a sleep in the browser under test</caption>
     * BrowseTheWeb.as(actor).executeAsyncScript(`
     *   return arguments[0].tagName;
     * `, Target.the('header').located(by.css(h1))
     *
     * @see https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html#executeScript-java.lang.String-java.lang.Object...-
     *
     * @param {string | Function} script
     * @param {any[]} args
     *
     * @returns {Promise<any>}
     *
     * @see {@link BrowseTheWeb#getLastScriptExecutionResult}
     */
    abstract executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result>;

    /**
     * @desc
     *  Schedules a command to execute asynchronous JavaScript in the context of the currently selected frame or window.
     *
     *  The script fragment will be executed as the body of an anonymous function.
     *  If the script is provided as a function object, that function will be converted to a string for injection
     *  into the target window.
     *
     *  Any arguments provided in addition to the script will be included as script arguments and may be referenced
     *  using the `arguments` object. Arguments may be a `boolean`, `number`, `string` or `WebElement`
     *  Arrays and objects may also be used as script arguments as long as each item adheres
     *  to the types previously mentioned.
     *
     *  Unlike executing synchronous JavaScript with {@link BrowseTheWeb#executeScript},
     *  scripts executed with this function must explicitly signal they are finished by invoking the provided callback.
     *
     *  This callback will always be injected into the executed function as the last argument,
     *  and thus may be referenced with `arguments[arguments.length - 1]`.
     *
     *  The following steps will be taken for resolving this functions return value against
     *  the first argument to the script's callback function:
     *
     *  - For a HTML element, the value will resolve to a WebElement
     *  - Null and undefined return values will resolve to null
     *  - Booleans, numbers, and strings will resolve as is
     *  - Functions will resolve to their string representation
     *  - For arrays and objects, each member item will be converted according to the rules above
     *
     * @example <caption>Perform a sleep in the browser under test</caption>
     * BrowseTheWeb.as(actor).executeAsyncScript(`
     *   var delay    = arguments[0];
     *   var callback = arguments[arguments.length - 1];
     *
     *   window.setTimeout(callback, delay);
     * `, 500)
     *
     * @example <caption>Return a value asynchronously</caption>
     * BrowseTheWeb.as(actor).executeAsyncScript(`
     *   var callback = arguments[arguments.length - 1];
     *
     *   callback('some return value')
     * `).then(value => doSomethingWithThe(value))
     *
     * @see https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html#executeAsyncScript-java.lang.String-java.lang.Object...-
     *
     * @param {string|Function} script
     * @param {any[]} args
     *
     * @returns {Promise<any>}
     *
     * @see {@link BrowseTheWeb#getLastScriptExecutionResult}
     */
    abstract executeAsyncScript<Result, Parameters extends any[]>(
        script: string | ((...args: [ ...parameters: Parameters, callback: (result: Result) => void ]) => void),
        ...args: Parameters
    ): Promise<Result>;

    /**
     * Returns the last result of calling [[BrowseTheWeb#executeAsyncScript]]
     * or [[BrowseTheWeb.executeScript]]
     */
    abstract lastScriptExecutionResult<R = any>(): R;

    /**
     * @desc
     *  Take a screenshot of the top-level browsing context's viewport
     *
     * @throws {@link BrowserWindowClosedError}
     *  When the page you're trying to take the screenshot of has already been closed
     *
     * @return {Promise<string>}
     *  A promise that will resolve to a base64-encoded screenshot PNG
     */
    abstract takeScreenshot(): Promise<string>;

    /**
     * @desc
     *  Retrieves a cookie identified by `name` and visible to this {@link Page}.
     *
     * @param {string} name
     * @returns {Promise<Cookie>}
     */
    abstract cookie(name: string): Promise<Cookie>;

    /**
     * @desc
     *  Adds a single cookie with {@link CookieData} to the cookie store associated
     *  with the active {@link Page}'s address.
     *
     * @param {CookieData} cookieData
     * @returns {Promise<void>}
     */
    abstract setCookie(cookieData: CookieData): Promise<void>;

    /**
     * @desc
     *  Removes all the cookies.
     *
     * @returns {Promise<void>}
     */
    abstract deleteAllCookies(): Promise<void>;

    /**
     * @desc
     *  Retrieves the document title of the current top-level browsing context, equivalent to calling `document.title`.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title
     *
     * @returns {Promise<string>}
     */
    abstract title(): Promise<string>;

    /**
     * @desc
     *  Retrieves the URL of the current top-level browsing context.
     *
     * @returns {Promise<URL>}
     */
    abstract url(): Promise<URL>;

    /**
     * @desc
     *  Retrieves the name of the current top-level browsing context.
     *
     * @returns {Promise<string>}
     */
    abstract name(): Promise<string>;

    /**
     * @desc
     *  Checks if a given window / tab / page is open and can be switched to.
     *
     * @returns {Promise<string>}
     */
    abstract isPresent(): Promise<boolean>;

    /**
     * @desc
     *  Returns the actual viewport size available for the given page,
     *  excluding any scrollbars.
     *
     * @returns {Promise<{ width: number, height: number }>}
     */
    abstract viewportSize(): Promise<{ width: number, height: number }>;

    /**
     *
     * @param size
     */
    abstract setViewportSize(size: { width: number, height: number }): Promise<void>;

    /**
     * @desc
     *  Switches the current browsing context to the given page
     *  and returns an object that allows the caller to switch back
     *  to the previous context if needed.
     *
     * @returns {Promise<SwitchableOrigin>}
     *
     * @see {@link Switch}
     * @see {@link Switchable}
     */
    async switchTo(): Promise<SwitchableOrigin> {

        const originalPage = await this.session.currentPage();

        await this.session.changeCurrentPageTo(this);

        return {
            switchBack: async (): Promise<void> => {
                await this.session.changeCurrentPageTo(originalPage);
            }
        }
    }

    /**
     * @desc
     *  Closes the given page.
     *
     * @returns {Promise<void>}
     */
    abstract close(): Promise<void>;

    /**
     * @desc
     *  Closes any open pages, except for this one.
     *
     * @returns {Promise<void>}
     */
    abstract closeOthers(): Promise<void>;

    /**
     * @desc
     *  Returns the {@link ModalDialogHandler} for the current {@link Page}.
     *
     * @returns {ModalDialogHandler}
     */
    modalDialog(): ModalDialogHandler {
        return this.modalDialogHandler;
    }

    /**
     * @desc
     *  Returns a description of this object.
     *
     * @returns {string}
     */
    toString(): string {
        return `page (id=${ this.id.value })`;
    }
}
