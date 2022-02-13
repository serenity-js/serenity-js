import { Duration, LogicError } from '@serenity-js/core';
import { BrowserCapabilities, BrowseTheWeb, ByCss, ByCssContainingText, ById, ByTagName, ByXPath, Cookie, CookieData, Frame, Key, ModalDialog, Page, Selector } from '@serenity-js/web';
import type * as wdio from 'webdriverio';

import { WebdriverIOCookie, WebdriverIOFrame, WebdriverIOModalDialog, WebdriverIOPage, WebdriverIOPageElement } from '../models';
import { WebdriverIOLocator, WebdriverIONativeElementRoot } from '../models/locators';

/**
 * @desc
 *  An {@link @serenity-js/core/lib/screenplay~Ability} that enables the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  to interact with Web apps using [WebdriverIO](https://webdriver.io/).
 *
 *  *Please note*: this class is still marked as experimental while new WebdriverIO Interactions and Questions are being developed.
 *  This means that its interface can change without affecting the major version of Serenity/JS itself.
 *  In particular, please don't rely on the `browser` field to remain `public` in future releases.
 *
 * @example <caption>Using the WebdriverIO browser</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { BrowseTheWeb, by, Navigate, Target } from '@serenity-js/webdriverio'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Wendy').whoCan(
 *      BrowseTheWeb.using(browser),
 *  );
 *
 *  const HomePage = {
 *      Title: Target.the('title').located(by.css('h1')),
 *  };
 *
 *  actor.attemptsTo(
 *      Navigate.to(`https://serenity-js.org`),
 *      Ensure.that(Text.of(HomePage.Title), equals('Serenity/JS')),
 *  );
 *
 * @see https://webdriver.io/
 *
 * @public
 * @implements {@serenity-js/core/lib/screenplay~Ability}
 * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
 */
export class BrowseTheWebWithWebdriverIO extends BrowseTheWeb<wdio.Element<'async'>, WebdriverIONativeElementRoot> {

    /**
     * @param {@wdio/types~Browser} browserInstance
     * @returns {BrowseTheWebWithWebdriverIO}
     */
    static using(browserInstance: wdio.Browser<'async'>): BrowseTheWebWithWebdriverIO {
        return new BrowseTheWebWithWebdriverIO(browserInstance);
    }

    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    /**
     * @param {@wdio/types~Browser} browser
     */
    constructor(protected readonly browser: wdio.Browser<'async'>) {
        super(new Map()
            .set(ByCss,                 (selector: ByCss)               => WebdriverIOLocator.createRootLocator(this.browser, selector, selector.value))
            .set(ByCssContainingText,   (selector: ByCssContainingText) => WebdriverIOLocator.createRootLocator(this.browser, selector, `${ selector.value }*=${ selector.text }`))
            .set(ById,                  (selector: ById)                => WebdriverIOLocator.createRootLocator(this.browser, selector, `#${ selector.value }`))
            .set(ByTagName,             (selector: ByTagName)           => WebdriverIOLocator.createRootLocator(this.browser, selector, `<${ selector.value } />`))
            .set(ByXPath,               (selector: ByXPath)             => WebdriverIOLocator.createRootLocator(this.browser, selector, selector.value))
        );

        if (! this.browser.$ || ! this.browser.$$) {
            throw new LogicError(`WebdriverIO browser object is not initialised yet, so can't be assigned to an actor. Are you trying to instantiate an actor outside of a test or a test hook?`)
        }
    }

    browserCapabilities(): Promise<BrowserCapabilities> {
        return Promise.resolve(this.browser.capabilities as BrowserCapabilities);
    }

    async cookie(name: string): Promise<Cookie> {
        return new WebdriverIOCookie(this.browser, name);
    }

    async setCookie(cookieData: CookieData): Promise<void> {
        return this.browser.setCookies({
            name:       cookieData.name,
            value:      cookieData.value,
            path:       cookieData.path,
            domain:     cookieData.domain,
            secure:     cookieData.secure,
            httpOnly:   cookieData.httpOnly,
            expiry:     cookieData.expiry
                ? cookieData.expiry.toSeconds()
                : undefined,
            sameSite:   cookieData.sameSite,
        });
    }

    deleteAllCookies(): Promise<void> {
        return this.browser.deleteCookies() as Promise<void>;
    }

    /**
     * @desc
     *  Navigate to a given destination, specified as an absolute URL
     *  or a path relative to WebdriverIO `baseUrl`.
     *
     * @param {string} destination
     * @returns {Promise<void>}
     */
    navigateTo(destination: string): Promise<void> {
        return this.browser.url(destination) as any;  // todo: check if this returns a string or is mistyped
    }

    navigateBack(): Promise<void> {
        return this.browser.back();
    }

    navigateForward(): Promise<void> {
        return this.browser.forward();
    }

    reloadPage(): Promise<void> {
        return this.browser.refresh();
    }

    /**
     * @desc
     *  Returns a {@link Page} representing the currently active top-level browsing context.
     *
     * @returns {Promise<Page>}
     */
    async currentPage(): Promise<Page> {

        const windowHandle = await this.browser.getWindowHandle();

        return new WebdriverIOPage(this.browser, windowHandle);
    }

    /**
     * @desc
     *  Returns an array of {@link Page} objects representing all the available
     *  top-level browsing context, e.g. all the open browser tabs.
     *
     * @returns {Promise<Array<Page>>}
     */
    async allPages(): Promise<Array<Page>> {
        const windowHandles = await this.browser.getWindowHandles();

        return windowHandles.map(windowHandle => new WebdriverIOPage(this.browser, windowHandle));
    }

    async frame(bySelector: Selector): Promise<Frame<any>> {
        const locator = this.locate(bySelector);
        return new WebdriverIOFrame(this.browser, locator);
    }

    async modalDialog(): Promise<ModalDialog> {
        return new WebdriverIOModalDialog(this.browser);
    }

    /**
     * @desc
     *  Send a sequence of {@link Key} strokes to the active element.
     *
     * @param {Array<Key | string>} keys
     *  Keys to enter
     *
     * @returns {Promise<void>}
     *
     * @see https://webdriver.io/docs/api/browser/keys/
     */
    sendKeys(keys: Array<Key | string>): Promise<void> {
        const keySequence = keys.map(key => {
            if (! Key.isKey(key)) {
                return key;
            }

            if (this.browser.isDevTools) {
                return key.devtoolsName;
            }

            return key.utf16codePoint;
        });

        return this.browser.keys(keySequence);
    }

    /**
     * @desc
     *  Take a screenshot of the top-level browsing context's viewport.
     *
     * @return {Promise<string>}
     *  A promise that will resolve to a base64-encoded screenshot PNG
     */
    takeScreenshot(): Promise<string> {
        return this.browser.takeScreenshot();
    }

    /**
     * @desc
     *  Schedules a command to execute JavaScript in the context of the currently selected frame or window.
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
    async executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result> {
        const nativeArguments = await Promise.all(args.map(arg => arg instanceof WebdriverIOPageElement ? arg.nativeElement() : arg)) as InnerArguments;

        return this.browser.execute(script, ...nativeArguments)
            .then(result => {
                this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
                    result,
                );
                return result;
            });
    }

    /**
     * @desc
     *  Schedules a command to execute asynchronous JavaScript in the context of the currently selected frame or window.
     *  The script fragment will be executed as the body of an anonymous function.
     *  If the script is provided as a function object, that function will be converted to a string for injection
     *  into the target window.
     *
     *  Any arguments provided in addition to the script will be included as script arguments and may be referenced
     *  using the `arguments` object. Arguments may be a `boolean`, `number`, `string` or `WebElement`
     *  Arrays and objects may also be used as script arguments as long as each item adheres
     *  to the types previously mentioned.
     *
     *  Unlike executing synchronous JavaScript with {@link BrowseTheWebWithWebdriverIO#executeScript},
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
    async executeAsyncScript<Result, Parameters extends any[]>(
        script: string | ((...args: [...parameters: Parameters, callback: (result: Result) => void]) => void),
        ...args: Parameters
    ): Promise<Result> {
        const nativeArguments = await Promise.all(args.map(arg => arg instanceof WebdriverIOPageElement ? arg.nativeElement() : arg)) as Parameters;

        return this.browser.executeAsync<Result, Parameters>(script, ...nativeArguments)
            .then(result => {
                this.lastScriptExecutionSummary = new LastScriptExecutionSummary<Result>(
                    result,
                );
                return result;
            });
    }

    /**
     * @desc
     *  Returns the last result of calling {@link BrowseTheWebWithWebdriverIO#executeAsyncScript}
     *  or {@link BrowseTheWebWithWebdriverIO#executeScript}
     *
     * @returns {any}
     */
    lastScriptExecutionResult<Result = any>(): Result {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        // Selenium returns `null` when the script it executed returns `undefined`
        // so we're mapping the result back.
        return this.lastScriptExecutionSummary.result !== null
            ? this.lastScriptExecutionSummary.result as Result
            : undefined;
    }

    waitFor(duration: Duration): Promise<void> {
        return this.browser.pause(duration.inMilliseconds()) as Promise<void>;
    }

    waitUntil(condition: () => boolean | Promise<boolean>, timeout: Duration): Promise<void>  {
        return this.browser.waitUntil(condition, {
            timeout:    timeout.inMilliseconds(),
            timeoutMsg: `Wait timed out after ${ timeout }`,
        }) as Promise<void>;
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary<Result = any> {
    constructor(public readonly result: Result) {}
}
