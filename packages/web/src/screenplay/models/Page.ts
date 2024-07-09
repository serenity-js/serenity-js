import type { Expectation, ExpectationOutcome, Optional, QuestionAdapter } from '@serenity-js/core';
import { ExpectationMet, LogicError, Question } from '@serenity-js/core';
import type { CorrelationId } from '@serenity-js/core/lib/model';
import { ensure, isDefined } from 'tiny-types';
import type { URL } from 'url';

import { BrowseTheWeb } from '../abilities';
import type { BrowsingSession } from './BrowsingSession';
import type { Cookie } from './Cookie';
import type { CookieData } from './CookieData';
import type { ModalDialogHandler } from './dialogs';
import type { Key } from './Key';
import type { PageElement } from './PageElement';
import type { PageElements } from './PageElements';
import type { RootLocator } from './RootLocator';
import type { Selector } from './selectors';
import type { Switchable } from './Switchable';
import type { SwitchableOrigin } from './SwitchableOrigin';

/**
 * Serenity/JS Screenplay Pattern-style model that enables interactions with a Web page
 * rendered in a Web browser tab.
 *
 * ## Referring to the current page
 *
 * ```ts
 * import { Ensure, endsWith } from '@serenity-js/assertions'
 * import { actorCalled } from '@serenity-js/core'
 * import { Navigate, Page } from '@serenity-js/web'
 *
 * await actorCalled('Serena').attemptsTo(
 *   Navigate.to('https://serenity-js.org'),
 *   Ensure.that(Page.current().title(), endsWith('Serenity/JS')),
 * )
 * ```
 *
 * ## Switching to another open page
 *
 * ```ts
 * import { Ensure, equals, includes, startsWith } from '@serenity-js/assertions'
 * import { actorCalled } from '@serenity-js/core'
 * import { Navigate, Page, Switch, Text } from '@serenity-js/web'
 *
 * const Navigation = {
 *   linkTo = (name: Answerable<string>) =>
 *     PageElements.located(By.css('nav a'))
 *       .where(Text, includes(name))
 *       .first()
 * }
 *
 * await actorCalled('Serena').attemptsTo(
 *   Navigate.to('https://serenity-js.org'),
 *   Click.on(Navigation.linkTo('GitHub')),
 *
 *   Switch.to(Page.whichUrl(startsWith('https://github.com')))
 *
 *   Ensure.that(
 *     Page.current().url().href,
 *     equals('https://github.com/serenity-js/serenity-js')
 *   ),
 * )
 * ```
 *
 * ## Retrieving information about another open page
 *
 * You can retrieve information about another open page without having to explicitly switch to it:
 *
 * ```ts
 * import { Ensure, equals, includes, startsWith } from '@serenity-js/assertions'
 * import { actorCalled } from '@serenity-js/core'
 * import { Navigate, Page, Text } from '@serenity-js/web'
 *
 * const Navigation = {
 *   linkTo = (name: Answerable<string>) =>
 *     PageElements.located(By.css('nav a'))
 *       .where(Text, includes(name))
 *       .first()
 * }
 *
 * await actorCalled('Serena').attemptsTo(
 *   Navigate.to('https://serenity-js.org'),
 *   Click.on(Navigation.linkTo('GitHub')),
 *   Ensure.that(
 *     Page.whichUrl(startsWith('https://github.com')).url().href,
 *     equals('https://github.com/serenity-js/serenity-js')
 *   ),
 * )
 * ```
 *
 * ## Performing activities in the context of another page
 *
 * ```ts
 * import { Ensure, equals, includes, startsWith } from '@serenity-js/assertions'
 * import { actorCalled } from '@serenity-js/core'
 * import { Navigate, Page, Text } from '@serenity-js/web'
 *
 * const Navigation = {
 *   linkTo = (name: Answerable<string>) =>
 *     PageElements.located(By.css('nav a'))
 *       .where(Text, includes(name))
 *       .first()
 * }
 *
 * await actorCalled('Serena').attemptsTo(
 *
 *   // Serenity/JS GitHub repository opens in a new browser tab
 *   Navigate.to('https://serenity-js.org'),
 *   Click.on(Navigation.linkTo('GitHub')),
 *
 *   // Switch to the newly opened page and perform an assertion
 *   Switch.to(Page.whichUrl(startsWith('https://github.com')))
 *     .and(
 *       Ensure.that(
 *         Page.current().url().href,
 *         equals('https://github.com/serenity-js/serenity-js')
 *       )
 *     ),
 *   // Automatically switch back to the original page
 *
 *   Ensure.that(Page.current().url().href, equals('https://serenity-js.org'),
 * )
 * ```
 *
 * ## Learn more
 *
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 * - [`Optional`](https://serenity-js.org/api/core/interface/Optional/)
 * - [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/)
 *
 * @group Models
 */
export abstract class Page<Native_Element_Type = any> implements Optional, Switchable {

    /**
     * Creates a [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter) representing the currently active [`Page`](https://serenity-js.org/api/web/class/Page/).
     */
    static current(): QuestionAdapter<Page> {
        return Question.about<Page>('current page', actor => {
            return BrowseTheWeb.as(actor).currentPage();
        });
    }

    /**
     * Creates a [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter) that resolves to a [`Page`](https://serenity-js.org/api/web/class/Page/) which [`Page.name`](https://serenity-js.org/api/web/class/Page/#name)
     * meets the [expectation](https://serenity-js.org/api/core/class/Expectation/).
     *
     * #### Switching to a page with the desired name
     *
     * ```ts
     * import { includes } from '@serenity-js/assertions'
     * import { actorCalled } from '@serenity-js/core'
     * import { Switch } from '@serenity-js/web'
     *
     * actorCalled('Bernie').attemptsTo(
     *   Switch.to(Page.whichName(includes(`photo-gallery`))),
     * )
     * ```
     *
     * @param expectation
     */
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

    /**
     * Creates a [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter) that resolves to a [`Page`](https://serenity-js.org/api/web/class/Page/) which [`Page.title`](https://serenity-js.org/api/web/class/Page/#title)
     * meets the [expectation](https://serenity-js.org/api/core/class/Expectation/).
     *
     * #### Switching to a page with the desired title
     *
     * ```ts
     * import { includes } from '@serenity-js/assertions'
     * import { actorCalled } from '@serenity-js/core'
     * import { Switch } from '@serenity-js/web'
     *
     * actorCalled('Bernie').attemptsTo(
     *   Switch.to(Page.whichTitle(includes(`Summer collection`))),
     * )
     * ```
     *
     * @param expectation
     */
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

    /**
     * Creates a [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter) that resolves to a [`Page`](https://serenity-js.org/api/web/class/Page/) which [`Page.url`](https://serenity-js.org/api/web/class/Page/#url)
     * meets the [expectation](https://serenity-js.org/api/core/class/Expectation/).
     *
     * #### Switching to a page with the desired URL
     *
     * ```ts
     * import { endsWith } from '@serenity-js/assertions'
     * import { actorCalled } from '@serenity-js/core'
     * import { Switch } from '@serenity-js/web'
     *
     * actorCalled('Bernie').attemptsTo(
     *   Switch.to(Page.whichUrl(endsWith(`/gallery.html`))),
     * )
     * ```
     *
     * @param expectation
     */
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

    private static async findMatchingPage(expectationDescription: string, pages: Page[], matcher: (page: Page) => Promise<ExpectationOutcome>): Promise<Page> {
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
     * Creates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) wrapping a native element.
     *
     * @param nativeElement
     */
    abstract createPageElement(nativeElement: Native_Element_Type): PageElement<Native_Element_Type>;

    /**
     * Creates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/), retrieving an element located by [`Selector`](https://serenity-js.org/api/web/class/Selector/).
     *
     * @param selector
     */
    abstract locate(selector: Selector): PageElement<Native_Element_Type>;

    /**
     * Creates [`PageElement`](https://serenity-js.org/api/web/class/PageElements/), retrieving a collection of elements located by [`Selector`](https://serenity-js.org/api/web/class/Selector/).
     *
     * @param selector
     */
    // abstract locateAll(selector: Selector): PageElements<Native_Element_Type>;
    abstract locateAll(selector: Selector): PageElements<Native_Element_Type>;

    /**
     * Navigate to a given destination, specified as an absolute URL
     * or a path relative to any base URL configured in your web test integration tool.
     *
     * #### Learn more
     *
     * - [WebdriverIO: Configuration Options](https://webdriver.io/docs/options/#baseurl)
     * - [Playwright: Browser](https://playwright.dev/docs/api/class-browser#browser-new-context)
     * - [Playwright: Test Options](https://playwright.dev/docs/api/class-testoptions#test-options-base-url)
     * - [Protractor: Configuration](https://github.com/angular/protractor/blob/master/lib/config.ts)
     *
     * @param destination
     */
    abstract navigateTo(destination: string): Promise<void>;

    /**
     * Causes the browser to traverse one step backward in the joint session history
     * of the current [`Page`](https://serenity-js.org/api/web/class/Page/) (the current top-level browsing context).
     *
     * This is equivalent to pressing the back button in the browser UI,
     * or calling [`window.history.back`](https://developer.mozilla.org/en-US/docs/Web/API/History/back).
     */
    abstract navigateBack(): Promise<void>;

    /**
     * Causes the browser to traverse one step forward in the joint session history
     * of the current [`Page`](https://serenity-js.org/api/web/class/Page/) (the current top-level browsing context).
     *
     * This is equivalent to pressing the back button in the browser UI,
     * or calling [`window.history.forward`](https://developer.mozilla.org/en-US/docs/Web/API/History/forward).
     */
    abstract navigateForward(): Promise<void>;

    /**
     * Causes the browser to reload the [`Page`](https://serenity-js.org/api/web/class/Page/) in the current top-level browsing context.
     */
    abstract reload(): Promise<void>;

    /**
     * Send a sequence of [`Key`](https://serenity-js.org/api/web/class/Key/) strokes to the active element.
     *
     * @param keys
     *  Keys to enter
     */
    abstract sendKeys(keys: Array<Key | string>): Promise<void>;

    /**
     * Schedules a command to execute JavaScript in the context of the currently selected frame or window.
     *
     * The script fragment will be executed as the body of an anonymous function.
     * If the script is provided as a function object, that function will be converted to a string for injection
     * into the target window.
     *
     * Any arguments provided in addition to the script will be included as script arguments and may be referenced
     * using the `arguments` object. Arguments may be a `boolean`, `number`, `string` or `WebElement`.
     * Arrays and objects may also be used as script arguments as long as each item adheres
     * to the types previously mentioned.
     *
     * The script may refer to any variables accessible from the current window.
     * Furthermore, the script will execute in the window's context, thus `document` may be used to refer
     * to the current document. Any local variables will not be available once the script has finished executing,
     * though global variables will persist.
     *
     * If the script has a return value (i.e. if the script contains a `return` statement),
     * then the following steps will be taken for resolving this functions return value:
     *
     * - For a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/), the value will resolve to a [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
     * - `null` and `undefined` return values will resolve to `null`
     * - `boolean`, `number`, and `string` values will resolve as is
     * - Functions will resolve to their string representation
     * - For arrays and objects, each member item will be converted according to the rules above
     *
     * #### Use injected JavaScript to retrieve information about a HTMLElement
     *
     * ```ts
     * BrowseTheWeb.as(actor).executeAsyncScript(`
     *   return arguments[0].tagName;
     * `, PageElement.located(By.css('h1')).describedAs('header'))
     *
     * // returns a Promise that resolves to 'h1'
     * ```
     *
     * #### Learn more
     * - [Selenium WebDriver: JavaScript Executor](https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html#executeAsyncScript-java.lang.String-java.lang.Object...-)
     * - [`Page.lastScriptExecutionResult`](https://serenity-js.org/api/web/class/Page/#lastScriptExecutionResult)
     *
     * @param script
     * @param args
     */
    abstract executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result>;

    /**
     * Schedules a command to execute asynchronous JavaScript in the context of the currently selected frame or window.
     *
     * The script fragment will be executed as the body of an anonymous function.
     * If the script is provided as a function object, that function will be converted to a string for injection
     * into the target window.
     *
     * Any arguments provided in addition to the script will be included as script arguments and may be referenced
     * using the `arguments` object. Arguments may be a `boolean`, `number`, `string` or `WebElement`
     * Arrays and objects may also be used as script arguments as long as each item adheres
     * to the types previously mentioned.
     *
     * Unlike executing synchronous JavaScript with [`Page.executeScript`](https://serenity-js.org/api/web/class/Page/#executeScript),
     * scripts executed with this function must explicitly signal they are finished by invoking the provided callback.
     *
     * This callback will always be injected into the executed function as the last argument,
     * and thus may be referenced with `arguments[arguments.length - 1]`.
     *
     * The following steps will be taken for resolving this functions return value against
     * the first argument to the script's callback function:
     *
     * - For a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/), the value will resolve to a [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
     * - `null` and `undefined` return values will resolve to `null`
     * - `boolean`, `number`, and `string` values will resolve as is
     * - Functions will resolve to their string representation
     * - For arrays and objects, each member item will be converted according to the rules above
     *
     * #### Perform a sleep in the browser under test>
     *
     * ```ts
     * BrowseTheWeb.as(actor).executeAsyncScript(`
     *   var delay    = arguments[0];
     *   var callback = arguments[arguments.length - 1];
     *
     *   window.setTimeout(callback, delay);
     * `, 500)
     * ```
     *
     * #### Return a value asynchronously
     *
     * ```ts
     * BrowseTheWeb.as(actor).executeAsyncScript(`
     *   var callback = arguments[arguments.length - 1];
     *
     *   callback('some return value')
     * `).then(value => doSomethingWithThe(value))
     * ```
     *
     * #### Learn more
     * - [Selenium WebDriver: JavaScript Executor](https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html#executeAsyncScript-java.lang.String-java.lang.Object...-)
     * - [`Page.lastScriptExecutionResult`](https://serenity-js.org/api/web/class/Page/#lastScriptExecutionResult)
     *
     * @param script
     * @param args
     */
    abstract executeAsyncScript<Result, Parameters extends any[]>(
        script: string | ((...args: [ ...parameters: Parameters, callback: (result: Result) => void ]) => void),
        ...args: Parameters
    ): Promise<Result>;

    /**
     * Returns the last result of calling [`Page.executeAsyncScript`](https://serenity-js.org/api/web/class/Page/#executeAsyncScript)
     * or [`Page.executeScript`](https://serenity-js.org/api/web/class/Page/#executeScript)
     */
    abstract lastScriptExecutionResult<R = any>(): R;

    /**
     * Take a screenshot of the top-level browsing context's viewport.
     *
     * @throws [`BrowserWindowClosedError`](https://serenity-js.org/api/web/class/BrowserWindowClosedError/)
     *  When the page you're trying to take the screenshot of has already been closed
     *
     * @return
     *  A promise that will resolve to a base64-encoded screenshot PNG
     */
    abstract takeScreenshot(): Promise<string>;

    /**
     * Retrieves a cookie identified by `name` and visible to this [`Page`](https://serenity-js.org/api/web/class/Page/).
     *
     * @param name
     */
    abstract cookie(name: string): Promise<Cookie>;

    /**
     * Adds a single cookie with [`CookieData`](https://serenity-js.org/api/web/interface/CookieData/) to the cookie store associated
     * with the active [`Page`](https://serenity-js.org/api/web/class/Page/)'s address.
     *
     * @param cookieData
     */
    abstract setCookie(cookieData: CookieData): Promise<void>;

    /**
     * Removes all the cookies.
     */
    abstract deleteAllCookies(): Promise<void>;

    /**
     * Retrieves the document title of the current top-level browsing context, equivalent to calling `document.title`.
     *
     * #### Learn more
     * - [Mozilla Developer Network: Document title](https://developer.mozilla.org/en-US/docs/Web/API/Document/title)
     */
    abstract title(): Promise<string>;

    /**
     * Retrieves the [URL](https://nodejs.org/api/url.html) of the current top-level browsing context.
     */
    abstract url(): Promise<URL>;

    /**
     * Retrieves the name of the current top-level browsing context.
     */
    abstract name(): Promise<string>;

    /**
     * Checks if a given window / tab / page is open and can be switched to, e.g. it's not closed.
     */
    abstract isPresent(): Promise<boolean>;

    /**
     * Returns the actual viewport size available for the given page,
     * excluding any scrollbars.
     */
    abstract viewportSize(): Promise<{ width: number, height: number }>;

    /**
     * Sets ths size of the visible viewport to desired dimensions.
     *
     * @param size
     */
    abstract setViewportSize(size: { width: number, height: number }): Promise<void>;

    /**
     * Switches the current browsing context to the given page
     * and returns an object that allows the caller to switch back
     * to the previous context when needed.
     *
     * ## Learn more
     * - [`Switch`](https://serenity-js.org/api/web/class/Switch/)
     * - [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/)
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
     * Closes this page.
     */
    abstract close(): Promise<void>;

    /**
     * Closes any open pages, except for this one.
     */
    abstract closeOthers(): Promise<void>;

    /**
     * Returns the [`ModalDialogHandler`](https://serenity-js.org/api/web/class/ModalDialogHandler/) for the current [`Page`](https://serenity-js.org/api/web/class/Page/).
     */
    modalDialog(): ModalDialogHandler {
        return this.modalDialogHandler;
    }

    /**
     * Returns a description of this Page and its ID.
     */
    toString(): string {
        return `page (id=${ this.id.value })`;
    }
}
